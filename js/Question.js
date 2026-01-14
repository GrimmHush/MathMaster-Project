/**
 * Question Class (Bug Fix Version)
 * Handles generation of arithmetic problems with safety checks to prevent freezing.
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
            // Ensure clean division (no decimals)
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
            case '/': break; // Already calculated
        }
    }

    generateDistractors() {
        // Start with the correct answer in the set
        let opts = new Set([this.correctAnswer]);
        
        // --- FIX: Add a safety counter to prevent infinite loops ---
        let attempts = 0; 

        while (opts.size < 4) {
            attempts++;
            let wrong;

            if (attempts > 50) {
                // SAFETY VALVE: If we are stuck, just pick ANY random number 1-100
                // This guarantees the loop will always exit
                wrong = Math.floor(Math.random() * 100) + 1;
            } else {
                // Normal Logic: Pick a number close to the answer
                let offset = Math.floor(Math.random() * 10) - 5;
                wrong = this.correctAnswer + offset;
            }

            // Ensure the number is positive and not the correct answer
            if (wrong > 0 && wrong !== this.correctAnswer) {
                opts.add(wrong);
            }
        }
        
        // Convert Set to Array and Shuffle
        this.options = Array.from(opts).sort(() => Math.random() - 0.5);
    }

    getDisplay() {
        let displayOp = this.operator;
        if (this.operator === '*') displayOp = '×';
        if (this.operator === '/') displayOp = '÷';
        return `${this.num1} ${displayOp} ${this.num2} = ?`;
    }
}