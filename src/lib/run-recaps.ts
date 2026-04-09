import type { TrainingGame } from "../types";
import type { GameRunRecord } from "../store/brain-curls-store";

export interface GameEndRecap {
  title: string;
  description: string;
  nextStep: string;
  tag: string;
}

export interface ReplayStats {
  attempts: number;
  bestScore: number;
  averageAccuracy: number;
  averageReactionMs: number;
  recentRuns: GameRunRecord[];
}

const ENDINGS: Record<string, { high: string; medium: string; low: string }> = {
  "sequence-memory": {
    high: "Sequence held cleanly from start to finish.",
    medium: "Sequence stayed mostly intact under pressure.",
    low: "Sequence broke down, but the recall signal is there.",
  },
  "grid-memory": {
    high: "Pattern encoding was crisp and visual recall stayed stable.",
    medium: "You recovered the tile pattern with only a few misses.",
    low: "The visual grid needs another pass, especially under delay.",
  },
  "number-span": {
    high: "Number span stayed locked even as the string got longer.",
    medium: "You held the series together, with a few slips at the end.",
    low: "Working memory dropped under load; that’s the exact stress we want.",
  },
  "reaction-drill": {
    high: "Reaction speed stayed high and the response window was tight.",
    medium: "Responses were quick, with a few late taps in the middle.",
    low: "Speed dipped under pressure, which gives you a clear reset target.",
  },
  "stroop-shift": {
    high: "Inhibition stayed steady and the color-word conflict stayed under control.",
    medium: "You handled the conflict well, but a few word traps got through.",
    low: "The interference layer is doing its job; keep training the override.",
  },
  "target-tracking": {
    high: "Target tracking stayed locked through movement and distraction.",
    medium: "You held the target well, even if a few transitions slipped away.",
    low: "Tracking drifted under motion, which is exactly the challenge this game needs.",
  },
  "pattern-completion": {
    high: "Pattern inference snapped into place with minimal hesitation.",
    medium: "You spotted the next step with solid reasoning and a few pauses.",
    low: "The sequence logic needs another look, but the structure is trainable.",
  },
  "word-association": {
    high: "Word meaning came back fast and the distractors did not stick.",
    medium: "Semantic choices were solid, with a few close calls.",
    low: "Association speed fell behind the distractors, which is the right pressure point.",
  },
};

function summarizeRun(game: TrainingGame, accuracy: number) {
  const level = accuracy >= 0.9 ? "high" : accuracy >= 0.75 ? "medium" : "low";
  const ending = ENDINGS[game.slug]?.[level] ?? "The run is complete and ready for a replay.";
  const tag =
    level === "high" ? "clean run" : level === "medium" ? "solid set" : "needs another pass";

  return {
    title: game.name,
    description: ending,
    nextStep:
      level === "high"
        ? "Move up in difficulty on the next pass."
        : level === "medium"
          ? "Replay once more to tighten accuracy."
          : "Re-run the drill before moving to the next game.",
    tag,
  };
}

export function getGameEndRecap(game: TrainingGame, metrics: { accuracy: number; reactionMs: number; score: number }) {
  const summary = summarizeRun(game, metrics.accuracy);
  const reactionNote =
    metrics.reactionMs < 450 ? "Fast reactions" : metrics.reactionMs < 700 ? "Controlled tempo" : "Needs faster responses";

  return {
    ...summary,
    title: `${summary.title} complete`,
    description: `${summary.description} Score ${metrics.score}. ${reactionNote}.`,
  } satisfies GameEndRecap;
}

export function getReplayStats(recentRuns: GameRunRecord[], slug: string): ReplayStats {
  const gameRuns = recentRuns.filter((run) => run.slug === slug);
  const totalAccuracy = gameRuns.reduce((sum, run) => sum + run.accuracy, 0);
  const totalReactionMs = gameRuns.reduce((sum, run) => sum + run.reactionMs, 0);

  return {
    attempts: gameRuns.length,
    bestScore: gameRuns.reduce((best, run) => Math.max(best, run.score), 0),
    averageAccuracy: gameRuns.length ? totalAccuracy / gameRuns.length : 0,
    averageReactionMs: gameRuns.length ? totalReactionMs / gameRuns.length : 0,
    recentRuns: gameRuns.slice(0, 3),
  };
}
