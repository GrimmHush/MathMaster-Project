/**
 * Game Class (Skill Mastery Version)
 * Now tracks accuracy per operator (+, -, *, /).
 */
class Game {
    constructor() {
        this.score = 0;
        this.timeLeft = 60; 
        this.timerInterval = null;
        this.isActive = false;
        this.currentQuestion = null;
        this.difficulty = 1; 
        
        // Performance Tracking
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        
        // Gamification
        this.streak = 0;      
        this.maxStreak = 0;   
        this.mistakes = [];   
        
        // NEW: Skill Mastery Tracking
        this.operatorStats = {
            '+': { total: 0, correct: 0 },
            '-': { total: 0, correct: 0 },
            '*': { total: 0, correct: 0 },
            '/': { total: 0, correct: 0 }
        };
    }

    start() {
        this.score = 0;
        this.timeLeft = 60;
        this.difficulty = 1;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.mistakes = []; 
        this.isActive = true;
        
        // Reset Stats
        this.operatorStats = {
            '+': { total: 0, correct: 0 },
            '-': { total: 0, correct: 0 },
            '*': { total: 0, correct: 0 },
            '/': { total: 0, correct: 0 }
        };
        
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

        // Adaptive Difficulty
        if (this.score > 100) this.difficulty = 3;
        else if (this.score > 50) this.difficulty = 2;
        else this.difficulty = 1;

        this.currentQuestion = new Question(this.difficulty);
    }

    submitAnswer(userAnswer) {
        if (!this.isActive) return false;

        this.totalQuestions++;
        const currentOp = this.currentQuestion.operator; // Get current operator (+, -, etc.)
        
        // Track Total Attempts per Operator
        if (this.operatorStats[currentOp]) {
            this.operatorStats[currentOp].total++;
        }

        const isCorrect = (userAnswer === this.currentQuestion.correctAnswer);

        if (isCorrect) {
            // Track Correct Answers per Operator
            if (this.operatorStats[currentOp]) {
                this.operatorStats[currentOp].correct++;
            }

            // Gamification Logic
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;
            this.score += 10 + (this.streak * 2);
            this.correctAnswers++;
            this.timeLeft += 2; 
        } else {
            // Record Mistake
            this.mistakes.push({
                question: this.currentQuestion.getDisplay().replace(' = ?', ''),
                userAnswer: userAnswer,
                correctAnswer: this.currentQuestion.correctAnswer
            });

            this.streak = 0;
            this.timeLeft -= 5;
        }

        return isCorrect;
    }

    endGame() {
        this.isActive = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    getAccuracy() {
        if (this.totalQuestions === 0) return 0;
        return Math.round((this.correctAnswers / this.totalQuestions) * 100);
    }
}