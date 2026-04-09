import { starterGames } from "../data/games";
import type { ProgressState } from "../store/brain-curls-store";

const GAME_UNLOCKS: Array<{ slug: string; runs: number }> = [
  { slug: "sequence-memory", runs: 0 },
  { slug: "grid-memory", runs: 2 },
  { slug: "number-span", runs: 4 },
  { slug: "stroop-shift", runs: 6 },
  { slug: "pattern-completion", runs: 8 },
  { slug: "word-association", runs: 10 },
  { slug: "target-tracking", runs: 12 },
];

const BADGE_THRESHOLDS = [
  { name: "First Curl", when: (progress: ProgressState) => progress.totalRuns >= 1 },
  { name: "Three-Day Streak", when: (progress: ProgressState) => progress.currentStreak >= 3 },
  { name: "Consistency", when: (progress: ProgressState) => progress.bestStreak >= 7 },
  { name: "Ten Runs", when: (progress: ProgressState) => progress.totalRuns >= 10 },
  { name: "Peak Set", when: (progress: ProgressState) => progress.bestRunScore >= 900 },
];

export function getUnlockedGameSlugs(progress: ProgressState) {
  return GAME_UNLOCKS.filter((unlock) => progress.totalRuns >= unlock.runs).map((unlock) => unlock.slug);
}

export function getEarnedBadges(progress: ProgressState) {
  return BADGE_THRESHOLDS.filter((badge) => badge.when(progress)).map((badge) => badge.name);
}

export function getNextUnlock(progress: ProgressState) {
  const nextGame = GAME_UNLOCKS.find((unlock) => progress.totalRuns < unlock.runs);
  if (!nextGame) return null;

  const remainingRuns = Math.max(0, nextGame.runs - progress.totalRuns);
  return {
    label: starterGames.find((game) => game.slug === nextGame.slug)?.name ?? nextGame.slug,
    remainingRuns,
  };
}
