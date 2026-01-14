/**
 * Game Class (Enhanced)
 * Manages game state, scoring, adaptive difficulty, and now STREAKS.
 */
class Game {
    constructor() {
        this.score = 0;
        this.timeLeft = 60; // 60 seconds per game
        this.timerInterval = null;
        this.isActive = false;
        this.currentQuestion = null;
        this.difficulty = 1; 
        
        // Performance Tracking
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        
        // --- NEW: Gamification Features ---
        this.streak = 0;      // Current winning streak
        this.maxStreak = 0;   // Highest streak in this session
    }

    start() {
        this.score = 0;
        this.timeLeft = 60;
        this.difficulty = 1;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.isActive = true;
        
        this.startTimer();
        this.nextQuestion();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.endGame();
            }
        }, 1000);
    }

    nextQuestion() {
        if (!this.isActive) return;

        // Adaptive Difficulty: Level up every 50 points
        if (this.score > 100) this.difficulty = 3;
        else if (this.score > 50) this.difficulty = 2;
        else this.difficulty = 1;

        this.currentQuestion = new Question(this.difficulty);
    }

    submitAnswer(userAnswer) {
        if (!this.isActive) return false;

        this.totalQuestions++;
        const isCorrect = (userAnswer === this.currentQuestion.correctAnswer);

        if (isCorrect) {
            // --- NEW: Streak Logic ---
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;

            // Score Calculation: Base 10 + (Streak Bonus * 2)
            // Example: Streak 3 gives 10 + 6 = 16 points
            this.score += 10 + (this.streak * 2);
            
            this.correctAnswers++;
            this.timeLeft += 2; // Time bonus
        } else {
            // Reset streak on wrong answer
            this.streak = 0;
            this.timeLeft -= 5; // Time penalty
        }

        return isCorrect;
    }

    endGame() {
        this.isActive = false;
        clearInterval(this.timerInterval);
    }

    getAccuracy() {
        if (this.totalQuestions === 0) return 0;
        return Math.round((this.correctAnswers / this.totalQuestions) * 100);
    }
}