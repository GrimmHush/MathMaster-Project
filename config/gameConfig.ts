export const GAME_CONFIG = {
  ROUND_DURATION_SEC: 60,
  BASE_XP_PER_CORRECT: 10,
  MAX_SPEED_BONUS: 20, // Max bonus if answered immediately at 60s
  BASE_LEVEL_XP: 100, // Level N costs N^2 * 100 XP
  STREAK_MULTIPLIER_STEP: 0.1, // +0.1x per consecutive correct answer
  MAX_STREAK_MULTIPLIER: 2.5,
};

export const ACHIEVEMENTS = [
  { id: 'first_blood', title: 'First Blood', description: 'Answer your first question correctly', type: 'volume', threshold: 1, icon: '🎯' },
  { id: 'streak_10', title: 'Streak Master', description: 'Get 10 correct answers in a row', type: 'streak', threshold: 10, icon: '🔥' },
  { id: 'math_wizard', title: 'Math Wizard', description: 'Earn your first 500 XP', type: 'xp', threshold: 500, icon: '🧙‍♂️' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Answer correctly with 55+ seconds left', type: 'speed', threshold: 55, icon: '⚡' },
  { id: 'accuracy_king', title: 'Sharpshooter', description: 'Finish a round with 100% accuracy', type: 'accuracy', threshold: 100, icon: '👑' }
];

// Calculate Level based on N^2 formula
export const calculateLevel = (totalXp: number): number => {
  if (totalXp <= 0) return 1;
  // totalXP = Level^2 * BASE_LEVEL_XP => Level = sqrt(totalXP / BASE_LEVEL_XP)
  const level = Math.floor(Math.sqrt(totalXp / GAME_CONFIG.BASE_LEVEL_XP));
  return Math.max(1, level); // Minimum level 1
};