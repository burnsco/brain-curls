export type DailySessionMode = "balanced" | "memory" | "attention" | "speed" | "reasoning";
export type DailySessionLength = 6 | 8 | 10;

const MODE_ORDERS: Record<DailySessionMode, string[]> = {
  balanced: [
    "sequence-memory",
    "grid-memory",
    "number-span",
    "stroop-shift",
    "pattern-completion",
    "word-association",
    "target-tracking",
  ],
  memory: ["sequence-memory", "grid-memory", "number-span", "pattern-completion"],
  attention: ["stroop-shift", "target-tracking", "sequence-memory", "grid-memory"],
  speed: ["stroop-shift", "word-association", "number-span", "pattern-completion"],
  reasoning: ["pattern-completion", "word-association", "sequence-memory", "number-span"],
};

const LENGTH_TO_COUNT: Record<DailySessionLength, number> = {
  6: 3,
  8: 4,
  10: 5,
};

export function buildDailyWorkoutQueue(
  unlockedGameSlugs: string[],
  mode: DailySessionMode,
  minutes: DailySessionLength,
) {
  const count = LENGTH_TO_COUNT[minutes];
  return MODE_ORDERS[mode].filter((slug) => unlockedGameSlugs.includes(slug)).slice(0, count);
}

export function getModeLabel(mode: DailySessionMode) {
  switch (mode) {
    case "memory":
      return "Memory Focus";
    case "attention":
      return "Attention Focus";
    case "speed":
      return "Speed Focus";
    case "reasoning":
      return "Reasoning Focus";
    case "balanced":
    default:
      return "Balanced Mix";
  }
}

export function getLengthLabel(minutes: DailySessionLength) {
  return `${minutes} min`;
}
