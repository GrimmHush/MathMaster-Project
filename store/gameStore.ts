import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateProblem, MathProblem } from '../lib/mathEngine';
import { GAME_CONFIG, ACHIEVEMENTS, calculateLevel } from '../config/gameConfig';
import { soundFx } from '../lib/audioEngine';

export type AgeGroup = '6-10' | '11-14' | 'neutral';

interface Mistake {
  problem: MathProblem;
  selectedAnswer: number | null;
  timeSpentSec: number;
}

interface GameState {
  // Session / User Profile State
  isGuest: boolean;
  username: string | null;
  totalXP: number;
  level: number;
  unlockedTrophies: string[];
  lifetimeCorrect: number;
  lifetimeAttempted: number;
  globalStreak: number;
  lastPlayedDate: string | null;
  inferredAge: AgeGroup;
  currentView: 'landing' | 'dashboard' | 'game';
  targetAge: '6-10' | '11-14' | null;
  
  // Active Round State
  isActiveRound: boolean;
  timeRemaining: number;
  currentProblem: MathProblem | null;
  roundScore: number;
  roundStreak: number;
  roundMistakes: Mistake[];
  roundCorrectCount: number;
  roundQuestionsAttempted: number;
  
  // Actions
  navigate: (view: 'landing' | 'dashboard' | 'game') => void;
  setTargetAge: (age: '6-10' | '11-14') => void;
  startRound: () => void;
  submitAnswer: (answer: number | null, timeSpent: number) => void;
  tickTimer: () => void;
  endRound: () => void;
  checkAchievements: () => void;
  evaluateAgeGroup: () => void;
  resetDailyStreakIfNeeded: () => void;
  resetGuestSession: () => void;
  setUsername: (name: string) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial Profile State
      currentView: 'landing',
      isGuest: true,
      username: null,
      totalXP: 0,
      level: 1,
      unlockedTrophies: [],
      lifetimeCorrect: 0,
      lifetimeAttempted: 0,
      globalStreak: 0,
      lastPlayedDate: null,
      inferredAge: 'neutral',
      targetAge: null,

      // Initial Round State
      isActiveRound: false,
      timeRemaining: GAME_CONFIG.ROUND_DURATION_SEC,
      currentProblem: null,
      roundScore: 0,
      roundStreak: 0,
      roundMistakes: [],
      roundCorrectCount: 0,
      roundQuestionsAttempted: 0,

      resetGuestSession: () => set({ 
        totalXP: 0, 
        level: 1, 
        globalStreak: 0, 
        lifetimeAttempted: 0, 
        lifetimeCorrect: 0, 
        unlockedTrophies: [],
        targetAge: null,
        currentView: 'landing',
        lastPlayedDate: null // <-- FIX: Wipes the date memory!
      }),

      navigate: (view) => set({ currentView: view }),

      setTargetAge: (age) => set({ targetAge: age }),

      setUsername: (name: string) => set({ username: name, isGuest: false }),
      
      logout: () => {
        localStorage.removeItem('accessToken');
        set({
          isGuest: true,
          username: null,
          totalXP: 0,
          level: 1,
          globalStreak: 0,
          lifetimeAttempted: 0,
          lifetimeCorrect: 0,
          unlockedTrophies: [],
          targetAge: null,
          currentView: 'landing',
          lastPlayedDate: null // <-- FIX: Wipes the date memory here too!
        });
      },

      resetDailyStreakIfNeeded: () => {
        const { lastPlayedDate, globalStreak } = get();
        if (!lastPlayedDate) return;

        const lastPlayed = new Date(lastPlayedDate);
        const today = new Date();
        const daysDiff = Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - 
                         Date.UTC(lastPlayed.getUTCFullYear(), lastPlayed.getUTCMonth(), lastPlayed.getUTCDate())) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1 && globalStreak > 0) {
          set({ globalStreak: 0 });
        }
      },

      startRound: () => {
        get().resetDailyStreakIfNeeded();
        
        // Grab the active age group, defaulting to inferred if target is missing
        const activeAge = get().targetAge || get().inferredAge || 'neutral';
        
        set({
          isActiveRound: true,
          currentView: 'game',
          timeRemaining: GAME_CONFIG.ROUND_DURATION_SEC,
          roundScore: 0,
          roundStreak: 0,
          roundMistakes: [],
          roundCorrectCount: 0,
          roundQuestionsAttempted: 0,
          // Pass the player's level and age directly to the engine
          currentProblem: generateProblem(get().level, activeAge)
        });
      },

      tickTimer: () => {
        const { timeRemaining, isActiveRound, endRound } = get();
        if (!isActiveRound) return;
        
        if (timeRemaining <= 1) {
          endRound();
        } else {
          set({ timeRemaining: timeRemaining - 1 });
        }
      },

      submitAnswer: (answer, timeSpent) => {
        const state = get();
        if (!state.currentProblem || !state.isActiveRound) return;

        const isCorrect = answer === state.currentProblem.correctAnswer;
        const newQuestionsAttempted = state.roundQuestionsAttempted + 1;
        
        let newScore = state.roundScore;
        let newStreak = state.roundStreak;
        let newCorrectCount = state.roundCorrectCount;
        let newMistakes = [...state.roundMistakes];

        if (isCorrect) {
          soundFx.playCorrect();
          newStreak += 1;
          newCorrectCount += 1;
          
          const speedBonus = GAME_CONFIG.MAX_SPEED_BONUS * (state.timeRemaining / GAME_CONFIG.ROUND_DURATION_SEC);
          const streakMult = Math.min(1 + (newStreak * GAME_CONFIG.STREAK_MULTIPLIER_STEP), GAME_CONFIG.MAX_STREAK_MULTIPLIER);
          const pointsEarned = Math.floor((GAME_CONFIG.BASE_XP_PER_CORRECT + speedBonus) * streakMult);
          
          newScore += pointsEarned;
        } else {
          soundFx.playIncorrect();
          newStreak = 0;
          newMistakes.push({
            problem: state.currentProblem,
            selectedAnswer: answer,
            timeSpentSec: timeSpent
          });
        }

        const activeAge = state.targetAge || state.inferredAge || 'neutral';
        
        set({
          roundScore: newScore,
          roundStreak: newStreak,
          roundCorrectCount: newCorrectCount,
          roundMistakes: newMistakes,
          roundQuestionsAttempted: newQuestionsAttempted,
          // Generate the next problem using the player's current level
          currentProblem: generateProblem(state.level, activeAge)
        });
      },

      endRound: () => {
        const state = get();
        const newTotalXP = state.totalXP + state.roundScore;
        const newLevel = calculateLevel(newTotalXP);
        
        if (newLevel > state.level) {
          soundFx.playLevelUp();
        }

        const today = new Date();
        const todayStr = today.toDateString(); // Simplified date comparison

        let newGlobalStreak = state.globalStreak;
        
        if (!state.lastPlayedDate) {
          // First time playing ever
          newGlobalStreak = 1;
        } else {
          const lastDate = new Date(state.lastPlayedDate).toDateString();
          if (lastDate !== todayStr) {
            // It is a new day, increment streak
            newGlobalStreak += 1;
          }
          // If lastDate === todayStr, we stay at the current streak
        }

        set({
          currentView: 'dashboard',
          isActiveRound: false,
          currentProblem: null,
          timeRemaining: 0,
          totalXP: newTotalXP,
          level: newLevel,
          lifetimeCorrect: state.lifetimeCorrect + state.roundCorrectCount,
          lifetimeAttempted: state.lifetimeAttempted + state.roundQuestionsAttempted,
          lastPlayedDate: today.toISOString(),
          globalStreak: newGlobalStreak 
        });

        get().evaluateAgeGroup();
        get().checkAchievements();
      },

      evaluateAgeGroup: () => {
        const state = get();
        if (state.inferredAge !== 'neutral' || state.lifetimeAttempted < 10) return;

        const accuracy = state.lifetimeCorrect / state.lifetimeAttempted;
        if (accuracy > 0.8) {
          set({ inferredAge: '11-14' });
        } else {
          set({ inferredAge: '6-10' });
        }
      },

      checkAchievements: () => {
        const state = get();
        const newTrophies = [...state.unlockedTrophies];
        
        ACHIEVEMENTS.forEach(ach => {
          if (newTrophies.includes(ach.id)) return;
          
          let achieved = false;
          if (ach.type === 'xp' && state.totalXP >= ach.threshold) achieved = true;
          if (ach.type === 'volume' && state.lifetimeAttempted >= ach.threshold) achieved = true;
          if (ach.type === 'streak' && state.roundStreak >= ach.threshold) achieved = true;
          if (ach.type === 'accuracy' && state.roundQuestionsAttempted > 5 && state.roundMistakes.length === 0) achieved = true;

          if (achieved) {
            newTrophies.push(ach.id);
          }
        });

        set({ unlockedTrophies: newTrophies });
      }
    }),
    {
      name: 'math-game-storage',
      partialize: (state) => ({
        isGuest: state.isGuest,
        username: state.username,
        totalXP: state.totalXP,
        level: state.level,
        unlockedTrophies: state.unlockedTrophies,
        lifetimeCorrect: state.lifetimeCorrect,
        lifetimeAttempted: state.lifetimeAttempted,
        globalStreak: state.globalStreak,
        lastPlayedDate: state.lastPlayedDate,
        inferredAge: state.inferredAge,
        targetAge: state.targetAge
      }),
    }
  )
);