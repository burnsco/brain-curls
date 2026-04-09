import { estimateNextDifficulty, type DifficultyState } from "./difficulty";
import type { CognitiveDomain } from "../types";
import type { ProgressState } from "../store/brain-curls-store";

export interface DomainTelemetry {
  domain: CognitiveDomain;
  runs: number;
  averageAccuracy: number;
  averageReactionMs: number;
  bestScore: number;
  difficulty: DifficultyState;
  explanation: string;
  recommendation: string;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function summarizeTrend(domain: CognitiveDomain, averageAccuracy: number, averageReactionMs: number, runs: number) {
  if (runs === 0) {
    return {
      explanation: `${domain} has no recorded runs yet, so it is still at baseline difficulty.`,
      recommendation: "Build a baseline before raising the challenge.",
    };
  }

  if (averageAccuracy >= 0.85 && averageReactionMs <= 650) {
    return {
      explanation: `${domain} is stable at ${formatPercent(averageAccuracy)} accuracy with ${Math.round(averageReactionMs)} ms reactions.`,
      recommendation: "Raise difficulty or shorten the response window next time.",
    };
  }

  if (averageAccuracy >= 0.72) {
    return {
      explanation: `${domain} is holding steady at ${formatPercent(averageAccuracy)} accuracy with room to sharpen speed.`,
      recommendation: "Keep the current level and push reaction speed slightly.",
    };
  }

  return {
    explanation: `${domain} is still under pressure at ${formatPercent(averageAccuracy)} accuracy, which means the current load is doing useful work.`,
    recommendation: "Hold the difficulty steady until accuracy moves closer to target.",
  };
}

export function buildDomainTelemetry(progress: ProgressState): DomainTelemetry[] {
  return Object.entries(progress.domainProgress).map(([domain, stats]) => {
    const averageAccuracy = stats.runs ? stats.totalAccuracy / stats.runs : 0;
    const averageReactionMs = stats.runs ? stats.totalReactionMs / stats.runs : 0;
    const difficulty = estimateNextDifficulty({
      accuracy: stats.runs ? averageAccuracy : 0.75,
      reactionMs: stats.runs ? averageReactionMs : 750,
      streak: progress.currentStreak,
    });
    const trend = summarizeTrend(domain as CognitiveDomain, averageAccuracy, averageReactionMs, stats.runs);

    return {
      domain: domain as CognitiveDomain,
      runs: stats.runs,
      averageAccuracy,
      averageReactionMs,
      bestScore: stats.bestScore,
      difficulty,
      explanation: trend.explanation,
      recommendation: trend.recommendation,
    };
  });
}

export function buildOverallDifficultyTelemetry(progress: ProgressState) {
  const recent = progress.recentRuns[0];
  return estimateNextDifficulty({
    accuracy: recent ? recent.accuracy : 0.78,
    reactionMs: recent ? recent.reactionMs : 750,
    streak: progress.currentStreak,
  });
}
