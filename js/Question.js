/**
 * Question Class
 * Responsible for generating adaptive arithmetic problems.
 * Includes infinite loop protection and safe distractor generation.
 */
class Question {
    constructor(difficulty = 1) {
        this.difficulty = difficulty;
        this.num1 = 0;
        this.num2 = 0;
        this.operator = ''; 
        this.correctAnswer = 0;
        this.options = [];
        
        this.generate();
    }

    generate() {
        const opType = this.selectOperator();
        this.generateNumbers(opType);
        this.calculateAnswer(opType);
        this.generateDistractors();
    }

    // Adapt operators based on difficulty level
    selectOperator() {
        let ops = [];
        if (this.difficulty === 1) ops = ['+', '-'];
        else if (this.difficulty === 2) ops = ['+', '-', '*'];
        else ops = ['+', '-', '*', '/'];

        return ops[Math.floor(Math.random() * ops.length)];
    }

    generateNumbers(op) {
        const max = this.difficulty * 10; 

        if (op === '/') {
            // Reverse engineering division for whole numbers
            // e.g., 21 / 7 = 3 (Derived from 3 * 7)
            this.num2 = Math.floor(Math.random() * (max / 2)) + 2; 
            this.correctAnswer = Math.floor(Math.random() * 10) + 1; 
            this.num1 = this.num2 * this.correctAnswer; 
        } else {
            this.num1 = Math.floor(Math.random() * max) + 1;
            this.num2 = Math.floor(Math.random() * max) + 1;
        }
    }

    calculateAnswer(op) {
        this.operator = op;
        switch(op) {
            case '+': this.correctAnswer = this.num1 + this.num2; break;
            case '-': this.correctAnswer = this.num1 - this.num2; break;
            case '*': this.correctAnswer = this.num1 * this.num2; break;
            case '/': break; // Already set in generateNumbers
        }
    }

    generateDistractors() {
        let opts = new Set([this.correctAnswer]);
        let attempts = 0; 

        // Generate 3 unique wrong answers
        while (opts.size < 4) {
            attempts++;
            let wrong;

            // Failsafe: If finding a number is hard, pick random to prevent freezing
            if (attempts > 50) {
                wrong = Math.floor(Math.random() * 100) + 1;
            } else {
                // Intelligent distractor: Close to the real answer
                let offset = Math.floor(Math.random() * 10) - 5;
                wrong = this.correctAnswer + offset;
            }

            if (wrong > 0 && wrong !== this.correctAnswer) {
                opts.add(wrong);
            }
        }
        
        // Shuffle options
        this.options = Array.from(opts).sort(() => Math.random() - 0.5);
    }

    getDisplay() {
        let displayOp = this.operator;
        if (this.operator === '*') displayOp = '×';
        if (this.operator === '/') displayOp = '÷';
        return `${this.num1} ${displayOp} ${this.num2} = ?`;
    }
}