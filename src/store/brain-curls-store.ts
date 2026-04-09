import { useSyncExternalStore } from "react";
import { pillars } from "../data/pillars";
import type { CognitiveDomain, TrainingGame } from "../types";
import { levelFromRecentRuns, scoreRun } from "../lib/scoring";
import { getEarnedBadges, getUnlockedGameSlugs, getNextUnlock } from "../lib/progression";

export interface GameRunRecord {
  slug: string;
  name: string;
  domain: CognitiveDomain;
  accuracy: number;
  reactionMs: number;
  score: number;
  level: number;
  completedAt: number;
}

export interface DomainProgress {
  bestScore: number;
  totalAccuracy: number;
  totalReactionMs: number;
  runs: number;
}

export interface ProgressState {
  totalSessions: number;
  totalRuns: number;
  totalScore: number;
  bestRunScore: number;
  currentStreak: number;
  bestStreak: number;
  cognitiveLevel: number;
  lastPlayedAt: number | null;
  domainProgress: Record<CognitiveDomain, DomainProgress>;
  recentRuns: GameRunRecord[];
  unlockedGameSlugs: string[];
  earnedBadges: string[];
  nextUnlock: { label: string; remainingRuns: number } | null;
}

export interface SessionState {
  id: string;
  startedAt: number;
  gameSlugs: string[];
  completedSlugs: string[];
}

export interface BrainCurlsState {
  progress: ProgressState;
  session: SessionState | null;
}

const STORAGE_KEY = "brain-curls:state:v1";
const MAX_RECENT_RUNS = 8;

const defaultDomainProgress = (): Record<CognitiveDomain, DomainProgress> => {
  return pillars.reduce(
    (acc, pillar) => {
      acc[pillar.title] = {
        bestScore: 0,
        totalAccuracy: 0,
        totalReactionMs: 0,
        runs: 0,
      };
      return acc;
    },
    {} as Record<CognitiveDomain, DomainProgress>,
  );
};

const defaultProgress = (): ProgressState => ({
  totalSessions: 0,
  totalRuns: 0,
  totalScore: 0,
  bestRunScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  cognitiveLevel: 1,
  lastPlayedAt: null,
  domainProgress: defaultDomainProgress(),
  recentRuns: [],
  unlockedGameSlugs: [],
  earnedBadges: [],
  nextUnlock: null,
});

const defaultState = (): BrainCurlsState => ({
  progress: enrichProgress(defaultProgress()),
  session: null,
});

function enrichProgress(progress: ProgressState): ProgressState {
  return {
    ...progress,
    unlockedGameSlugs: getUnlockedGameSlugs(progress),
    earnedBadges: getEarnedBadges(progress),
    nextUnlock: getNextUnlock(progress),
  };
}

let state = loadState();
const listeners = new Set<() => void>();

function loadState(): BrainCurlsState {
  if (typeof window === "undefined") {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<BrainCurlsState>;
    const parsedProgress: Partial<ProgressState> = parsed.progress ?? {};
    const parsedDomainProgress = parsedProgress.domainProgress ?? {};
    const mergedProgress: ProgressState = {
      ...defaultProgress(),
      ...parsedProgress,
      domainProgress: {
        ...defaultDomainProgress(),
        ...parsedDomainProgress,
      },
    };
    return {
      progress: enrichProgress(mergedProgress),
      session: parsed.session ?? null,
    };
  } catch {
    return defaultState();
  }
}

function persistState(nextState: BrainCurlsState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function notify() {
  persistState(state);
  listeners.forEach((listener) => listener());
}

function updateState(updater: (current: BrainCurlsState) => BrainCurlsState) {
  state = updater(state);
  notify();
}

function getActiveSessionIndex(session: SessionState | null) {
  if (!session) return 0;
  return session.completedSlugs.length;
}

export function getBrainCurlsState() {
  return state;
}

export function useBrainCurlsState() {
  return useSyncExternalStore(subscribe, getBrainCurlsState, getBrainCurlsState);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startWorkout(gameSlugs: string[]) {
  updateState((current) => ({
    ...current,
    progress: {
      ...current.progress,
      totalSessions: current.progress.totalSessions + 1,
    },
    session: {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      startedAt: Date.now(),
      gameSlugs,
      completedSlugs: [],
    },
  }));
}

export function completeGameRun(game: TrainingGame, metrics: { accuracy: number; reactionMs: number }) {
  const current = state;
  const score = scoreRun({
    accuracy: metrics.accuracy,
    reactionMs: metrics.reactionMs,
    level: current.progress.cognitiveLevel,
  });
  const nextLevel = levelFromRecentRuns(current.progress.totalRuns + 1, Math.max(score, current.progress.bestRunScore));
  const now = Date.now();
  const run: GameRunRecord = {
    slug: game.slug,
    name: game.name,
    domain: game.domains[0],
    accuracy: metrics.accuracy,
    reactionMs: metrics.reactionMs,
    score,
    level: nextLevel,
    completedAt: now,
  };

  updateState((currentState) => {
    const domainState = currentState.progress.domainProgress[run.domain];
    const nextDomainState: DomainProgress = {
      bestScore: Math.max(domainState.bestScore, score),
      totalAccuracy: domainState.totalAccuracy + metrics.accuracy,
      totalReactionMs: domainState.totalReactionMs + metrics.reactionMs,
      runs: domainState.runs + 1,
    };

    const nextCompleted = new Set(currentState.session?.completedSlugs ?? []);
    nextCompleted.add(game.slug);

    const nextProgress: ProgressState = {
      totalSessions: currentState.progress.totalSessions,
      totalRuns: currentState.progress.totalRuns + 1,
      totalScore: currentState.progress.totalScore + score,
      bestRunScore: Math.max(currentState.progress.bestRunScore, score),
      currentStreak: currentState.progress.currentStreak + 1,
      bestStreak: Math.max(currentState.progress.bestStreak, currentState.progress.currentStreak + 1),
      cognitiveLevel: run.level,
      lastPlayedAt: now,
      domainProgress: {
        ...currentState.progress.domainProgress,
        [run.domain]: nextDomainState,
      },
      recentRuns: [run, ...currentState.progress.recentRuns].slice(0, MAX_RECENT_RUNS),
      unlockedGameSlugs: currentState.progress.unlockedGameSlugs,
      earnedBadges: currentState.progress.earnedBadges,
      nextUnlock: currentState.progress.nextUnlock,
    };

    return {
      session: currentState.session
        ? {
            ...currentState.session,
            completedSlugs: Array.from(nextCompleted),
          }
        : null,
      progress: enrichProgress(nextProgress),
    };
  });

  return run;
}

export function resetWorkout() {
  updateState((current) => ({
    ...current,
    session: null,
  }));
}

export function finishWorkout() {
  resetWorkout();
}

export function resetProgress() {
  updateState(() => defaultState());
}

export function getWorkoutProgress() {
  return getActiveSessionIndex(state.session);
}
