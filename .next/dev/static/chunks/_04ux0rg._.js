(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/mathEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateProblem",
    ()=>generateProblem
]);
const generateProblem = (difficultyLevel, inferredAge)=>{
    const operations = [
        '+',
        '-'
    ];
    if (difficultyLevel > 1) operations.push('*');
    if (difficultyLevel > 2 || inferredAge === '11-14') operations.push('/');
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1 = 0, num2 = 0, correct = 0;
    // Adaptive ranges based on difficulty & age config
    const maxBasic = inferredAge === '6-10' ? 12 : inferredAge === '11-14' ? 50 : 20;
    const maxAdvanced = inferredAge === '6-10' ? 20 : 100;
    switch(op){
        case '+':
            num1 = Math.floor(Math.random() * (difficultyLevel === 1 ? maxBasic : maxAdvanced)) + 1;
            num2 = Math.floor(Math.random() * (difficultyLevel === 1 ? maxBasic : maxAdvanced)) + 1;
            correct = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * (difficultyLevel === 1 ? maxBasic : maxAdvanced)) + 5;
            num2 = Math.floor(Math.random() * num1); // Ensure positive result for target ages
            correct = num1 - num2;
            break;
        case '*':
            const multMax = difficultyLevel === 1 ? 5 : inferredAge === '6-10' ? 10 : 15;
            num1 = Math.floor(Math.random() * multMax) + 2;
            num2 = Math.floor(Math.random() * multMax) + 2;
            correct = num1 * num2;
            break;
        case '/':
            // Ensure clean division
            const divMax = difficultyLevel === 1 ? 5 : 12;
            num2 = Math.floor(Math.random() * divMax) + 2;
            correct = Math.floor(Math.random() * divMax) + 2;
            num1 = num2 * correct;
            break;
    }
    // Distractor Algorithm
    const numDistractors = inferredAge === '11-14' ? 3 : 2; // Neutral starts with 2
    const options = new Set([
        correct
    ]);
    let failsafe = 0; // Prevent infinite loops
    while(options.size < numDistractors + 1){
        failsafe++;
        // Increased minimum variance from 1 to 5 to guarantee plenty of unique options
        const variance = Math.max(5, Math.floor(correct * 0.2));
        const direction = Math.random() > 0.5 ? 1 : -1;
        let distractor = correct + (Math.floor(Math.random() * variance) + 1) * direction;
        // Catch edge case for negative distractors if not appropriate
        if (distractor < 0 && inferredAge !== '11-14') distractor = Math.abs(distractor);
        options.add(distractor);
        // Ultimate fallback: if it somehow gets stuck, force unique numbers to break the loop
        if (failsafe > 50) {
            options.add(correct + failsafe);
        }
    }
    // Shuffle options
    const shuffledOptions = Array.from(options).sort(()=>Math.random() - 0.5);
    return {
        num1,
        num2,
        operation: op,
        correctAnswer: correct,
        options: shuffledOptions,
        difficulty: difficultyLevel
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/config/gameConfig.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/audioEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "soundFx",
    ()=>soundFx
]);
class AudioEngine {
    ctx = null;
    init() {
        if (!this.ctx && ("TURBOPACK compile-time value", "object") !== 'undefined') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/gameStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGameStore",
    ()=>useGameStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mathEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mathEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/gameConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioEngine.ts [app-client] (ecmascript)");
;
;
;
;
;
const useGameStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
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
        // Initial Round State
        isActiveRound: false,
        timeRemaining: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC,
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
                unlockedTrophies: []
            }),
        navigate: (view)=>set({
                currentView: view
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
                unlockedTrophies: []
            });
        },
        resetDailyStreakIfNeeded: ()=>{
            const { lastPlayedDate, globalStreak } = get();
            if (!lastPlayedDate) return;
            const lastPlayed = new Date(lastPlayedDate);
            const today = new Date();
            // Compare UTC Midnight
            const daysDiff = Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - Date.UTC(lastPlayed.getUTCFullYear(), lastPlayed.getUTCMonth(), lastPlayed.getUTCDate())) / (1000 * 60 * 60 * 24));
            if (daysDiff > 1 && globalStreak > 0) {
                set({
                    globalStreak: 0
                }); // Streak broken
            }
        },
        startRound: ()=>{
            get().resetDailyStreakIfNeeded();
            const difficulty = get().level > 5 ? get().level > 10 ? 3 : 2 : 1; // Basic difficulty scaling
            set({
                isActiveRound: true,
                currentView: 'game',
                timeRemaining: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC,
                roundScore: 0,
                roundStreak: 0,
                roundMistakes: [],
                roundCorrectCount: 0,
                roundQuestionsAttempted: 0,
                currentProblem: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mathEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateProblem"])(difficulty, get().inferredAge)
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
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playCorrect();
                newStreak += 1;
                newCorrectCount += 1;
                // Math Formula: Base + (SpeedBonus * Linear Decay) * StreakMultiplier
                // Decay: (timeRemaining / 60)
                const speedBonus = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].MAX_SPEED_BONUS * (state.timeRemaining / __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC);
                const streakMult = Math.min(1 + newStreak * __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].STREAK_MULTIPLIER_STEP, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].MAX_STREAK_MULTIPLIER);
                const pointsEarned = Math.floor((__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].BASE_XP_PER_CORRECT + speedBonus) * streakMult);
                newScore += pointsEarned;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playIncorrect();
                newStreak = 0;
                newMistakes.push({
                    problem: state.currentProblem,
                    selectedAnswer: answer,
                    timeSpentSec: timeSpent
                });
            }
            const nextDiff = state.level > 5 ? 2 : 1; // Dynamic logic can be expanded
            set({
                roundScore: newScore,
                roundStreak: newStreak,
                roundCorrectCount: newCorrectCount,
                roundMistakes: newMistakes,
                roundQuestionsAttempted: newQuestionsAttempted,
                currentProblem: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mathEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateProblem"])(nextDiff, state.inferredAge)
            });
        },
        endRound: ()=>{
            const state = get();
            const newTotalXP = state.totalXP + state.roundScore;
            const newLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateLevel"])(newTotalXP);
            if (newLevel > state.level) {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playLevelUp();
            }
            const todayDateStr = new Date().toISOString();
            set({
                currentView: 'dashboard',
                isActiveRound: false,
                currentProblem: null,
                timeRemaining: 0,
                totalXP: newTotalXP,
                level: newLevel,
                lifetimeCorrect: state.lifetimeCorrect + state.roundCorrectCount,
                lifetimeAttempted: state.lifetimeAttempted + state.roundQuestionsAttempted,
                lastPlayedDate: todayDateStr,
                // If they played today, increment global streak
                globalStreak: state.globalStreak + 1
            });
            get().evaluateAgeGroup();
            get().checkAchievements();
        // At this point, a controller would sync to the backend
        },
        evaluateAgeGroup: ()=>{
            const state = get();
            // Only evaluate if still neutral and completed at least 1 round (approx 10 questions attempted)
            if (state.inferredAge !== 'neutral' || state.lifetimeAttempted < 10) return;
            const accuracy = state.lifetimeCorrect / state.lifetimeAttempted;
            // High accuracy on neutral setting suggests older/advanced. 
            // This can be tuned based on real analytics later.
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
            __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACHIEVEMENTS"].forEach((ach)=>{
                if (newTrophies.includes(ach.id)) return;
                let achieved = false;
                if (ach.type === 'xp' && state.totalXP >= ach.threshold) achieved = true;
                if (ach.type === 'volume' && state.lifetimeAttempted >= ach.threshold) achieved = true;
                if (ach.type === 'streak' && state.roundStreak >= ach.threshold) achieved = true;
                if (ach.type === 'accuracy' && state.roundQuestionsAttempted > 5 && state.roundMistakes.length === 0) achieved = true;
                if (achieved) {
                    newTrophies.push(ach.id);
                // Trigger UI toast notification here later
                }
            });
            set({
                unlockedTrophies: newTrophies
            });
        }
    }), {
    name: 'math-game-storage',
    // Don't persist active round state to avoid cheating/stuck timers on refresh
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
            inferredAge: state.inferredAge
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AuthModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthModal",
    ()=>AuthModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioEngine.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const AuthModal = ({ isOpen, onClose })=>{
    _s();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('register');
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        setIsLoading(true);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playClick();
        const currentState = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].getState();
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
                lifetimeAttempted: currentState.lifetimeAttempted
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
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].setState({
                isGuest: false,
                username: data.user.username,
                totalXP: mode === 'register' ? currentState.totalXP : data.user.total_xp || 0,
                level: mode === 'register' ? currentState.level : data.user.level || 1,
                globalStreak: mode === 'register' ? currentState.globalStreak : data.user.global_streak || 0,
                lifetimeCorrect: mode === 'register' ? currentState.lifetimeCorrect : data.user.lifetime_correct || 0,
                lifetimeAttempted: mode === 'register' ? currentState.lifetimeAttempted : data.user.lifetime_attempted || 0
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playLevelUp();
            onClose();
        } catch (err) {
            setError(err.message);
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playIncorrect();
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(147,51,234,0.15)] relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                        onClose();
                    },
                    className: "absolute top-6 right-6 text-gray-500 hover:text-white transition-colors",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "w-6 h-6"
                    }, void 0, false, {
                        fileName: "[project]/components/AuthModal.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-3xl font-bold text-white mb-2",
                    children: mode === 'register' ? 'Save Progress' : 'Welcome Back'
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400 mb-8",
                    children: mode === 'register' ? 'Create an account to lock in your XP and climb the leaderboards.' : 'Log in to continue your streak.'
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 96,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4",
                    children: [
                        mode === 'register' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                    className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 104,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    required: true,
                                    placeholder: "Username",
                                    value: username,
                                    onChange: (e)=>setUsername(e.target.value),
                                    className: "w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 105,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 103,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                    className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "email",
                                    required: true,
                                    placeholder: "Email Address",
                                    value: email,
                                    onChange: (e)=>setEmail(e.target.value),
                                    className: "w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "password",
                                    required: true,
                                    placeholder: "Password",
                                    value: password,
                                    onChange: (e)=>setPassword(e.target.value),
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: isLoading,
                            type: "submit",
                            className: "w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50",
                            children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-6 h-6 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/AuthModal.tsx",
                                lineNumber: 125,
                                columnNumber: 26
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    mode === 'register' ? 'Create Account' : 'Log In',
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AuthModal.tsx",
                                        lineNumber: 126,
                                        columnNumber: 69
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 text-center text-gray-500 text-sm",
                    children: [
                        mode === 'register' ? 'Already have an account? ' : "Don't have an account? ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>{
                                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                                setMode(mode === 'register' ? 'login' : 'register');
                                setError('');
                            },
                            className: "text-cyan-400 hover:text-cyan-300 font-bold transition-colors",
                            children: mode === 'register' ? 'Log in' : 'Sign up'
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/AuthModal.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/AuthModal.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AuthModal, "IO8JDhDdQTm9cyiNE2amC3B6bvs=");
_c = AuthModal;
var _c;
__turbopack_context__.k.register(_c, "AuthModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/LandingPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LandingPage",
    ()=>LandingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.js [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioEngine.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const LandingPage = ()=>{
    _s();
    const startRound = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"])({
        "LandingPage.useGameStore[startRound]": (state)=>state.startRound
    }["LandingPage.useGameStore[startRound]"]);
    const [isAuthModalOpen, setIsAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500/30",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl w-full space-y-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]",
                            children: "MathQuest Neon"
                        }, void 0, false, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 16,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto",
                            children: "An adaptive, high-speed math challenge that levels up with you. Master the numbers, build your streak, and conquer the global leaderboard."
                        }, void 0, false, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:border-purple-500/50 transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"], {
                                    className: "w-10 h-10 text-purple-400 mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 27,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-bold mb-2",
                                    children: "Smart Adaptation"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 28,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400",
                                    children: "The game analyzes your speed and accuracy to automatically adjust the difficulty, ensuring you're always perfectly challenged."
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 29,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:border-cyan-500/50 transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                    className: "w-10 h-10 text-cyan-400 mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 32,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-bold mb-2",
                                    children: "Speed Multipliers"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 33,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400",
                                    children: "Think fast! Your score includes a linear speed bonus that decays over the 60-second round. The quicker you answer, the higher you score."
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 34,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:border-yellow-500/50 transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                    className: "w-10 h-10 text-yellow-400 mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-bold mb-2",
                                    children: "Global Glory"
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 38,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400",
                                    children: "Play as a guest instantly, or create an account to save your XP, earn dynamic trophies, and climb the All-Time Hall of Fame."
                                }, void 0, false, {
                                    fileName: "[project]/components/LandingPage.tsx",
                                    lineNumber: 39,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LandingPage.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col sm:flex-row items-center justify-center gap-6 pt-8",
                    children: !__TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].getState().isGuest || __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].getState().totalXP > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onMouseEnter: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playHover(),
                        onClick: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].getState().navigate('dashboard');
                        },
                        className: "group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-xl hover:from-cyan-400 hover:to-blue-500 transform hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                fill: "currentColor",
                                className: "w-6 h-6 group-hover:animate-bounce"
                            }, void 0, false, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 51,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0)),
                            "Return to Dashboard"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LandingPage.tsx",
                        lineNumber: 46,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onMouseEnter: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playHover(),
                                onClick: ()=>{
                                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].getState().startRound();
                                },
                                className: "group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-xl hover:from-cyan-400 hover:to-blue-500 transform hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                        fill: "currentColor",
                                        className: "w-6 h-6 group-hover:animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LandingPage.tsx",
                                        lineNumber: 61,
                                        columnNumber: 11
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Play as Guest"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 56,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onMouseEnter: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playHover(),
                                onClick: ()=>{
                                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["soundFx"].playClick();
                                    setIsAuthModalOpen(true);
                                },
                                className: "flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-gray-800 border-2 border-gray-700 rounded-2xl font-bold text-xl hover:bg-gray-700 hover:border-gray-600 transition-all text-gray-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                                        className: "w-6 h-6"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LandingPage.tsx",
                                        lineNumber: 70,
                                        columnNumber: 11
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Create Account"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LandingPage.tsx",
                                lineNumber: 65,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthModal"], {
                    isOpen: isAuthModalOpen,
                    onClose: ()=>setIsAuthModalOpen(false)
                }, void 0, false, {
                    fileName: "[project]/components/LandingPage.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/LandingPage.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/LandingPage.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LandingPage, "zhiMOza5UCUVS9drjUhQ1qBOf9U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"]
    ];
});
_c = LandingPage;
var _c;
__turbopack_context__.k.register(_c, "LandingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GameInterface.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameInterface",
    ()=>GameInterface
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/gameConfig.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const GameInterface = ()=>{
    _s();
    const [visualFeedback, setVisualFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { currentProblem, timeRemaining, roundScore, roundStreak, submitAnswer, tickTimer, inferredAge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [typedAnswer, setTypedAnswer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [inputMode, setInputMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('buttons');
    // Timer interval
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameInterface.useEffect": ()=>{
            const timer = setInterval({
                "GameInterface.useEffect.timer": ()=>tickTimer()
            }["GameInterface.useEffect.timer"], 1000);
            return ({
                "GameInterface.useEffect": ()=>clearInterval(timer)
            })["GameInterface.useEffect"];
        }
    }["GameInterface.useEffect"], [
        tickTimer
    ]);
    if (!currentProblem) return null;
    // Age-Adaptive UI Flags
    const isYoung = inferredAge === '6-10';
    const isOlder = inferredAge === '11-14';
    const fontClass = isYoung ? 'text-7xl md:text-9xl' : 'text-5xl md:text-7xl';
    const allowTyping = isOlder;
    const handleOptionClick = (answer)=>{
        const isCorrect = answer === currentProblem.correctAnswer;
        setVisualFeedback(isCorrect ? 'correct' : 'incorrect');
        setTimeout(()=>setVisualFeedback(null), 300);
        const timeSpent = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC - timeRemaining;
        submitAnswer(answer, timeSpent);
    };
    const handleFormSubmit = (e)=>{
        e.preventDefault();
        if (!typedAnswer.trim()) return;
        const isCorrect = Number(typedAnswer) === currentProblem.correctAnswer;
        setVisualFeedback(isCorrect ? 'correct' : 'incorrect');
        setTimeout(()=>setVisualFeedback(null), 300);
        const timeSpent = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].ROUND_DURATION_SEC - timeRemaining;
        submitAnswer(Number(typedAnswer), timeSpent);
        setTypedAnswer('');
    };
    const timerColor = timeRemaining > 20 ? 'text-cyan-400' : timeRemaining > 10 ? 'text-yellow-400' : 'text-red-500 animate-pulse';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 ${visualFeedback === 'correct' ? 'bg-green-900/60' : visualFeedback === 'incorrect' ? 'bg-red-900/60' : 'bg-gray-950'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-3xl flex justify-between items-center mb-12 p-4 bg-gray-900/80 rounded-2xl border border-gray-800 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                className: `w-8 h-8 ${roundStreak > 2 ? 'text-orange-500 animate-bounce' : 'text-gray-500'}`
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-2xl font-bold text-white",
                                children: [
                                    "Streak: ",
                                    roundStreak
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-3 ${timerColor}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                className: "w-8 h-8"
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-3xl font-black",
                                children: [
                                    timeRemaining,
                                    "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                className: "w-8 h-8 text-cyan-400"
                            }, void 0, false, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-2xl font-bold text-white",
                                children: [
                                    "Score: ",
                                    roundScore
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameInterface.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `font-black text-white mb-12 tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] ${fontClass}`,
                children: [
                    currentProblem.num1,
                    " ",
                    currentProblem.operation,
                    " ",
                    currentProblem.num2,
                    " = ?"
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            allowTyping && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex gap-4 w-full max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setInputMode('buttons'),
                        className: `flex-1 py-2 rounded-lg font-bold ${inputMode === 'buttons' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`,
                        children: "Multiple Choice"
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setInputMode('typing'),
                        className: `flex-1 py-2 rounded-lg font-bold ${inputMode === 'typing' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`,
                        children: "Type Answer"
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            inputMode === 'buttons' || !allowTyping ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-4 w-full max-w-2xl",
                children: currentProblem.options.map((opt, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleOptionClick(opt),
                        className: "py-6 px-8 bg-gray-800 hover:bg-cyan-600 border-2 border-gray-700 hover:border-cyan-400 rounded-2xl text-4xl font-bold text-white transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(31,41,55)] hover:shadow-[0_8px_0_rgb(8,145,178)] active:translate-y-2 active:shadow-none",
                        children: [
                            opt,
                            " ",
                            isYoung && (opt === currentProblem.correctAnswer ? '' : '')
                        ]
                    }, i, true, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 100,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleFormSubmit,
                className: "w-full max-w-md flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        autoFocus: true,
                        value: typedAnswer,
                        onChange: (e)=>setTypedAnswer(e.target.value),
                        className: "w-full bg-gray-900 border-4 border-gray-700 focus:border-cyan-500 rounded-2xl text-center text-5xl font-bold text-white py-6 outline-none shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-colors",
                        placeholder: "Type..."
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        className: "w-full py-5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl text-2xl font-bold text-white hover:opacity-90 transform hover:-translate-y-1 transition-all",
                        children: "Submit Answer"
                    }, void 0, false, {
                        fileName: "[project]/components/GameInterface.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameInterface.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/GameInterface.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(GameInterface, "SHsTnSHLcD4EJLlqLqnmHpygmNU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"]
    ];
});
_c = GameInterface;
var _c;
__turbopack_context__.k.register(_c, "GameInterface");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/MistakeReview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MistakeReview",
    ()=>MistakeReview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
;
var _s = __turbopack_context__.k.signature();
;
;
const MistakeReview = ()=>{
    _s();
    const { roundMistakes, inferredAge } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"])();
    if (roundMistakes.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-8 bg-gray-900 rounded-2xl border border-gray-800 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-2xl font-bold text-green-400 mb-2",
                    children: "Flawless Round!"
                }, void 0, false, {
                    fileName: "[project]/components/MistakeReview.tsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
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
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 p-6 rounded-2xl border-l-4 border-red-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4 text-xl font-bold text-white mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            className: "w-5 h-5 text-gray-500"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MistakeReview.tsx",
                                            lineNumber: 29,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-green-400 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-red-400 flex items-center gap-2 text-sm md:text-base",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-900 p-4 rounded-xl w-full md:w-1/2 text-gray-300 text-sm md:text-base",
                            children: !isAdvanced ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-bold text-purple-400",
                                        children: "Step-by-Step Breakdown:"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MistakeReview.tsx",
                                        lineNumber: 43,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    problem.operation === '*' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    problem.operation === '/' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    (problem.operation === '+' || problem.operation === '-') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_s(MistakeReview, "/uBPdZH8PAVXkhPhwGjqC5iv7qo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"]
    ];
});
_c = MistakeReview;
var _c;
__turbopack_context__.k.register(_c, "MistakeReview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Dashboard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dashboard",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MistakeReview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MistakeReview.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/gameConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
const Dashboard = ()=>{
    _s();
    const { totalXP, level, globalStreak, lifetimeCorrect, lifetimeAttempted, lastPlayedDate, startRound, unlockedTrophies, inferredAge, roundScore, roundMistakes, isGuest, username, logout, resetGuestSession } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [viewState, setViewState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('stats');
    const [isAuthModalOpen, setIsAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const accuracy = lifetimeAttempted === 0 ? 0 : Math.round(lifetimeCorrect / lifetimeAttempted * 100);
    const nextLevelXP = Math.pow(level + 1, 2) * __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].BASE_LEVEL_XP;
    const currentLevelBaseXP = Math.pow(level, 2) * __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].BASE_LEVEL_XP;
    const progressPercent = (totalXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP) * 100;
    // Streak at risk logic
    const isStreakAtRisk = ()=>{
        if (!lastPlayedDate || globalStreak === 0) return false;
        const lastPlayed = new Date(lastPlayedDate);
        const today = new Date();
        const isToday = lastPlayed.getUTCFullYear() === today.getUTCFullYear() && lastPlayed.getUTCMonth() === today.getUTCMonth() && lastPlayed.getUTCDate() === today.getUTCDate();
        return !isToday; // If they haven't played today, it's at risk of breaking tomorrow
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-950 p-4 md:p-8 text-white flex flex-col items-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-6xl space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "flex flex-col sm:flex-row justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-md mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-4 sm:mb-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(34,211,238,0.3)]",
                                    children: "M"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 44,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-xl font-bold tracking-wider",
                                    children: "MathQuest"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: isGuest ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].getState().navigate('landing'),
                                        className: "flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-white hover:bg-cyan-900/30 rounded-lg transition-colors text-sm font-semibold",
                                        children: "Home Page"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 51,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (window.confirm("Are you sure? This will erase your current guest progress!")) {
                                                resetGuestSession();
                                            }
                                        },
                                        className: "flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-semibold",
                                        children: "Quit to Menu"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 57,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsAuthModalOpen(true),
                                        className: "flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all transform hover:-translate-y-0.5",
                                        children: "Save Progress"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 67,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>logout(),
                                className: "flex items-center gap-2 px-4 py-2 text-red-400 hover:text-white hover:bg-red-900/50 border border-red-900/50 rounded-lg transition-colors text-sm font-semibold",
                                children: "Log Out"
                            }, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 75,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col md:flex-row justify-between items-center bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 md:mb-0 text-center md:text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400",
                                    children: [
                                        "Welcome Back, ",
                                        username || 'Challenger',
                                        "!"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400 mt-1",
                                    children: [
                                        "Age Group Profile: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-cyan-400 capitalize",
                                            children: inferredAge
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 94,
                                            columnNumber: 34
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        inferredAge === 'neutral' && " (Calibrating...)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: startRound,
                            className: "flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                    fill: "currentColor",
                                    className: "w-6 h-6"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                " Play Next Round"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                isStreakAtRisk() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-orange-500/20 border-2 border-orange-500 rounded-2xl p-4 flex items-center gap-4 animate-pulse",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-8 h-8 text-orange-500"
                        }, void 0, false, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 108,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "font-bold text-orange-400 text-lg",
                                    children: "Streak at Risk!"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 110,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-orange-200",
                                    children: [
                                        "Play a round today before UTC Midnight to keep your ",
                                        globalStreak,
                                        "-day streak alive!"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 109,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 107,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-12 gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:col-span-8 bg-gray-900 rounded-3xl border border-gray-800 p-8 flex flex-col justify-center relative overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-end mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-lg font-semibold uppercase tracking-wider",
                                                    children: "Current Level"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Dashboard.tsx",
                                                    lineNumber: 125,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "text-7xl font-black text-white",
                                                    children: level
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Dashboard.tsx",
                                                    lineNumber: 126,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 124,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-sm",
                                                    children: "Total XP"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Dashboard.tsx",
                                                    lineNumber: 129,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-3xl font-bold text-cyan-400",
                                                    children: totalXP.toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Dashboard.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 128,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full bg-gray-800 rounded-full h-4 mb-2 overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gradient-to-r from-purple-500 to-cyan-400 h-4 rounded-full transition-all duration-1000 ease-out",
                                        style: {
                                            width: `${Math.max(5, progressPercent)}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 136,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-right text-xs text-gray-500",
                                    children: [
                                        nextLevelXP - totalXP,
                                        " XP to Level ",
                                        level + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 141,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 120,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:col-span-4 bg-gray-900 rounded-3xl border border-gray-800 p-8 flex flex-col items-center justify-center text-center shadow-[inset_0_0_50px_rgba(249,115,22,0.05)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                    className: `w-20 h-20 mb-4 ${globalStreak > 0 ? 'text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'text-gray-700'}`
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 146,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-5xl font-black text-white",
                                    children: globalStreak
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400 font-bold uppercase tracking-widest mt-2",
                                    children: "Day Streak"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 148,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:col-span-4 bg-gray-900 rounded-3xl border border-gray-800 p-6 flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-blue-500/10 rounded-2xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                        className: "w-8 h-8 text-blue-400"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 153,
                                        columnNumber: 61
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-400 text-sm",
                                            children: "Accuracy"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-2xl font-bold",
                                            children: [
                                                accuracy,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 156,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 154,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 152,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:col-span-4 bg-gray-900 rounded-3xl border border-gray-800 p-6 flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-green-500/10 rounded-2xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        className: "w-8 h-8 text-green-400"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 161,
                                        columnNumber: 62
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 161,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-400 text-sm",
                                            children: "Questions Solved"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 163,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-2xl font-bold",
                                            children: lifetimeCorrect
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 164,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 162,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:col-span-4 bg-gray-900 rounded-3xl border border-gray-800 p-6 flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-yellow-500/10 rounded-2xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                        className: "w-8 h-8 text-yellow-400"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 169,
                                        columnNumber: 63
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-400 text-sm",
                                            children: "Last Round Score"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 171,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-2xl font-bold",
                                            children: roundScore
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 172,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 170,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 168,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 117,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex border-b border-gray-800 mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setViewState('stats'),
                                    className: `px-4 py-3 font-bold transition-all ${viewState === 'stats' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`,
                                    children: "Trophies & Stats"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 181,
                                    columnNumber: 3
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setViewState('review'),
                                    className: `px-4 py-3 font-bold transition-all ${viewState === 'review' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`,
                                    children: "Last Round Review"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 182,
                                    columnNumber: 3
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setViewState('leaderboard'),
                                    className: `px-4 py-3 font-bold transition-all ${viewState === 'leaderboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`,
                                    children: "Leaderboards"
                                }, void 0, false, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 183,
                                    columnNumber: 3
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 180,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        viewState === 'stats' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-5 gap-4",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$gameConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACHIEVEMENTS"].map((ach)=>{
                                const isUnlocked = unlockedTrophies.includes(ach.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `p-4 rounded-2xl border text-center transition-all ${isUnlocked ? 'bg-gray-800 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-gray-900 border-gray-800 opacity-50 grayscale'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-4xl mb-2",
                                            children: ach.icon
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 192,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: `font-bold ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}`,
                                            children: ach.title
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 193,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500 mt-1",
                                            children: ach.description
                                        }, void 0, false, {
                                            fileName: "[project]/components/Dashboard.tsx",
                                            lineNumber: 194,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, ach.id, true, {
                                    fileName: "[project]/components/Dashboard.tsx",
                                    lineNumber: 191,
                                    columnNumber: 21
                                }, ("TURBOPACK compile-time value", void 0));
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 187,
                            columnNumber: 14
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MistakeReview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MistakeReview"], {}, void 0, false, {
                            fileName: "[project]/components/Dashboard.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 179,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthModal"], {
                    isOpen: isAuthModalOpen,
                    onClose: ()=>setIsAuthModalOpen(false)
                }, void 0, false, {
                    fileName: "[project]/components/Dashboard.tsx",
                    lineNumber: 205,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/Dashboard.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/Dashboard.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Dashboard, "quL3O6x5u/1ocqszLgHkQnT5p3M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"]
    ];
});
_c = Dashboard;
var _c;
__turbopack_context__.k.register(_c, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GameController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/gameStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LandingPage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GameInterface.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Dashboard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function GameController() {
    _s();
    const { currentView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameController.useEffect": ()=>{
            setMounted(true);
        }
    }["GameController.useEffect"], []);
    if (!mounted) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#0a0a0f] flex items-center justify-center text-cyan-400 animate-pulse",
        children: "Loading Game Engine..."
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 17,
        columnNumber: 24
    }, this);
    if (currentView === 'game') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameInterface"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 19,
        columnNumber: 38
    }, this);
    if (currentView === 'dashboard') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dashboard"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 20,
        columnNumber: 43
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LandingPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LandingPage"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
_s(GameController, "1LmgBS81+YaOhEiPHG7wyCpwQ98=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$gameStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"]
    ];
});
_c = GameController;
var _c;
__turbopack_context__.k.register(_c, "GameController");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_04ux0rg._.js.map