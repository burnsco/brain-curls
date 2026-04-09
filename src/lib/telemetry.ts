import { starterGames } from "../data/games";
import { getNextUnlock, getUnlockSteps } from "./progression";
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

export interface GameTelemetry {
  slug: string;
  name: string;
  runs: number;
  bestScore: number;
  averageAccuracy: number;
  averageReactionMs: number;
  lastPlayedAt: number | null;
  summary: string;
}

export interface UnlockTelemetry {
  slug: string;
  name: string;
  runsRequired: number;
  unlocked: boolean;
  summary: string;
  status: string;
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

export function buildGameTelemetry(progress: ProgressState): GameTelemetry[] {
  return starterGames.map((game) => {
    const runs = progress.recentRuns.filter((run) => run.slug === game.slug);
    const totalAccuracy = runs.reduce((sum, run) => sum + run.accuracy, 0);
    const totalReactionMs = runs.reduce((sum, run) => sum + run.reactionMs, 0);
    const bestScore = runs.reduce((best, run) => Math.max(best, run.score), 0);
    const lastPlayedAt = runs[0]?.completedAt ?? null;
    const summary =
      runs.length === 0
        ? "Not played yet. This drill will appear in the queue after unlocking."
        : runs.length === 1
          ? `First pass landed at ${Math.round(runs[0].accuracy * 100)}% accuracy.`
          : `Average ${Math.round((totalAccuracy / runs.length) * 100)}% accuracy across ${runs.length} runs.`;

    return {
      slug: game.slug,
      name: game.name,
      runs: runs.length,
      bestScore,
      averageAccuracy: runs.length ? totalAccuracy / runs.length : 0,
      averageReactionMs: runs.length ? totalReactionMs / runs.length : 0,
      lastPlayedAt,
      summary,
    };
  });
}

export function buildUnlockTelemetry(progress: ProgressState): UnlockTelemetry[] {
  const steps = getUnlockSteps(progress);
  const nextUnlock = getNextUnlock(progress);

  return steps.map((step, index) => {
    const previous = index > 0 ? steps[index - 1] : null;
    const unlockedCount = steps.filter((item) => item.unlocked).length;

    const summary = step.unlocked
      ? `${step.name} is already available, so it can stay in the workout queue.`
      : `${step.name} opens after ${step.runsRequired} total runs.`;

    const status = step.unlocked
      ? "Unlocked"
      : nextUnlock?.label === step.name
        ? `Next unlock in ${nextUnlock.remainingRuns} run${nextUnlock.remainingRuns === 1 ? "" : "s"}`
        : `Queued behind ${Math.max(0, step.runsRequired - progress.totalRuns)} more run${Math.max(0, step.runsRequired - progress.totalRuns) === 1 ? "" : "s"}`;

    const detail = previous
      ? `${previous.name} opens before this drill, then the queue expands to ${Math.max(0, unlockedCount)} unlocked games.`
      : "This is the starter baseline and is always available.";

    return {
      slug: step.slug,
      name: step.name,
      runsRequired: step.runsRequired,
      unlocked: step.unlocked,
      summary: `${summary} ${detail}`,
      status,
    };
  });
}
