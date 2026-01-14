/**
 * Main Controller (Enhanced Version)
 * Connects the UI (HTML) to the Logic (Game & Question classes).
 * Includes: Game Loop, UI Updates, LocalStorage Saving, and Chart.js Analytics.
 */

const app = {
    game: new Game(), // Initialize the Game engine
    myChart: null,    // Placeholder for the Chart instance
    uiTimer: null,    // Placeholder for the UI interval

    // --- Navigation Functions ---
    showView: (viewId) => {
        // Hide all views first
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        
        // Show target view with a fade-in effect
        const target = document.getElementById(viewId);
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 50); 
    },

    startGame: () => {
        app.game.start();
        app.updateTimerDisplay(); 
        app.updateScoreDisplay();
        
        // Hide feedback from previous games
        document.getElementById('feedback-message').textContent = "";
        
        app.showView('view-game');
        app.renderQuestion();
        
        // Start the UI timer loop (syncs with Game logic)
        if (app.uiTimer) clearInterval(app.uiTimer);
        app.uiTimer = setInterval(() => {
            app.updateTimerDisplay();
            if (!app.game.isActive) {
                app.finishGame();
            }
        }, 1000);
    },

    finishGame: () => {
        clearInterval(app.uiTimer);
        
        // Update Results Screen Data
        document.getElementById('final-score').textContent = app.game.score;
        document.getElementById('accuracy').textContent = app.game.getAccuracy() + "%";
        
        // Save to History (LocalStorage)
        app.saveProgress();
        
        app.showView('view-result');
    },

    returnHome: () => {
        app.showView('view-home');
        app.loadStats(); // Refresh stats on home screen
    },

    // --- Gameplay Functions ---
    renderQuestion: () => {
        const q = app.game.currentQuestion;
        
        // Update Question Text
        document.getElementById('question-display').textContent = q.getDisplay();
        
        // Update Difficulty Badge
        const diffBadge = document.getElementById('difficulty-indicator');
        diffBadge.textContent = `Level ${app.game.difficulty}`;
        
        // Generate Buttons
        const container = document.getElementById('options-container');
        container.innerHTML = ''; // Clear old buttons
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => app.handleAnswer(opt, btn);
            container.appendChild(btn);
        });
    },

    // --- UPDATED GAMEPLAY FUNCTION (Replace existing handleAnswer) ---

    handleAnswer: (selectedOption, btnElement) => {
        if (!app.game.isActive) return;

        const isCorrect = app.game.submitAnswer(selectedOption);
        
        // --- NEW SOUND LOGIC START ---
        // We create the audio object dynamically to ensure it plays every time
        const soundFile = isCorrect ? 'assets/correct.mp3' : 'assets/wrong.mp3';
        const audio = new Audio(soundFile);
        
        // Try to play and catch any errors (logs to console so you can see why it fails)
        audio.play().catch(e => console.error("Sound Error:", e));
        // --- NEW SOUND LOGIC END ---

        // Visual Feedback
        const fbMessage = document.getElementById('feedback-message');
        if (isCorrect) {
            btnElement.classList.add('correct');
            fbMessage.textContent = "Correct! +10 pts";
            fbMessage.style.color = "var(--success)";
        } else {
            btnElement.classList.add('wrong');
            fbMessage.textContent = "Wrong! -5s";
            fbMessage.style.color = "var(--danger)";
        }

        app.updateScoreDisplay();
        app.updateTimerDisplay(); 

        setTimeout(() => {
            fbMessage.textContent = "";
            if (app.game.isActive) {
                app.game.nextQuestion();
                app.renderQuestion();
            }
        }, 800);
    },

    updateTimerDisplay: () => {
        const timerEl = document.getElementById('timer');
        // Format time as 00:00
        const minutes = Math.floor(app.game.timeLeft / 60);
        const seconds = app.game.timeLeft % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Turn red if time is low (Visual Urgency)
        if (app.game.timeLeft <= 10) timerEl.style.color = "#e74c3c"; // Red
        else timerEl.style.color = "#2c3e50"; // Dark Blue
    },

    updateScoreDisplay: () => {
        document.getElementById('score').textContent = app.game.score;
    },

    // --- Progress Tracking & Analytics ---
    saveProgress: () => {
        const result = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            score: app.game.score,
            accuracy: app.game.getAccuracy()
        };

        // Get existing history or empty array
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        history.unshift(result); // Add new result to the top
        
        // Limit history to last 20 games to save space
        if (history.length > 20) history.pop();
        
        localStorage.setItem('mathMasterHistory', JSON.stringify(history));
    },

    showProgress: () => {
        app.loadHistoryUI();
        app.showView('view-progress');
        
        // Render the Chart if Chart.js is loaded
        if (typeof Chart !== 'undefined') {
            app.renderChart();
        } else {
            console.warn("Chart.js not loaded. Graph will not appear.");
        }
    },

    loadStats: () => {
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        const totalGames = history.length;
        const highScore = history.reduce((max, item) => Math.max(max, item.score), 0);
        const totalXP = history.reduce((sum, item) => sum + item.score, 0);
        
        // Update Header Stats
        const xpEl = document.getElementById('total-xp');
        if(xpEl) xpEl.textContent = totalXP;
        
        // Update Dashboard Stats
        const gamesEl = document.getElementById('stat-games');
        const highEl = document.getElementById('stat-high');
        if(gamesEl) gamesEl.textContent = totalGames;
        if(highEl) highEl.textContent = highScore;
    },

    loadHistoryUI: () => {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];

        if (history.length === 0) {
            list.innerHTML = '<li class="history-item" style="justify-content:center">No games played yet. Start learning!</li>';
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            // Color code the score based on performance
            let scoreColor = 'var(--dark)';
            if(item.score >= 100) scoreColor = 'var(--success)';
            
            li.innerHTML = `
                <span>${item.date}</span> 
                <span style="color:${scoreColor}; font-weight:bold;">${item.score} pts</span>
                <span style="font-size:0.9em; color:#777">(${item.accuracy}%)</span>
            `;
            list.appendChild(li);
        });
    },

    renderChart: () => {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return; // Guard clause if canvas is missing

        const history = JSON.parse(localStorage.getItem('mathMasterHistory')) || [];
        
        // Prepare data: reverse so oldest is on the left
        const chartData = history.slice(0, 10).reverse(); 

        // Destroy previous chart to prevent "flickering" or memory leaks
        if (app.myChart) {
            app.myChart.destroy();
        }

        app.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map((_, i) => `Game ${i + 1}`),
                datasets: [{
                    label: 'Score History',
                    data: chartData.map(item => item.score),
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    tension: 0.3, // Smooth curves
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
};

// Initialize App when the window loads
window.onload = () => {
    app.loadStats();
};