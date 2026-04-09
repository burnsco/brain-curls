export function getDifficultyTier(level: number) {
  return Math.max(1, Math.min(8, 1 + Math.floor((level - 1) / 2)));
}

export function getSequenceMemoryConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    sequenceLength: Math.min(10, 4 + tier),
    revealMs: Math.max(1000, 2400 - tier * 190),
    requireReverseRecall: tier >= 4,
    askForIndexRecall: tier >= 6,
  };
}

export function getGridMemoryConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    gridSize: Math.min(5, 3 + Math.floor((tier - 1) / 2)),
    patternLength: Math.min(10, 3 + tier),
    revealMs: Math.max(900, 2400 - tier * 180),
    delayedRecall: tier >= 3,
  };
}

export function getNumberSpanConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    length: Math.min(12, 4 + tier),
    mode: tier >= 6 ? "sorted" : tier >= 4 ? "backward" : "forward",
  } as const;
}

export function getStroopConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    trials: Math.min(10, 4 + tier),
    congruentRate: Math.max(0.2, 0.5 - tier * 0.04),
  };
}

export function getTargetTrackingConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    pathPoints: 5 + tier,
    intervalMs: Math.max(360, 1120 - tier * 95),
  };
}

export function getPatternCompletionConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    length: Math.min(7, 4 + tier),
    options: Math.min(5, 4 + Math.floor(tier / 2)),
  };
}

export function getWordAssociationConfig(level: number) {
  const tier = getDifficultyTier(level);
  return {
    tier,
    options: Math.min(5, 4 + Math.floor(tier / 3)),
  };
}
