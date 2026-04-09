export interface PerformanceSample {
  accuracy: number;
  reactionMs: number;
  streak: number;
}

export interface DifficultyState {
  level: number;
  targetAccuracy: number;
  speedBudgetMs: number;
}

export function estimateNextDifficulty(sample: PerformanceSample): DifficultyState {
  const accuracyBonus = Math.round((sample.accuracy - 0.75) * 10);
  const streakBonus = Math.min(3, Math.floor(sample.streak / 3));
  const level = Math.max(1, 5 + accuracyBonus + streakBonus);

  return {
    level,
    targetAccuracy: 0.78,
    speedBudgetMs: Math.max(450, Math.round(sample.reactionMs * 0.88)),
  };
}
