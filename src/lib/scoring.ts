import type { CognitiveDomain } from "../types";

export interface RunMetrics {
  accuracy: number;
  reactionMs: number;
  level: number;
}

export function scoreRun(metrics: RunMetrics): number {
  const accuracyScore = Math.round(metrics.accuracy * 700);
  const speedScore = Math.max(0, Math.round((1200 - metrics.reactionMs) / 3));
  const levelScore = metrics.level * 28;

  return Math.max(25, accuracyScore + speedScore + levelScore);
}

export function levelFromRecentRuns(totalRuns: number, bestScore: number): number {
  const base = 1 + Math.floor(totalRuns / 3);
  const bonus = Math.floor(bestScore / 450);

  return Math.max(1, Math.min(12, base + bonus));
}

export function domainWeight(domain: CognitiveDomain): number {
  switch (domain) {
    case "Memory":
      return 1.08;
    case "Attention":
      return 1.04;
    case "Speed":
      return 1.1;
    case "Reasoning":
      return 1.06;
    case "Spatial":
      return 1.03;
    case "Language":
      return 1.02;
    default:
      return 1;
  }
}
