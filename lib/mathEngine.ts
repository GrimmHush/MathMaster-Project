export type AgeGroup = '6-10' | '11-14' | 'neutral';

export interface MathProblem {
  num1: number;
  num2: number;
  operation: string;
  correctAnswer: number;
  options: number[];
  difficultyTier: number;
}

export const generateProblem = (playerLevel: number, ageGroup: AgeGroup): MathProblem => {
  // Determine internal tier based on player level (caps at Tier 5)
  const tier = Math.min(5, Math.ceil(playerLevel / 3)); 
  
  let num1 = 0, num2 = 0, correctAnswer = 0, op = '+';

  if (ageGroup === '6-10' || (ageGroup === 'neutral' && tier <= 2)) {
    // Division added at Tier 4+, Multiplication at Tier 3+
    const ops = tier >= 4 ? ['+', '-', '×', '÷'] : tier >= 3 ? ['+', '-', '×'] : ['+', '-'];
    op = ops[Math.floor(Math.random() * ops.length)];

    if (op === '+') {
      const max = tier * 10;
      num1 = Math.floor(Math.random() * max) + 1;
      num2 = Math.floor(Math.random() * max) + 1;
      correctAnswer = num1 + num2;
    } 
    else if (op === '-') {
      const max = tier * 12;
      num1 = Math.floor(Math.random() * max) + 5;
      num2 = Math.floor(Math.random() * num1) + 1; 
      correctAnswer = num1 - num2;
    }
    else if (op === '×') {
      const maxMultiplier = tier + 5; 
      num1 = Math.floor(Math.random() * maxMultiplier) + 1;
      num2 = Math.floor(Math.random() * maxMultiplier) + 1;
      correctAnswer = num1 * num2;
    }
    else if (op === '÷') {
      // Rookie Division: divisors and quotients kept under 10
      const quotient = Math.floor(Math.random() * 8) + 2; 
      num2 = Math.floor(Math.random() * 8) + 2;
      num1 = quotient * num2; 
      correctAnswer = quotient;
    }
  }
  
  else {
    const ops = tier > 2 ? ['+', '-', '×', '÷'] : ['+', '-', '×'];
    op = ops[Math.floor(Math.random() * ops.length)];

    if (op === '+') {
      const max = 50 + (tier * 50); // Tier 1: 100, Tier 5: 300
      num1 = Math.floor(Math.random() * max) + 10;
      num2 = Math.floor(Math.random() * max) + 10;
      // Introduce negative numbers at higher tiers
      if (tier > 3 && Math.random() > 0.5) num2 *= -1; 
      correctAnswer = num1 + num2;
    } 
    else if (op === '-') {
      const max = 50 + (tier * 50);
      num1 = Math.floor(Math.random() * max) + 10;
      num2 = Math.floor(Math.random() * max) + 10;
      if (tier > 2 && Math.random() > 0.7) num1 *= -1;
      correctAnswer = num1 - num2;
    }
    else if (op === '×') {
      const max = 10 + (tier * 5); // Tier 1: 15x15, Tier 5: 35x35
      num1 = Math.floor(Math.random() * max) + 2;
      num2 = Math.floor(Math.random() * max) + 2;
      if (tier > 3 && Math.random() > 0.8) num2 *= -1;
      correctAnswer = num1 * num2;
    }
    else if (op === '÷') {
      // Reverse-engineer division to guarantee whole numbers
      const maxDivisor = 5 + (tier * 3);
      correctAnswer = Math.floor(Math.random() * 20) + 2;
      num2 = Math.floor(Math.random() * maxDivisor) + 2;
      num1 = correctAnswer * num2; 
    }
  }

  // ==========================================
  // DISTRACTOR GENERATOR
  // ==========================================
  const numDistractors = ageGroup === '11-14' ? 3 : 2;
  const options = new Set<number>([correctAnswer]);

  let failsafe = 0;
  while (options.size < numDistractors + 1) {
    failsafe++;
    const variance = Math.max(5, Math.floor(Math.abs(correctAnswer) * 0.2)); 
    const direction = Math.random() > 0.5 ? 1 : -1;
    let distractor = correctAnswer + (Math.floor(Math.random() * variance) + 1) * direction;
    
    // Protect Rookie mode from generating negative distractors
    if (distractor < 0 && ageGroup === '6-10') distractor = Math.abs(distractor);
    
    options.add(distractor);
    if (failsafe > 50) options.add(correctAnswer + failsafe);
  }

  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return { 
    num1, 
    num2, 
    operation: op, 
    correctAnswer, 
    options: shuffledOptions, 
    difficultyTier: tier 
  };
};