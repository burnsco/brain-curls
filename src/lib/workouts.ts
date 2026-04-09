import type { TrainingGame } from "../types";
import { starterGames } from "../data/games";

export function getPlayableGames() {
  return starterGames.filter((game) => game.status !== "planned");
}

export function getGameBySlug(slug: string): TrainingGame | undefined {
  return starterGames.find((game) => game.slug === slug);
}

export function getDefaultWorkoutSlugs(unlockedSlugs: string[] = []): string[] {
  const preferredOrder = [
    "sequence-memory",
    "grid-memory",
    "number-span",
    "stroop-shift",
    "pattern-completion",
    "word-association",
    "target-tracking",
  ];

  return preferredOrder.filter((slug) => unlockedSlugs.includes(slug));
}

export function getNextWorkoutSlug(currentSlug: string, queue: string[]): string | null {
  const currentIndex = queue.indexOf(currentSlug);
  if (currentIndex < 0) return queue[0] ?? null;
  return queue[currentIndex + 1] ?? null;
}
