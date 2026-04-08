module.exports = [
"[project]/lib/mathEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateProblem",
    ()=>generateProblem
]);
const generateProblem = (playerLevel, ageGroup)=>{
    // Determine internal tier based on player level (caps at Tier 5)
    const tier = Math.min(5, Math.ceil(playerLevel / 3));
    let num1 = 0, num2 = 0, correctAnswer = 0, op = '+';
    if (ageGroup === '6-10' || ageGroup === 'neutral' && tier <= 2) {
        // Division added at Tier 4+, Multiplication at Tier 3+
        const ops = tier >= 4 ? [
            '+',
            '-',
            '×',
            '÷'
        ] : tier >= 3 ? [
            '+',
            '-',
            '×'
        ] : [
            '+',
            '-'
        ];
        op = ops[Math.floor(Math.random() * ops.length)];
        if (op === '+') {
            const max = tier * 10;
            num1 = Math.floor(Math.random() * max) + 1;
            num2 = Math.floor(Math.random() * max) + 1;
            correctAnswer = num1 + num2;
        } else if (op === '-') {
            const max = tier * 12;
            num1 = Math.floor(Math.random() * max) + 5;
            num2 = Math.floor(Math.random() * num1) + 1;
            correctAnswer = num1 - num2;
        } else if (op === '×') {
            const maxMultiplier = tier + 5;
            num1 = Math.floor(Math.random() * maxMultiplier) + 1;
            num2 = Math.floor(Math.random() * maxMultiplier) + 1;
            correctAnswer = num1 * num2;
        } else if (op === '÷') {
            // Rookie Division: divisors and quotients kept under 10
            const quotient = Math.floor(Math.random() * 8) + 2;
            num2 = Math.floor(Math.random() * 8) + 2;
            num1 = quotient * num2;
            correctAnswer = quotient;
        }
    } else {
        const ops = tier > 2 ? [
            '+',
            '-',
            '×',
            '÷'
        ] : [
            '+',
            '-',
            '×'
        ];
        op = ops[Math.floor(Math.random() * ops.length)];
        if (op === '+') {
            const max = 50 + tier * 50; // Tier 1: 100, Tier 5: 300
            num1 = Math.floor(Math.random() * max) + 10;
            num2 = Math.floor(Math.random() * max) + 10;
            // Introduce negative numbers at higher tiers
            if (tier > 3 && Math.random() > 0.5) num2 *= -1;
            correctAnswer = num1 + num2;
        } else if (op === '-') {
            const max = 50 + tier * 50;
            num1 = Math.floor(Math.random() * max) + 10;
            num2 = Math.floor(Math.random() * max) + 10;
            if (tier > 2 && Math.random() > 0.7) num1 *= -1;
            correctAnswer = num1 - num2;
        } else if (op === '×') {
            const max = 10 + tier * 5; // Tier 1: 15x15, Tier 5: 35x35
            num1 = Math.floor(Math.random() * max) + 2;
            num2 = Math.floor(Math.random() * max) + 2;
            if (tier > 3 && Math.random() > 0.8) num2 *= -1;
            correctAnswer = num1 * num2;
        } else if (op === '÷') {
            // Reverse-engineer division to guarantee whole numbers
            const maxDivisor = 5 + tier * 3;
            correctAnswer = Math.floor(Math.random() * 20) + 2;
            num2 = Math.floor(Math.random() * maxDivisor) + 2;
            num1 = correctAnswer * num2;
        }
    }
    // ==========================================
    // DISTRACTOR GENERATOR
    // ==========================================
    const numDistractors = ageGroup === '11-14' ? 3 : 2;
    const options = new Set([
        correctAnswer
    ]);
    let failsafe = 0;
    while(options.size < numDistractors + 1){
        failsafe++;
        const variance = Math.max(5, Math.floor(Math.abs(correctAnswer) * 0.2));
        const direction = Math.random() > 0.5 ? 1 : -1;
        let distractor = correctAnswer + (Math.floor(Math.random() * variance) + 1) * direction;
        // Protect Rookie mode from generating negative distractors
        if (distractor < 0 && ageGroup === '6-10') distractor = Math.abs(distractor);
        options.add(distractor);
        if (failsafe > 50) options.add(correctAnswer + failsafe);
    }
    const shuffledOptions = Array.from(options).sort(()=>Math.random() - 0.5);
    return {
        num1,
        num2,
        operation: op,
        correctAnswer,
        options: shuffledOptions,
        difficultyTier: tier
    };
};
}),
"[project]/config/gameConfig.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACHIEVEMENTS",
    ()=>ACHIEVEMENTS,
    "GAME_CONFIG",
    ()=>GAME_CONFIG,
    "calculateLevel",
    ()=>calculateLevel
]);
const GAME_CONFIG = {
    ROUND_DURATION_SEC: 60,
    BASE_XP_PER_CORRECT: 10,
    MAX_SPEED_BONUS: 20,
    BASE_LEVEL_XP: 100,
    STREAK_MULTIPLIER_STEP: 0.1,
    MAX_STREAK_MULTIPLIER: 2.5
};
const ACHIEVEMENTS = [
    {
        id: 'first_blood',
        title: 'First Blood',
        description: 'Answer your first question correctly',
        type: 'volume',
        threshold: 1,
        icon: '🎯'
    },
    {
        id: 'streak_10',
        title: 'Streak Master',
        description: 'Get 10 correct answers in a row',
        type: 'streak',
        threshold: 10,
        icon: '🔥'
    },
    {
        id: 'math_wizard',
        title: 'Math Wizard',
        description: 'Earn your first 500 XP',
        type: 'xp',
        threshold: 500,
        icon: '🧙‍♂️'
    },
    {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Answer correctly with 55+ seconds left',
        type: 'speed',
        threshold: 55,
        icon: '⚡'
    },
    {
        id: 'accuracy_king',
        title: 'Sharpshooter',
        description: 'Finish a round with 100% accuracy',
        type: 'accuracy',
        threshold: 100,
        icon: '👑'
    }
];
const calculateLevel = (totalXp)=>{
    if (totalXp <= 0) return 1;
    // totalXP = Level^2 * BASE_LEVEL_XP => Level = sqrt(totalXP / BASE_LEVEL_XP)
    const level = Math.floor(Math.sqrt(totalXp / GAME_CONFIG.BASE_LEVEL_XP));
    return Math.max(1, level); // Minimum level 1
};
}),
"[project]/lib/audioEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "soundFx",
    ()=>soundFx
]);
class AudioEngine {
    ctx = null;
    init() {
        if (!this.ctx && ("TURBOPACK compile-time value", "undefined") !== 'undefined') //TURBOPACK unreachable
        ;
    }
    playCorrect() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1); // A5
        gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
    playIncorrect() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
    playLevelUp() {
        this.init();
        // Save to a local constant so TypeScript knows it won't change to null inside the loop
        const ctx = this.ctx;
        if (!ctx) return;
        // Simple arpeggio for level up
        [
            440,
            554.37,
            659.25,
            880
        ].forEach((freq, i)=>{
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            const startTime = ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }
    // Add these methods inside your AudioEngine class
    playHover() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime); // High pitch tick
        // Very quiet, very fast decay
        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }
    playClick() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
    playRoundStart() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2); // Pitch up sweep
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}
const soundFx = new AudioEngine();
}),
"[project]/store/gameStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGameStore",
    ()=>useGameStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mathEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mathEngine.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/gameConfig.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioEngine.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const useGameStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
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
        timeRemaining: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC,
        currentProblem: null,
        roundScore: 0,
        roundStreak: 0,
        roundMistakes: [],
        roundCorrectCount: 0,
        roundQuestionsAttempted: 0,
        resetGuestSession: ()=>set({
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
        navigate: (view)=>set({
                currentView: view
            }),
        setTargetAge: (age)=>set({
                targetAge: age
            }),
        setUsername: (name)=>set({
                username: name,
                isGuest: false
            }),
        logout: ()=>{
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
        resetDailyStreakIfNeeded: ()=>{
            const { lastPlayedDate, globalStreak } = get();
            if (!lastPlayedDate) return;
            const lastPlayed = new Date(lastPlayedDate);
            const today = new Date();
            const daysDiff = Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - Date.UTC(lastPlayed.getUTCFullYear(), lastPlayed.getUTCMonth(), lastPlayed.getUTCDate())) / (1000 * 60 * 60 * 24));
            if (daysDiff > 1 && globalStreak > 0) {
                set({
                    globalStreak: 0
                });
            }
        },
        startRound: ()=>{
            get().resetDailyStreakIfNeeded();
            // Grab the active age group, defaulting to inferred if target is missing
            const activeAge = get().targetAge || get().inferredAge || 'neutral';
            set({
                isActiveRound: true,
                currentView: 'game',
                timeRemaining: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC,
                roundScore: 0,
                roundStreak: 0,
                roundMistakes: [],
                roundCorrectCount: 0,
                roundQuestionsAttempted: 0,
                // Pass the player's level and age directly to the engine
                currentProblem: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mathEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateProblem"])(get().level, activeAge)
            });
        },
        tickTimer: ()=>{
            const { timeRemaining, isActiveRound, endRound } = get();
            if (!isActiveRound) return;
            if (timeRemaining <= 1) {
                endRound();
            } else {
                set({
                    timeRemaining: timeRemaining - 1
                });
            }
        },
        submitAnswer: (answer, timeSpent)=>{
            const state = get();
            if (!state.currentProblem || !state.isActiveRound) return;
            const isCorrect = answer === state.currentProblem.correctAnswer;
            const newQuestionsAttempted = state.roundQuestionsAttempted + 1;
            let newScore = state.roundScore;
            let newStreak = state.roundStreak;
            let newCorrectCount = state.roundCorrectCount;
            let newMistakes = [
                ...state.roundMistakes
            ];
            if (isCorrect) {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playCorrect();
                newStreak += 1;
                newCorrectCount += 1;
                const speedBonus = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].MAX_SPEED_BONUS * (state.timeRemaining / __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC);
                const streakMult = Math.min(1 + newStreak * __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].STREAK_MULTIPLIER_STEP, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].MAX_STREAK_MULTIPLIER);
                const pointsEarned = Math.floor((__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].BASE_XP_PER_CORRECT + speedBonus) * streakMult);
                newScore += pointsEarned;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playIncorrect();
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
                currentProblem: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mathEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateProblem"])(state.level, activeAge)
            });
        },
        endRound: ()=>{
            const state = get();
            const newTotalXP = state.totalXP + state.roundScore;
            const newLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateLevel"])(newTotalXP);
            if (newLevel > state.level) {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playLevelUp();
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
        evaluateAgeGroup: ()=>{
            const state = get();
            if (state.inferredAge !== 'neutral' || state.lifetimeAttempted < 10) return;
            const accuracy = state.lifetimeCorrect / state.lifetimeAttempted;
            if (accuracy > 0.8) {
                set({
                    inferredAge: '11-14'
                });
            } else {
                set({
                    inferredAge: '6-10'
                });
            }
        },
        checkAchievements: ()=>{
            const state = get();
            const newTrophies = [
                ...state.unlockedTrophies
            ];
            __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACHIEVEMENTS"].forEach((ach)=>{
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
            set({
                unlockedTrophies: newTrophies
            });
        }
    }), {
    name: 'math-game-storage',
    partialize: (state)=>({
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
        })
}));
}),
"[project]/components/AuthModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthModal",
    ()=>AuthModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioEngine.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const AuthModal = ({ isOpen, onClose })=>{
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('register');
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        setIsLoading(true);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playClick();
        const currentState = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"].getState();
        try {
            const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
            const body = mode === 'register' ? {
                email,
                username,
                password,
                totalXP: currentState.totalXP,
                level: currentState.level,
                globalStreak: currentState.globalStreak,
                lifetimeCorrect: currentState.lifetimeCorrect,
                lifetimeAttempted: currentState.lifetimeAttempted,
                targetAge: currentState.targetAge,
                // ADDED: Send unlocked trophies to the backend
                unlockedTrophies: currentState.unlockedTrophies
            } : {
                email,
                password
            };
            const res = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }
            localStorage.setItem('accessToken', data.accessToken);
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"].setState({
                isGuest: false,
                username: data.user.username,
                totalXP: mode === 'register' ? currentState.totalXP : data.user.total_xp || 0,
                level: mode === 'register' ? currentState.level : data.user.level || 1,
                globalStreak: mode === 'register' ? currentState.globalStreak : data.user.global_streak || 0,
                lifetimeCorrect: mode === 'register' ? currentState.lifetimeCorrect : data.user.lifetime_correct || 0,
                lifetimeAttempted: mode === 'register' ? currentState.lifetimeAttempted : data.user.lifetime_attempted || 0,
                targetAge: mode === 'register' ? currentState.targetAge : data.user.target_age || data.user.targetAge || null,
                // ADDED: Restore trophies from the database
                unlockedTrophies: mode === 'register' ? currentState.unlockedTrophies : data.user.unlocked_trophies || []
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playLevelUp();
            onClose();
        } catch (err) {
            setError(err.message);
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playIncorrect();
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(147,51,234,0.15)] relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                        onClose();
                    },
                    className: "absolute top-6 right-6 text-gray-500 hover:text-white transition-colors",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "w-6 h-6"
                    }, void 0, false, {
                        fileName: "[project]/components/AuthModal.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 87,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-3xl font-bold text-white mb-2",
                    children: mode === 'register' ? 'Save Progress' : 'Welcome Back'
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400 mb-8",
                    children: mode === 'register' ? 'Create an account to lock in your XP and climb the leaderboards.' : 'Log in to continue your streak.'
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 102,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4",
                    children: [
                        mode === 'register' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                    className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 110,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    required: true,
                                    placeholder: "Username",
                                    value: username,
                                    onChange: (e)=>setUsername(e.target.value),
                                    className: "w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 109,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                    className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "email",
                                    required: true,
                                    placeholder: "Email Address",
                                    value: email,
                                    onChange: (e)=>setEmail(e.target.value),
                                    className: "w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "password",
                                    required: true,
                                    placeholder: "Password",
                                    value: password,
                                    onChange: (e)=>setPassword(e.target.value),
                                    className: "w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: isLoading,
                            type: "submit",
                            className: "w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50",
                            children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-6 h-6 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/AuthModal.tsx",
                                lineNumber: 131,
                                columnNumber: 26
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    mode === 'register' ? 'Create Account' : 'Log In',
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AuthModal.tsx",
                                        lineNumber: 132,
                                        columnNumber: 69
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 text-center text-gray-500 text-sm",
                    children: [
                        mode === 'register' ? 'Already have an account? ' : "Don't have an account? ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>{
                                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                                setMode(mode === 'register' ? 'login' : 'register');
                                setError('');
                            },
                            className: "text-cyan-400 hover:text-cyan-300 font-bold transition-colors",
                            children: mode === 'register' ? 'Log in' : 'Sign up'
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/AuthModal.tsx",
            lineNumber: 86,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/AuthModal.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/LandingPage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LandingPage",
    ()=>LandingPage,
    "backgroundSymbols",
    ()=>backgroundSymbols
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rocket.js [app-ssr] (ecmascript) <export default as Rocket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crosshair.js [app-ssr] (ecmascript) <export default as Crosshair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-ssr] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioEngine.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
const backgroundSymbols = [
    {
        sym: '+',
        left: '10%',
        top: '20%',
        size: '80px',
        delay: '0s',
        dur: '12s'
    },
    {
        sym: '×',
        left: '80%',
        top: '15%',
        size: '90px',
        delay: '-2s',
        dur: '14s'
    },
    {
        sym: '÷',
        left: '70%',
        top: '80%',
        size: '70px',
        delay: '-5s',
        dur: '10s'
    },
    {
        sym: '-',
        left: '20%',
        top: '75%',
        size: '85px',
        delay: '-1s',
        dur: '13s'
    },
    {
        sym: '1',
        left: '40%',
        top: '10%',
        size: '60px',
        delay: '-8s',
        dur: '15s'
    },
    {
        sym: '2',
        left: '55%',
        top: '85%',
        size: '95px',
        delay: '-3s',
        dur: '11s'
    },
    {
        sym: '3',
        left: '85%',
        top: '45%',
        size: '75px',
        delay: '-6s',
        dur: '14s'
    },
    {
        sym: '=',
        left: '15%',
        top: '45%',
        size: '100px',
        delay: '-4s',
        dur: '16s'
    },
    {
        sym: '4',
        left: '30%',
        top: '30%',
        size: '65px',
        delay: '-7s',
        dur: '12s'
    },
    {
        sym: '5',
        left: '60%',
        top: '35%',
        size: '85px',
        delay: '-2.5s',
        dur: '13s'
    },
    {
        sym: '8',
        left: '50%',
        top: '60%',
        size: '70px',
        delay: '-9s',
        dur: '10s'
    },
    {
        sym: '+',
        left: '85%',
        top: '85%',
        size: '90px',
        delay: '-1.5s',
        dur: '15s'
    },
    {
        sym: '÷',
        left: '5%',
        top: '5%',
        size: '65px',
        delay: '-4.5s',
        dur: '12s'
    },
    {
        sym: '9',
        left: '40%',
        top: '90%',
        size: '80px',
        delay: '-0.5s',
        dur: '11s'
    },
    {
        sym: '-',
        left: '90%',
        top: '5%',
        size: '75px',
        delay: '-3.5s',
        dur: '14s'
    }
];
const RookieBackground = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 bg-gradient-to-br from-lime-100 to-violet-100 overflow-hidden pointer-events-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `
      @keyframes gentleFloat {
        0%, 100% { transform: translateY(0) rotate(-5deg); }
        50% { transform: translateY(-40px) rotate(5deg); }
      }
    `
                }
            }, void 0, false, {
                fileName: "[project]/components/LandingPage.tsx",
                lineNumber: 27,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            backgroundSymbols.map((item, i)=>{
                const colors = [
                    'text-violet-400/30',
                    'text-sky-400/30',
                    'text-lime-500/30',
                    'text-orange-400/30'
                ];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `absolute font-black ${colors[i % colors.length]} drop-shadow-sm`,
                    style: {
                        fontSize: item.size,
                        left: item.left,
                        top: item.top,
                        animation: `gentleFloat ${item.dur} ease-in-out infinite`,
                        animationDelay: item.delay
                    },
                    children: item.sym
                }, i, false, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0));
            })
        ]
    }, void 0, true, {
        fileName: "[project]/components/LandingPage.tsx",
        lineNumber: 26,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
// NEW: Vibrant Esports/Arcade Background for Pro Circuit
const ProBackground = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none",
        children: backgroundSymbols.map((item, i)=>{
            const colors = [
                'text-fuchsia-500/20',
                'text-cyan-400/20',
                'text-indigo-500/20',
                'text-violet-500/20'
            ];
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute font-black ${colors[i % colors.length]} animate-[pulse_4s_infinite] drop-shadow-[0_0_15px_currentColor]`,
                style: {
                    fontSize: item.size,
                    left: item.left,
                    top: item.top,
                    animationDelay: item.delay
                },
                children: item.sym
            }, i, false, {
                fileName: "[project]/components/LandingPage.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0));
        })
    }, void 0, false, {
        fileName: "[project]/components/LandingPage.tsx",
        lineNumber: 47,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const LandingPage = ()=>{
    const { startRound, setTargetAge, isGuest, totalXP, navigate, targetAge, inferredAge, username, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [isAuthModalOpen, setIsAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredArena, setHoveredArena] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleStart = (age)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playClick();
        setTargetAge(age);
        startRound();
    };
    const isRookieAge = (targetAge || inferredAge) === '6-10';
    // FIX: Proper 3-way toggle logic
    const showRookieTheme = hoveredArena === 'rookie' || hoveredArena === null && isRookieAge && targetAge !== null;
    const showProTheme = hoveredArena === 'pro' || hoveredArena === null && !isRookieAge && targetAge !== null;
    let title = "Choose Your Arena.";
    let subtitle = "Select your age group below to get started.";
    if (showRookieTheme) {
        title = "Let's Play Math!";
        subtitle = "Fun, colorful math puzzles to train your brain!";
    } else if (showProTheme) {
        title = "Ranked Circuit.";
        subtitle = "Fast-paced competitive math. Beat the high score!";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-1000",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute inset-0 transition-opacity duration-700 ${showRookieTheme ? 'opacity-100' : 'opacity-0'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RookieBackground, {}, void 0, false, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 91,
                    columnNumber: 124
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/LandingPage.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute inset-0 transition-opacity duration-700 ${!showRookieTheme ? 'opacity-100' : 'opacity-0'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProBackground, {}, void 0, false, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 92,
                    columnNumber: 125
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/LandingPage.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "absolute top-0 left-0 w-full p-6 flex justify-end z-50",
                children: isGuest ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setIsAuthModalOpen(true),
                    className: `flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${showRookieTheme ? 'bg-white text-sky-500 hover:bg-sky-50 border-4 border-sky-100' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-indigo-500/30'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        " Login / Save Progress"
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 96,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-indigo-500/30 shadow-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white font-bold",
                            children: [
                                "Welcome, ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-cyan-400",
                                    children: username
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 101,
                                    columnNumber: 61
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 101,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-px h-6 bg-slate-700"
                        }, void 0, false, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 102,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: logout,
                            className: "text-slate-400 hover:text-fuchsia-400 font-bold text-sm transition-colors",
                            children: "Log Out"
                        }, void 0, false, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 103,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 100,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/LandingPage.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-6xl w-full space-y-12 relative z-10 animate-in fade-in zoom-in-95 duration-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-6 min-h-[160px] pt-12",
                        children: [
                            showProTheme && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-2 px-5 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 font-bold tracking-widest uppercase text-sm mb-2 shadow-[0_0_15px_rgba(217,70,239,0.2)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"], {
                                        className: "w-4 h-4 animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LandingPage.tsx",
                                        lineNumber: 112,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " Competitive Mode"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: `text-5xl md:text-8xl font-black tracking-tight transition-colors duration-500 ${showRookieTheme ? 'text-gray-800 drop-shadow-sm' : 'text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-indigo-300 drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]'}`,
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-xl md:text-3xl font-medium max-w-2xl mx-auto transition-colors duration-500 ${showRookieTheme ? 'text-gray-600 drop-shadow-sm' : 'text-indigo-200/80'}`,
                                children: subtitle
                            }, void 0, false, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 118,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LandingPage.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    !isGuest || totalXP > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center pt-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                                navigate('dashboard');
                            },
                            className: `group relative flex items-center justify-center gap-3 px-12 py-6 rounded-3xl font-black text-2xl transition-all shadow-xl ${showRookieTheme ? 'bg-sky-400 hover:bg-sky-500 text-white border-b-[8px] border-sky-600 active:border-b-0 active:translate-y-2' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white hover:from-indigo-400 hover:to-fuchsia-500 transform hover:-translate-y-2 shadow-[0_0_40px_rgba(217,70,239,0.4)]'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                    fill: "currentColor",
                                    className: "w-8 h-8 group-hover:animate-bounce"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 126,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                "Enter Dashboard ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    className: "w-8 h-8"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 127,
                                    columnNumber: 31
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 125,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/LandingPage.tsx",
                        lineNumber: 124,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onMouseEnter: ()=>{
                                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playHover();
                                    setHoveredArena('rookie');
                                },
                                onMouseLeave: ()=>setHoveredArena(null),
                                onClick: ()=>handleStart('6-10'),
                                className: `group relative w-full text-left transition-all duration-500 ${hoveredArena === 'pro' ? 'opacity-40 scale-95' : 'scale-100'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative bg-white border-[8px] border-white/50 hover:border-white rounded-[3rem] p-10 h-full flex flex-col items-center text-center gap-6 transform group-hover:-translate-y-4 transition-all duration-300 shadow-[0_20px_0_rgba(0,0,0,0.1)]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(251,146,60,0.5)] group-hover:scale-110 transition-transform duration-500",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__["Rocket"], {
                                                className: "w-16 h-16 text-white ml-2 mb-2",
                                                fill: "currentColor"
                                            }, void 0, false, {
                                                fileName: "[project]/components/LandingPage.tsx",
                                                lineNumber: 136,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/LandingPage.tsx",
                                            lineNumber: 135,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-5xl font-black text-gray-800 mb-2",
                                                    children: "Rookie"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LandingPage.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-orange-500 font-bold text-2xl uppercase tracking-widest",
                                                    children: "Ages 6 - 10"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LandingPage.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LandingPage.tsx",
                                            lineNumber: 138,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 px-8 py-4 bg-orange-500 text-white font-black rounded-full text-xl flex items-center gap-2 shadow-[0_8px_0_rgba(194,65,12,1)] group-hover:translate-y-2 group-hover:shadow-[0_0px_0_rgba(194,65,12,1)] transition-all",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    className: "w-6 h-6"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LandingPage.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                " Play Now!"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LandingPage.tsx",
                                            lineNumber: 142,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 134,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onMouseEnter: ()=>{
                                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["soundFx"].playHover();
                                    setHoveredArena('pro');
                                },
                                onMouseLeave: ()=>setHoveredArena(null),
                                onClick: ()=>handleStart('11-14'),
                                className: `group relative w-full text-left transition-all duration-500 ${hoveredArena === 'rookie' ? 'opacity-40 scale-95' : 'scale-100'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/50 hover:border-fuchsia-400 rounded-[3rem] p-10 h-full flex flex-col items-center text-center gap-6 transform group-hover:-translate-y-4 transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(217,70,239,0.4)]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-32 h-32 bg-slate-800 border-2 border-cyan-400 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] group-hover:rotate-0 transition-all duration-500",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crosshair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crosshair$3e$__["Crosshair"], {
                                                className: "w-16 h-16 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                            }, void 0, false, {
                                                fileName: "[project]/components/LandingPage.tsx",
                                                lineNumber: 152,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/LandingPage.tsx",
                                            lineNumber: 151,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-5xl font-black text-white mb-2 drop-shadow-md",
                                                    children: "Pro Circuit"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LandingPage.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-fuchsia-400 font-bold text-2xl uppercase tracking-widest",
                                                    children: "Ages 11 - 14+"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LandingPage.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LandingPage.tsx",
                                            lineNumber: 154,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-black rounded-full text-xl group-hover:from-indigo-500 group-hover:to-fuchsia-500 transition-all shadow-[0_0_15px_rgba(217,70,239,0.5)]",
                                            children: "Enter Ranked Mode"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LandingPage.tsx",
                                            lineNumber: 158,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 150,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LandingPage.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthModal"], {
                        isOpen: isAuthModalOpen,
                        onClose: ()=>setIsAuthModalOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/LandingPage.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/LandingPage.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/LandingPage.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/GameInterface.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameInterface",
    ()=>GameInterface
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-ssr] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/gameConfig.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LandingPage.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
const RookieBackground = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 z-0 bg-gradient-to-br from-lime-100 to-violet-100 overflow-hidden pointer-events-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `@keyframes gentleFloat { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-40px) rotate(5deg); } }`
                }
            }, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 10,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["backgroundSymbols"].map((item, i)=>{
                const colors = [
                    'text-violet-400/20',
                    'text-sky-400/20',
                    'text-lime-500/20',
                    'text-orange-400/20'
                ];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `absolute font-black ${colors[i % colors.length]} drop-shadow-sm`,
                    style: {
                        fontSize: item.size,
                        left: item.left,
                        top: item.top,
                        animation: `gentleFloat ${item.dur} ease-in-out infinite`,
                        animationDelay: item.delay
                    },
                    children: item.sym
                }, i, false, {
                    fileName: "[project]/components/GameInterface.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0));
            })
        ]
    }, void 0, true, {
        fileName: "[project]/components/GameInterface.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
// NEW: Pro Circuit Game Background
const ProBackground = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none",
        children: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["backgroundSymbols"].map((item, i)=>{
            const colors = [
                'text-fuchsia-500/10',
                'text-cyan-400/10',
                'text-indigo-500/10',
                'text-violet-500/10'
            ];
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute font-black ${colors[i % colors.length]} animate-[pulse_4s_infinite] drop-shadow-[0_0_15px_currentColor]`,
                style: {
                    fontSize: item.size,
                    left: item.left,
                    top: item.top,
                    animationDelay: item.delay
                },
                children: item.sym
            }, i, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0));
        })
    }, void 0, false, {
        fileName: "[project]/components/GameInterface.tsx",
        lineNumber: 24,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const MathVisualizer = ({ problem })=>{
    const { num1, num2, operation, correctAnswer } = problem;
    if (num1 * num2 > 144 && operation === '×') return null;
    if (num1 > 50 && (operation === '+' || operation === '-')) return null;
    const Block = ({ color = 'bg-sky-300', crossedOut = false })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `w-4 h-4 md:w-5 md:h-5 rounded-md shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] border border-black/10 relative flex items-center justify-center ${color} ${crossedOut ? 'opacity-40 grayscale' : ''}`,
            children: crossedOut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                className: "w-full h-full text-red-500 absolute"
            }, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 43,
                columnNumber: 22
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/GameInterface.tsx",
            lineNumber: 42,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-8 p-4 bg-white/50 border-2 border-white rounded-2xl shadow-inner min-h-[100px] flex items-center justify-center w-full max-w-lg",
        children: [
            operation === '+' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1 justify-center max-w-[150px]",
                        children: Array.from({
                            length: num1
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                                color: "bg-sky-300"
                            }, `add1-${i}`, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 52,
                                columnNumber: 57
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-3xl font-black text-gray-300",
                        children: "+"
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1 justify-center max-w-[150px]",
                        children: Array.from({
                            length: num2
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                                color: "bg-lime-300"
                            }, `add2-${i}`, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 56,
                                columnNumber: 57
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 50,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            operation === '-' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-1 justify-center max-w-[300px]",
                children: [
                    Array.from({
                        length: correctAnswer
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                            color: "bg-sky-300"
                        }, `remain-${i}`, false, {
                            fileName: "[project]/components/GameInterface.tsx",
                            lineNumber: 62,
                            columnNumber: 64
                        }, ("TURBOPACK compile-time value", void 0))),
                    Array.from({
                        length: num2
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                            color: "bg-gray-400",
                            crossedOut: true
                        }, `taken-${i}`, false, {
                            fileName: "[project]/components/GameInterface.tsx",
                            lineNumber: 63,
                            columnNumber: 55
                        }, ("TURBOPACK compile-time value", void 0)))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            operation === '×' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-1 justify-center",
                style: {
                    gridTemplateColumns: `repeat(${num2}, minmax(0, 1fr))`
                },
                children: Array.from({
                    length: num1 * num2
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        color: "bg-violet-300"
                    }, `mult-${i}`, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 68,
                        columnNumber: 62
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            operation === '÷' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-4 justify-center",
                children: Array.from({
                    length: num2
                }).map((_, bucketIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 border-4 border-dashed border-sky-300 bg-sky-50 rounded-xl flex flex-wrap gap-1 w-16 h-16 md:w-20 md:h-20 items-center justify-center",
                        children: Array.from({
                            length: correctAnswer
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                                color: "bg-pink-300"
                            }, `block-${bucketIdx}-${i}`, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 75,
                                columnNumber: 68
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, `bucket-${bucketIdx}`, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 74,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/GameInterface.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const FireworkBurst = ({ delay = 0 })=>{
    const [exploded, setExploded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setTimeout(()=>setExploded(true), delay);
        return ()=>clearTimeout(timer);
    }, [
        delay
    ]);
    const colors = [
        'text-yellow-400',
        'text-orange-500',
        'text-cyan-400',
        'text-purple-500',
        'text-pink-500'
    ];
    const symbols = [
        '+',
        '-',
        '×',
        '÷',
        '=',
        '1',
        '2',
        '3'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50",
        children: [
            ...Array(16)
        ].map((_, i)=>{
            const angle = i * 22.5 * (Math.PI / 180);
            const distance = exploded ? 80 + i % 3 * 20 : 0;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute font-black text-2xl md:text-3xl ${colors[i % colors.length]} transition-all duration-700 ease-out flex items-center justify-center drop-shadow-[0_0_10px_currentColor]`,
                style: {
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(${exploded ? 0 : 1.2}) rotate(${exploded ? 180 : 0}deg)`,
                    opacity: exploded ? 0 : 1
                },
                children: symbols[i % symbols.length]
            }, `spark-${i}`, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 96,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0));
        })
    }, void 0, false, {
        fileName: "[project]/components/GameInterface.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const GameInterface = ()=>{
    const [visualFeedback, setVisualFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { currentProblem, timeRemaining, roundScore, roundStreak, submitAnswer, tickTimer, inferredAge, targetAge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [typedAnswer, setTypedAnswer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [inputMode, setInputMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('buttons');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setInterval(()=>tickTimer(), 1000);
        return ()=>clearInterval(timer);
    }, [
        tickTimer
    ]);
    if (!currentProblem) return null;
    const activeAge = targetAge || inferredAge;
    const isRookie = activeAge === '6-10';
    // REVAMPED PRO CLASSES
    const cardShape = isRookie ? 'rounded-[4rem] bg-white border-[16px] border-violet-200 shadow-[0_24px_0_rgba(139,92,246,0.3)]' : 'rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.2)]';
    const hudShape = isRookie ? 'rounded-full bg-violet-100 border-4 border-violet-200 shadow-inner' : 'rounded-2xl bg-slate-800/80 border border-indigo-500/30 shadow-lg';
    const problemFont = isRookie ? 'text-7xl md:text-9xl text-gray-900 font-black drop-shadow-lg' : 'text-5xl md:text-7xl text-white font-black tracking-widest drop-shadow-[0_0_20px_rgba(217,70,239,0.3)]';
    const buttonStyle = isRookie ? 'py-8 px-6 bg-sky-100 hover:bg-sky-500 border-4 border-sky-200 hover:border-sky-600 border-b-[14px] hover:border-b-[14px] rounded-[3rem] text-6xl font-black text-gray-900 hover:text-white transition-all active:border-b-4 active:translate-y-2 relative' : 'py-6 px-8 bg-slate-800 hover:bg-indigo-600 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-2xl text-4xl font-bold text-white transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(30,41,59)] hover:shadow-[0_8px_0_rgb(79,70,229)] active:translate-y-2 active:shadow-none relative';
    const textColor = isRookie ? 'text-gray-900' : 'text-slate-100';
    const handleAnswer = (answer)=>{
        const isCorrect = answer === currentProblem.correctAnswer;
        setVisualFeedback(isCorrect ? 'correct' : 'incorrect');
        const feedbackDuration = isCorrect && isRookie ? 1000 : 400;
        setTimeout(()=>{
            setVisualFeedback(null);
        }, feedbackDuration);
        submitAnswer(answer, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC - timeRemaining);
        setTypedAnswer('');
    };
    const handleFormSubmit = (e)=>{
        e.preventDefault();
        if (!typedAnswer.trim()) return;
        handleAnswer(Number(typedAnswer));
    };
    const timerColor = timeRemaining > 20 ? 'text-cyan-400' : timeRemaining > 10 ? 'text-yellow-400' : 'text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden",
        children: [
            isRookie ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RookieBackground, {}, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 160,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProBackground, {}, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 160,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-full max-w-4xl flex flex-col items-center p-6 md:p-12 transition-all duration-300 relative overflow-visible z-10 ${cardShape} ${visualFeedback === 'correct' ? isRookie ? 'border-green-400 shadow-[0_24px_0_rgba(74,222,128,1)]' : 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]' : visualFeedback === 'incorrect' ? isRookie ? 'border-red-400 shadow-[0_24px_0_rgba(248,113,113,1)]' : 'border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.5)]' : ''}`,
                children: [
                    isRookie && visualFeedback === 'correct' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -top-4 -left-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FireworkBurst, {
                                    delay: 0
                                }, void 0, false, {
                                    fileName: "[project]/components/GameInterface.tsx",
                                    lineNumber: 171,
                                    columnNumber: 54
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -top-4 -right-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FireworkBurst, {
                                    delay: 100
                                }, void 0, false, {
                                    fileName: "[project]/components/GameInterface.tsx",
                                    lineNumber: 172,
                                    columnNumber: 55
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-1/2 -left-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FireworkBurst, {
                                    delay: 150
                                }, void 0, false, {
                                    fileName: "[project]/components/GameInterface.tsx",
                                    lineNumber: 173,
                                    columnNumber: 55
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-1/2 -right-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FireworkBurst, {
                                    delay: 50
                                }, void 0, false, {
                                    fileName: "[project]/components/GameInterface.tsx",
                                    lineNumber: 174,
                                    columnNumber: 56
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -bottom-4 -left-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FireworkBurst, {
                                    delay: 200
                                }, void 0, false, {
                                    fileName: "[project]/components/GameInterface.tsx",
                                    lineNumber: 175,
                                    columnNumber: 57
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -bottom-4 -right-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FireworkBurst, {
                                    delay: 0
                                }, void 0, false, {
                                    fileName: "[project]/components/GameInterface.tsx",
                                    lineNumber: 176,
                                    columnNumber: 58
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true),
                    !isRookie && visualFeedback === 'correct' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                        className: "absolute top-8 right-8 w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[spin_0.3s_linear_1]"
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 180,
                        columnNumber: 55
                    }, ("TURBOPACK compile-time value", void 0)),
                    !isRookie && visualFeedback === 'incorrect' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                        className: "absolute top-8 right-8 w-12 h-12 text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] animate-[pulse_0.3s_ease-in-out_1]"
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 181,
                        columnNumber: 57
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `w-full max-w-3xl flex justify-between items-center mb-10 p-4 ${hudShape}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 md:gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                        className: `w-6 h-6 md:w-8 md:h-8 ${roundStreak > 2 ? isRookie ? 'text-orange-500 animate-bounce' : 'text-fuchsia-400 drop-shadow-[0_0_10px_currentColor] animate-pulse' : 'text-slate-500'}`
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 185,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-xl md:text-2xl font-bold ${textColor}`,
                                        children: roundStreak
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 186,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center gap-2 md:gap-3 ${timerColor}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                        className: "w-6 h-6 md:w-8 md:h-8"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 189,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-2xl md:text-3xl font-black",
                                        children: [
                                            timeRemaining,
                                            "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 190,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 md:gap-3",
                                children: [
                                    isRookie ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 border border-violet-200 shadow-inner rounded-full bg-violet-50 text-yellow-500 font-bold text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] flex items-center justify-center animate-[bounce_4s_infinite_ease-in-out]",
                                        children: "★"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 194,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                        className: "w-6 h-6 md:w-8 md:h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 195,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-xl md:text-2xl font-bold ${textColor}`,
                                        children: roundScore
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameInterface.tsx",
                                        lineNumber: 196,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mb-4 transition-all duration-200 ${problemFont}`,
                        children: [
                            currentProblem.num1,
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: isRookie ? "text-orange-500" : "text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]",
                                children: currentProblem.operation
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 201,
                                columnNumber: 33
                            }, ("TURBOPACK compile-time value", void 0)),
                            " ",
                            currentProblem.num2
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    isRookie && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MathVisualizer, {
                        problem: currentProblem
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 203,
                        columnNumber: 22
                    }, ("TURBOPACK compile-time value", void 0)),
                    !isRookie && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 flex gap-4 w-full max-w-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setInputMode('buttons'),
                                className: `flex-1 py-2 rounded-lg font-bold transition-all ${inputMode === 'buttons' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-indigo-500/30'}`,
                                children: "Multiple Choice"
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setInputMode('typing'),
                                className: `flex-1 py-2 rounded-lg font-bold transition-all ${inputMode === 'typing' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-indigo-500/30'}`,
                                children: "Type Answer"
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 206,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    inputMode === 'buttons' || isRookie ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `grid grid-cols-2 gap-4 w-full ${isRookie ? 'max-w-xl' : 'max-w-2xl'}`,
                        children: currentProblem.options.map((opt, i)=>{
                            const isLastOfThree = currentProblem.options.length === 3 && i === 2;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleAnswer(opt),
                                className: `${buttonStyle} ${isLastOfThree ? 'col-span-2' : ''}`,
                                children: opt
                            }, `btn-${i}`, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 216,
                                columnNumber: 22
                            }, ("TURBOPACK compile-time value", void 0));
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 213,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleFormSubmit,
                        className: "w-full max-w-md flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                autoFocus: true,
                                value: typedAnswer,
                                onChange: (e)=>setTypedAnswer(e.target.value),
                                className: "w-full bg-slate-900 border-2 border-indigo-500/50 focus:border-cyan-400 rounded-2xl text-center text-5xl font-bold text-white py-6 outline-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all",
                                placeholder: "..."
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 221,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "w-full py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-2xl text-2xl font-bold text-white hover:opacity-90 transform hover:-translate-y-1 transition-all shadow-[0_0_25px_rgba(217,70,239,0.4)]",
                                children: "Submit Answer"
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 220,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/GameInterface.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/MistakeReview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MistakeReview",
    ()=>MistakeReview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
;
;
;
const MistakeReview = ()=>{
    const { roundMistakes, inferredAge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"])();
    if (roundMistakes.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-8 bg-gray-900 rounded-2xl border border-gray-800 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-2xl font-bold text-green-400 mb-2",
                    children: "Flawless Round!"
                }, void 0, false, {
                    fileName: "[project]/components/MistakeReview.tsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400",
                    children: "You didn't make a single mistake. Incredible work!"
                }, void 0, false, {
                    fileName: "[project]/components/MistakeReview.tsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/MistakeReview.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-2xl font-bold text-white mb-4",
                children: "Round Review"
            }, void 0, false, {
                fileName: "[project]/components/MistakeReview.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            roundMistakes.map((mistake, idx)=>{
                const { problem, selectedAnswer } = mistake;
                const isAdvanced = problem.difficulty > 1 || inferredAge === '11-14';
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 p-6 rounded-2xl border-l-4 border-red-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4 text-xl font-bold text-white mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                problem.num1,
                                                " ",
                                                problem.operation,
                                                " ",
                                                problem.num2
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/MistakeReview.tsx",
                                            lineNumber: 28,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            className: "w-5 h-5 text-gray-500"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MistakeReview.tsx",
                                            lineNumber: 29,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-green-400 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/MistakeReview.tsx",
                                                    lineNumber: 30,
                                                    columnNumber: 74
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                " ",
                                                problem.correctAnswer
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/MistakeReview.tsx",
                                            lineNumber: 30,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MistakeReview.tsx",
                                    lineNumber: 27,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-red-400 flex items-center gap-2 text-sm md:text-base",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MistakeReview.tsx",
                                            lineNumber: 33,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        " You answered: ",
                                        selectedAnswer !== null ? selectedAnswer : 'Time Out'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MistakeReview.tsx",
                                    lineNumber: 32,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MistakeReview.tsx",
                            lineNumber: 26,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-900 p-4 rounded-xl w-full md:w-1/2 text-gray-300 text-sm md:text-base",
                            children: !isAdvanced ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-cyan-400",
                                        children: "Hint:"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MistakeReview.tsx",
                                        lineNumber: 40,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " Think about adding/subtracting in smaller chunks!"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MistakeReview.tsx",
                                lineNumber: 40,
                                columnNumber: 18
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-bold text-purple-400",
                                        children: "Step-by-Step Breakdown:"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MistakeReview.tsx",
                                        lineNumber: 43,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    problem.operation === '*' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "Break it down: (",
                                            problem.num1,
                                            " × 10) +/- the remainder. Practice your ",
                                            problem.num1,
                                            " times tables!"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MistakeReview.tsx",
                                        lineNumber: 45,
                                        columnNumber: 22
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    problem.operation === '/' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "Division is backwards multiplication. What number times ",
                                            problem.num2,
                                            " equals ",
                                            problem.num1,
                                            "? (",
                                            problem.correctAnswer,
                                            " × ",
                                            problem.num2,
                                            " = ",
                                            problem.num1,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MistakeReview.tsx",
                                        lineNumber: 48,
                                        columnNumber: 22
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    (problem.operation === '+' || problem.operation === '-') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Align the numbers by their place value (tens and ones). Carry over or borrow carefully!"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MistakeReview.tsx",
                                        lineNumber: 51,
                                        columnNumber: 22
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MistakeReview.tsx",
                                lineNumber: 42,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/MistakeReview.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, idx, true, {
                    fileName: "[project]/components/MistakeReview.tsx",
                    lineNumber: 25,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0));
            })
        ]
    }, void 0, true, {
        fileName: "[project]/components/MistakeReview.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/Leaderboard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Leaderboard",
    ()=>Leaderboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-ssr] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
;
;
;
const Leaderboard = ()=>{
    const [allTime, setAllTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [weekly, setWeekly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('allTime');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch('http://localhost:4000/api/game/leaderboards').then((res)=>res.json()).then((data)=>{
            setAllTime(data.allTime);
            setWeekly(data.weekly);
            setLoading(false);
        }).catch((err)=>{
            console.error(err);
            setLoading(false);
        });
    }, []);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
            className: "w-8 h-8 animate-spin text-cyan-500"
        }, void 0, false, {
            fileName: "[project]/components/Leaderboard.tsx",
            lineNumber: 37,
            columnNumber: 64
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/Leaderboard.tsx",
        lineNumber: 37,
        columnNumber: 23
    }, ("TURBOPACK compile-time value", void 0));
    const currentData = activeTab === 'allTime' ? allTime : weekly;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden mt-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-4 p-4 border-b border-gray-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('allTime'),
                        className: `flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'allTime' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:bg-gray-800'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/Leaderboard.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            " All-Time"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('weekly'),
                        className: `flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'weekly' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:bg-gray-800'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/Leaderboard.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            " Weekly"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Leaderboard.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-gray-900 border-b border-gray-800 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-2 text-center",
                        children: "Rank"
                    }, void 0, false, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-5",
                        children: "Challenger"
                    }, void 0, false, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-2 text-center",
                        children: activeTab === 'allTime' ? 'Level' : 'Best Streak'
                    }, void 0, false, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-3 text-right pr-4",
                        children: activeTab === 'allTime' ? 'Total XP' : 'Weekly XP'
                    }, void 0, false, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Leaderboard.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-gray-800/50",
                children: currentData.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 text-center text-gray-500 font-semibold",
                    children: "No challengers on the board yet."
                }, void 0, false, {
                    fileName: "[project]/components/Leaderboard.tsx",
                    lineNumber: 67,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)) : currentData.map((player, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `p-4 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-gray-800/50 ${index < 3 ? 'bg-gray-800/20' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-2 flex justify-center",
                                children: index === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                    className: "w-6 h-6 text-yellow-400"
                                }, void 0, false, {
                                    fileName: "[project]/components/Leaderboard.tsx",
                                    lineNumber: 71,
                                    columnNumber: 30
                                }, ("TURBOPACK compile-time value", void 0)) : index === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                    className: "w-6 h-6 text-gray-400"
                                }, void 0, false, {
                                    fileName: "[project]/components/Leaderboard.tsx",
                                    lineNumber: 72,
                                    columnNumber: 30
                                }, ("TURBOPACK compile-time value", void 0)) : index === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                    className: "w-6 h-6 text-amber-600"
                                }, void 0, false, {
                                    fileName: "[project]/components/Leaderboard.tsx",
                                    lineNumber: 73,
                                    columnNumber: 30
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-500 font-bold",
                                    children: [
                                        "#",
                                        index + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Leaderboard.tsx",
                                    lineNumber: 74,
                                    columnNumber: 16
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/Leaderboard.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-5 font-bold text-white flex items-center gap-2",
                                children: [
                                    player.username,
                                    (activeTab === 'allTime' ? player.global_streak : player.max_weekly_streak) >= 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                        className: "w-4 h-4 text-orange-500"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Leaderboard.tsx",
                                        lineNumber: 78,
                                        columnNumber: 100
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Leaderboard.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-2 text-center text-cyan-400 font-bold",
                                children: activeTab === 'allTime' ? player.level : player.max_weekly_streak || 0
                            }, void 0, false, {
                                fileName: "[project]/components/Leaderboard.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-3 text-right pr-4 font-mono text-purple-400",
                                children: Number(activeTab === 'allTime' ? player.total_xp : player.weekly_xp).toLocaleString()
                            }, void 0, false, {
                                fileName: "[project]/components/Leaderboard.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, index, true, {
                        fileName: "[project]/components/Leaderboard.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/components/Leaderboard.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/Leaderboard.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/Dashboard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dashboard",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MistakeReview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MistakeReview.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-ssr] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-ssr] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/gameConfig.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Leaderboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Leaderboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LandingPage.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const DashboardBackground = ({ isRookie })=>{
    if (isRookie) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-0 bg-gradient-to-br from-lime-100 to-violet-100 overflow-hidden pointer-events-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    dangerouslySetInnerHTML: {
                        __html: `@keyframes gentleFloat { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-40px) rotate(5deg); } }`
                    }
                }, void 0, false, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["backgroundSymbols"].map((item, i)=>{
                    const colors = [
                        'text-violet-400/30',
                        'text-sky-400/30',
                        'text-lime-500/30',
                        'text-orange-400/30'
                    ];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute font-black ${colors[i % colors.length]} drop-shadow-sm`,
                        style: {
                            fontSize: item.size,
                            left: item.left,
                            top: item.top,
                            animation: `gentleFloat ${item.dur} ease-in-out infinite`,
                            animationDelay: item.delay
                        },
                        children: item.sym
                    }, i, false, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 18,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0));
                })
            ]
        }, void 0, true, {
            fileName: "[project]/components/Dashboard.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    // NEW: Pro Circuit Dashboard Background
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none",
        children: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["backgroundSymbols"].map((item, i)=>{
            const colors = [
                'text-fuchsia-500/10',
                'text-cyan-400/10',
                'text-indigo-500/10',
                'text-violet-500/10'
            ];
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute font-black ${colors[i % colors.length]} animate-[pulse_4s_infinite] drop-shadow-[0_0_15px_currentColor]`,
                style: {
                    fontSize: item.size,
                    left: item.left,
                    top: item.top,
                    animationDelay: item.delay
                },
                children: item.sym
            }, i, false, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 33,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0));
        })
    }, void 0, false, {
        fileName: "[project]/components/Dashboard.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const Dashboard = ()=>{
    const { totalXP, level, globalStreak, lifetimeCorrect, lifetimeAttempted, lastPlayedDate, startRound, unlockedTrophies, inferredAge, targetAge, roundScore, isGuest, username, logout, resetGuestSession } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [viewState, setViewState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('stats');
    const [isAuthModalOpen, setIsAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const displayAge = targetAge || inferredAge;
    const isRookie = displayAge === '6-10';
    const accuracy = lifetimeAttempted === 0 ? 0 : Math.round(lifetimeCorrect / lifetimeAttempted * 100);
    const nextLevelXP = Math.pow(level + 1, 2) * __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].BASE_LEVEL_XP;
    const currentLevelBaseXP = Math.pow(level, 2) * __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].BASE_LEVEL_XP;
    const progressPercent = (totalXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP) * 100;
    const currentTier = Math.min(5, Math.ceil(level / 3));
    const tierProgress = (level - 1) % 3;
    const levelsToNextTier = 3 - tierProgress;
    const isStreakAtRisk = ()=>{
        if (!lastPlayedDate || globalStreak === 0) return false;
        const lastPlayed = new Date(lastPlayedDate);
        const today = new Date();
        return !(lastPlayed.getUTCFullYear() === today.getUTCFullYear() && lastPlayed.getUTCMonth() === today.getUTCMonth() && lastPlayed.getUTCDate() === today.getUTCDate());
    };
    // REVAMPED PRO THEME CLASSES
    const textColor = isRookie ? 'text-gray-900' : 'text-slate-100';
    const subTextColor = isRookie ? 'text-gray-500' : 'text-indigo-300';
    const cardBg = isRookie ? 'bg-white/90 backdrop-blur-sm border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.05)] rounded-[2rem]' : 'bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 shadow-[0_8px_32px_rgba(99,102,241,0.15)] rounded-[2rem]';
    const headerBg = isRookie ? 'bg-white/90 backdrop-blur-md border-4 border-white shadow-md rounded-[2rem]' : 'bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-3xl';
    const btnClass = isRookie ? 'px-8 py-4 bg-orange-400 hover:bg-orange-500 text-white rounded-[2rem] font-black text-xl border-b-[8px] border-orange-600 hover:border-b-4 hover:translate-y-1 transition-all' : 'px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transform hover:-translate-y-1';
    const tabActive = isRookie ? 'bg-sky-400 text-white shadow-md' : 'text-fuchsia-400 border-b-2 border-fuchsia-400 bg-slate-800 shadow-[inset_0_-2px_10px_rgba(217,70,239,0.1)]';
    const tabInactive = isRookie ? 'bg-white text-gray-500 hover:bg-gray-50 border-2 border-transparent' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `min-h-screen p-4 md:p-8 flex flex-col items-center relative overflow-x-hidden ${textColor}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardBackground, {
                isRookie: isRookie
            }, void 0, false, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-6xl space-y-6 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: `flex flex-col sm:flex-row justify-between items-center p-4 mb-6 ${headerBg}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 mb-4 sm:mb-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl ${isRookie ? 'bg-sky-400 text-white shadow-inner' : 'bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`,
                                        children: "M"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 83,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-black tracking-wider",
                                        children: "MathQuest"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 84,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center justify-center gap-3",
                                children: isGuest ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"].getState().navigate('landing'),
                                            className: `px-4 py-2 rounded-xl font-bold transition-colors ${isRookie ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'text-cyan-400 hover:bg-slate-800'}`,
                                            children: "Home"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                if (window.confirm("Are you sure? This will erase your current guest progress!")) resetGuestSession();
                                            },
                                            className: `px-4 py-2 rounded-xl font-bold transition-colors ${isRookie ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-slate-400 hover:bg-slate-800'}`,
                                            children: "Quit Game"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 91,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsAuthModalOpen(true),
                                            className: `px-5 py-2.5 rounded-xl font-black text-white transition-transform hover:-translate-y-1 ${isRookie ? 'bg-sky-500 shadow-[0_4px_0_rgb(2,132,199)]' : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 shadow-[0_0_15px_rgba(217,70,239,0.4)]'}`,
                                            children: "Save Progress"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 92,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>logout(),
                                    className: `px-4 py-2 rounded-xl font-bold transition-colors ${isRookie ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-fuchsia-400 hover:bg-fuchsia-900/30 border border-fuchsia-500/30'}`,
                                    children: "Log Out"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex flex-col md:flex-row justify-between items-center p-6 md:p-8 ${cardBg}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-6 md:mb-0 text-center md:text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: `text-4xl font-black ${isRookie ? 'text-sky-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]'}`,
                                        children: [
                                            "Welcome, ",
                                            username || 'Challenger',
                                            "!"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `mt-2 font-bold ${subTextColor}`,
                                        children: [
                                            "Arena: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: isRookie ? 'text-orange-500' : 'text-cyan-400 drop-shadow-[0_0_5px_currentColor]',
                                                children: isRookie ? 'Rookie (6-10)' : 'Pro Circuit (11-14+)'
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 106,
                                                columnNumber: 22
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 105,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: startRound,
                                className: `flex items-center gap-2 ${btnClass}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                        fill: "currentColor",
                                        className: "w-8 h-8"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " ENTER MATCH"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    isStreakAtRisk() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-orange-500/20 border-4 border-orange-500 rounded-3xl p-6 flex items-center gap-4 animate-bounce",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "w-10 h-10 text-orange-500"
                            }, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 116,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "font-black text-orange-600 dark:text-orange-400 text-xl",
                                        children: "Streak at Risk!"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 118,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-bold text-orange-800 dark:text-orange-200",
                                        children: [
                                            "Play a round today to keep your ",
                                            globalStreak,
                                            "-day streak alive!"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-12 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `md:col-span-8 p-8 flex flex-col justify-center relative overflow-hidden ${cardBg}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-end mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-lg font-black uppercase tracking-wider ${subTextColor}`,
                                                        children: "Current Rank"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Dashboard.tsx",
                                                        lineNumber: 128,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        className: "text-8xl font-black drop-shadow-md",
                                                        children: level
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Dashboard.tsx",
                                                        lineNumber: 129,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 127,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-sm font-bold ${subTextColor}`,
                                                        children: "Total XP"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Dashboard.tsx",
                                                        lineNumber: 132,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-4xl font-black ${isRookie ? 'text-sky-500' : 'text-cyan-400 drop-shadow-[0_0_10px_currentColor]'}`,
                                                        children: totalXP.toLocaleString()
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Dashboard.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 131,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-full rounded-full h-6 mb-2 overflow-hidden ${isRookie ? 'bg-gray-100 shadow-inner' : 'bg-slate-800 border border-slate-700'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `h-full rounded-full transition-all duration-1000 ease-out ${isRookie ? 'bg-sky-400' : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]'}`,
                                            style: {
                                                width: `${Math.max(5, progressPercent)}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 138,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-right text-sm font-bold ${subTextColor}`,
                                        children: [
                                            nextLevelXP - totalXP,
                                            " XP to Level ",
                                            level + 1
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 143,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `md:col-span-4 p-8 flex flex-col items-center justify-center text-center ${cardBg}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                        className: `w-24 h-24 mb-4 ${globalStreak > 0 ? isRookie ? 'text-orange-500 drop-shadow-md' : 'text-fuchsia-500 drop-shadow-[0_0_20px_rgba(217,70,239,0.6)]' : 'text-gray-300 dark:text-slate-700'}`
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 147,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-6xl font-black",
                                        children: globalStreak
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `font-black uppercase tracking-widest mt-2 ${subTextColor}`,
                                        children: "Day Streak"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 149,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `md:col-span-12 p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${cardBg}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `p-4 rounded-2xl ${isRookie ? 'bg-orange-100 text-orange-500' : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                    className: "w-10 h-10"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Dashboard.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 154,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-2xl font-black",
                                                        children: [
                                                            "Difficulty Tier ",
                                                            currentTier,
                                                            "/5"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Dashboard.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `font-bold text-sm ${subTextColor}`,
                                                        children: currentTier === 5 ? "Maximum challenge reached!" : `Advance ${levelsToNextTier} level${levelsToNextTier > 1 ? 's' : ''} for Tier ${currentTier + 1}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Dashboard.tsx",
                                                        lineNumber: 159,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 157,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 153,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            1,
                                            2,
                                            3
                                        ].map((step)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `h-4 w-20 rounded-full transition-all duration-500 ${step <= tierProgress ? isRookie ? 'bg-orange-400' : 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : isRookie ? 'bg-gray-200' : 'bg-slate-800'}`
                                            }, step, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 168,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `md:col-span-4 p-6 flex items-center gap-4 ${cardBg}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-4 rounded-2xl ${isRookie ? 'bg-blue-100 text-blue-500' : 'bg-cyan-500/20 text-cyan-400'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                            className: "w-10 h-10"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 174,
                                            columnNumber: 123
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 174,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `font-bold ${subTextColor}`,
                                                children: "Accuracy"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 176,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-3xl font-black",
                                                children: [
                                                    accuracy,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 177,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `md:col-span-4 p-6 flex items-center gap-4 ${cardBg}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-4 rounded-2xl ${isRookie ? 'bg-green-100 text-green-500' : 'bg-fuchsia-500/20 text-fuchsia-400'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            className: "w-10 h-10"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 181,
                                            columnNumber: 131
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `font-bold ${subTextColor}`,
                                                children: "Solved"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 183,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-3xl font-black",
                                                children: lifetimeCorrect
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 184,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 182,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `md:col-span-4 p-6 flex items-center gap-4 ${cardBg}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-4 rounded-2xl ${isRookie ? 'bg-yellow-100 text-yellow-500' : 'bg-violet-500/20 text-violet-400'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                            className: "w-10 h-10"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 188,
                                            columnNumber: 131
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 188,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `font-bold ${subTextColor}`,
                                                children: "Last Score"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 190,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-3xl font-black",
                                                children: roundScore
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 191,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 189,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-4 mb-6 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setViewState('stats'),
                                        className: `px-6 py-3 font-black rounded-xl transition-all ${viewState === 'stats' ? tabActive : tabInactive}`,
                                        children: "Achievements"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 198,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setViewState('review'),
                                        className: `px-6 py-3 font-black rounded-xl transition-all ${viewState === 'review' ? tabActive : tabInactive}`,
                                        children: "Mistakes"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setViewState('leaderboard'),
                                        className: `px-6 py-3 font-black rounded-xl transition-all ${viewState === 'leaderboard' ? tabActive : tabInactive}`,
                                        children: "Leaderboards"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 200,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            viewState === 'stats' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-5 gap-4",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACHIEVEMENTS"].map((ach)=>{
                                    const isUnlocked = unlockedTrophies.includes(ach.id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-6 rounded-[2rem] text-center transition-all ${isUnlocked ? isRookie ? 'bg-yellow-100 border-4 border-yellow-300' : 'bg-slate-800 border-2 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : isRookie ? 'bg-white/50 border-4 border-gray-200 opacity-60 grayscale' : 'bg-slate-900/50 border border-slate-800 opacity-50 grayscale'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-5xl mb-3 flex justify-center",
                                                children: ach.icon
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 213,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: `font-black ${isUnlocked ? isRookie ? 'text-yellow-600' : 'text-fuchsia-400' : subTextColor}`,
                                                children: ach.title
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 214,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, ach.id, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 208,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 204,
                                columnNumber: 14
                            }, ("TURBOPACK compile-time value", void 0)) : viewState === 'review' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: cardBg + ' p-4',
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MistakeReview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MistakeReview"], {}, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 220,
                                    columnNumber: 46
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 220,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Leaderboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Leaderboard"], {}, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthModal"], {
                        isOpen: isAuthModalOpen,
                        onClose: ()=>setIsAuthModalOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 225,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/Dashboard.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GameController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LandingPage.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameInterface$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GameInterface.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Dashboard.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function GameController() {
    const { currentView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    if (!mounted) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#0a0a0f] flex items-center justify-center text-cyan-400 animate-pulse",
        children: "Loading Game Engine..."
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 17,
        columnNumber: 24
    }, this);
    if (currentView === 'game') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameInterface$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GameInterface"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 19,
        columnNumber: 38
    }, this);
    if (currentView === 'dashboard') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dashboard"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 20,
        columnNumber: 43
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LandingPage"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=_10-r9i6._.js.map