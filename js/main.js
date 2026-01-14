/**
 * Main Controller (Bug Fix: Input Locking)
 * Includes: Game Loop, Sound Toggle, Achievements, Keyboard, and Input Locking.
 */

const app = {
    game: new Game(),
    myChart: null,
    uiTimer: null,
    soundEnabled: true,
    isProcessing: false, // NEW: Lock flag to prevent double-clicking

    // --- Definition of Achievements ---
    achievementsDef: [
        { id: 'first_win', icon: '🌱', title: 'Beginner', desc: 'Complete 1 Game' },
        { id: 'score_200', icon: '🔥', title: 'On Fire', desc: 'Score 200+ pts' },
        { id: 'streak_10', icon: '⚡', title: 'Unstoppable', desc: '10 Streak' },
        { id: 'perfect',   icon: '💎', title: 'Perfectionist', desc: '100% Accuracy' },
        { id: 'veteran',   icon: '👑', title: 'Math King', desc: 'Total 1000 XP' }
    ],

    // --- Navigation ---
    showView: (viewId) => {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        setTimeout(() => {
            document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
            const target = document.getElementById(viewId);
            target.classList.remove('hidden');
            void target.offsetWidth; 
            target.classList.add('active');
        }, 100);
    },

    toggleSound: () => {
        app.soundEnabled = !app.soundEnabled;
        const btn = document.getElementById('sound-toggle');
        btn.innerHTML = app.soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        btn.style.opacity = app.soundEnabled ? '1' : '0.5';
    },

    playSound: (type) => {
        if (!app.soundEnabled) return;
        const file = type === 'correct' ? 'assets/correct.mp3' : 'assets/wrong.mp3';
        const audio = new Audio(file);
        audio.play().catch(e => {}); // Silent fail
    },

    startGame: () => {
        app.isProcessing = false; // Reset lock
        app.game.start();
        app.updateTimerDisplay(); 
        app.updateScoreDisplay();
        
        document.getElementById('feedback-message').textContent = "";
        document.getElementById('streak-display').classList.add('hidden');
        
        app.showView('view-game');
        app.renderQuestion();
        
        // Start Timer
        if (app.uiTimer) clearInterval(app.uiTimer);
        app.uiTimer = setInterval(() => {
            app.updateTimerDisplay();
            if (!app.game.isActive) app.finishGame();
        }, 1000);
    },

    finishGame: () => {
        clearInterval(app.uiTimer);
        app.isProcessing = false; // Ensure lock is released
        
        // Stats
        document.getElementById('final-score').textContent = app.game.score;
        document.getElementById('accuracy').textContent = app.game.getAccuracy() + "%";
        
        // Confetti
        if (app.game.score > 0) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6c5ce7', '#00cec9', '#e17055'] });
        }

        // Mistakes
        const mistakesBox = document.getElementById('mistakes-container');
        const mistakesList = document.getElementById('mistakes-list');
        if (app.game.mistakes.length > 0) {
            mistakesBox.classList.remove('hidden');
            mistakesList.innerHTML = ''; 
            app.game.mistakes.forEach(m => {
                const li = document.createElement('li');
                li.innerHTML = `<div style="margin-bottom:5px; border-bottom:1px solid #eee;"><b>${m.question} = ?</b> <br> You: <span style="color:#d63031">${m.userAnswer}</span> | Ans: <span style="color:#00b894">${m.correctAnswer}</span></div>`;
                mistakesList.appendChild(li);
            });
        } else {
            mistakesBox.classList.add('hidden');
        }

        app.saveProgress();
        app.checkAchievements(); 
        app.showView('view-result');
    },

    returnHome: () => {
        app.showView('view-home');
        app.loadStats(); 
    },

    // --- Gameplay ---
    renderQuestion: () => {
        const q = app.game.currentQuestion;
        
        document.getElementById('question-display').textContent = q.getDisplay();
        document.getElementById('difficulty-indicator').textContent = `Level ${app.game.difficulty}`;
        
        const streakEl = document.getElementById('streak-display');
        if (app.game.streak > 1) {
            streakEl.innerHTML = `<i class="fas fa-fire"></i> Streak: ${app.game.streak}`;
            streakEl.classList.remove('hidden');
        } else {
            streakEl.classList.add('hidden');
        }

        const container = document.getElementById('options-container');
        container.innerHTML = ''; 
        
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="key-hint">${index + 1}</span> ${opt}`;
            
            // Pass the specific button element to handleAnswer
            btn.onclick = () => app.handleAnswer(opt, btn);
            
            container.appendChild(btn);
        });
    },

    handleAnswer: (selectedOption, btnElement) => {
        // FIX: Check if game is processing to prevent double clicks
        if (!app.game.isActive || app.isProcessing) return;
        
        app.isProcessing = true; // LOCK INPUT

        const isCorrect = app.game.submitAnswer(selectedOption);
        app.playSound(isCorrect ? 'correct' : 'wrong');

        const fbMessage = document.getElementById('feedback-message');
        if (isCorrect) {
            if(btnElement) btnElement.classList.add('correct');
            fbMessage.textContent = "Great Job!";
            fbMessage.style.color = "var(--success)";
        } else {
            if(btnElement) btnElement.classList.add('wrong');
            fbMessage.textContent = "Oops!";
            fbMessage.style.color = "var(--danger)";
        }

        app.updateScoreDisplay();
        app.updateTimerDisplay(); 

        // Delay for feedback
        setTimeout(() => {
            fbMessage.textContent = "";
            if (app.game.isActive) {
                app.game.nextQuestion();
                app.renderQuestion();
            }
            app.isProcessing = false; // UNLOCK INPUT
        }, 800);
    },

    updateTimerDisplay: () => {
        const timerEl = document.getElementById('timer');
        const minutes = Math.floor(app.game.timeLeft / 60);
        const seconds = app.game.timeLeft % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const box = document.querySelector('.timer-box');
        if (app.game.timeLeft <= 10) box.classList.add('urgent');
        else box.classList.remove('urgent');
    },

    updateScoreDisplay: () => {
        document.getElementById('score').textContent = app.game.score;
    },

    // --- Persistence & Achievements ---
    saveProgress: () => {
        const result = {
            date: new Date().toLocaleDateString(),
            score: app.game.score,
            accuracy: app.game.getAccuracy()
        };
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        history.unshift(result); 
        if (history.length > 20) history.pop();
        localStorage.setItem('mathMasterHistory', JSON.stringify(history));
    },

    checkAchievements: () => {
        let unlocked = JSON.parse(localStorage.getItem('mathMasterBadges')) || [];
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        const totalXP = history.reduce((sum, item) => sum + item.score, 0);
        const currentScore = app.game.score;
        const currentStreak = app.game.maxStreak;
        const accuracy = app.game.getAccuracy();

        if (history.length >= 1) addBadge('first_win');
        if (currentScore >= 200) addBadge('score_200');
        if (currentStreak >= 10)  addBadge('streak_10');
        if (accuracy === 100 && app.game.totalQuestions >= 5) addBadge('perfect');
        if (totalXP >= 1000)      addBadge('veteran');

        function addBadge(id) {
            if (!unlocked.includes(id)) {
                unlocked.push(id);
            }
        }
        localStorage.setItem('mathMasterBadges', JSON.stringify(unlocked));
    },

    showProgress: () => {
        app.loadHistoryUI();
        app.renderAchievementsUI(); 
        app.showView('view-progress');
        if (typeof Chart !== 'undefined') app.renderChart();
    },

    renderAchievementsUI: () => {
        const list = document.getElementById('achievements-list');
        const unlocked = JSON.parse(localStorage.getItem('mathMasterBadges')) || [];
        list.innerHTML = '';

        app.achievementsDef.forEach(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            const div = document.createElement('div');
            div.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <span class="achievement-icon">${ach.icon}</span>
                <span>${ach.title}</span>
                <span style="font-weight:400; color:#b2bec3; font-size:0.6rem">${ach.desc}</span>
            `;
            list.appendChild(div);
        });
    },

    loadStats: () => {
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        const totalXP = history.reduce((sum, item) => sum + item.score, 0);
        document.getElementById('total-xp').textContent = totalXP;
    },

    loadHistoryUI: () => {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        if (history.length === 0) list.innerHTML = '<li class="history-item">No games yet.</li>';
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `<span>${item.date}</span> <b>${item.score} pts</b>`;
            list.appendChild(li);
        });
    },

    renderChart: () => {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        const chartData = history.slice(0, 10).reverse(); 

        if (app.myChart) app.myChart.destroy();
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(108, 92, 231, 0.5)');
        gradient.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

        app.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map((_, i) => `G${i + 1}`),
                datasets: [{
                    label: 'Score',
                    data: chartData.map(item => item.score),
                    borderColor: '#6c5ce7',
                    backgroundColor: gradient,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
};

// --- KEYBOARD SUPPORT ---
window.addEventListener('keydown', (e) => {
    // Only work if in game view
    if (!document.getElementById('view-game').classList.contains('active')) return;
    
    // Check if locked
    if (app.isProcessing) return; 

    const key = e.key;
    const buttons = document.querySelectorAll('.option-btn');
    
    if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key) - 1;
        if (buttons[index]) {
            buttons[index].click(); 
            // Visual press effect
            buttons[index].style.transform = "scale(0.95)";
            setTimeout(() => buttons[index].style.transform = "scale(1)", 100);
        }
    }
});

window.onload = () => {
    app.loadStats();
};