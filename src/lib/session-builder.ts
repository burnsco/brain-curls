export type DailySessionMode = "balanced" | "memory" | "attention" | "speed" | "reasoning";
export type DailySessionLength = 6 | 8 | 10;

export interface WorkoutProfile {
  reducedMotion: boolean;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
}

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

const LOW_MOTION_GAMES = new Set([
  "sequence-memory",
  "grid-memory",
  "number-span",
  "pattern-completion",
  "word-association",
]);

const HIGH_MOTION_GAMES = new Set(["stroop-shift", "target-tracking", "reaction-drill"]);

function orderForProfile(slugs: string[], profile?: WorkoutProfile) {
  if (!profile) return slugs;

  return [...slugs].sort((left, right) => {
    let leftScore = 0;
    let rightScore = 0;

    if (profile.reducedMotion) {
      leftScore += LOW_MOTION_GAMES.has(left) ? 0 : 2;
      rightScore += LOW_MOTION_GAMES.has(right) ? 0 : 2;
      leftScore += HIGH_MOTION_GAMES.has(left) ? 4 : 0;
      rightScore += HIGH_MOTION_GAMES.has(right) ? 4 : 0;
    }

    if (!profile.audioEnabled || !profile.hapticsEnabled) {
      leftScore += left === "reaction-drill" ? 1 : 0;
      rightScore += right === "reaction-drill" ? 1 : 0;
    }

    return leftScore - rightScore;
  });
}

export function buildDailyWorkoutQueue(
  unlockedGameSlugs: string[],
  mode: DailySessionMode,
  minutes: DailySessionLength,
  profile?: WorkoutProfile,
) {
  const count = LENGTH_TO_COUNT[minutes];
  const ordered = MODE_ORDERS[mode].filter((slug) => unlockedGameSlugs.includes(slug));
  return orderForProfile(ordered, profile).slice(0, count);
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
