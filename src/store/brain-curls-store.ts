import { useSyncExternalStore } from "react";
import { pillars } from "../data/pillars";
import type { CognitiveDomain, TrainingGame } from "../types";
import { levelFromRecentRuns, scoreRun } from "../lib/scoring";
import { getEarnedBadges, getUnlockedGameSlugs, getNextUnlock } from "../lib/progression";
import type { DailySessionLength, DailySessionMode } from "../lib/session-builder";

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
  onboardingComplete: boolean;
  dailySessionMode: DailySessionMode;
  dailySessionMinutes: DailySessionLength;
}

export interface AppSettings {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  dailySessionMode: DailySessionMode;
  dailySessionMinutes: DailySessionLength;
}

export interface SessionState {
  id: string;
  startedAt: number;
  gameSlugs: string[];
  completedSlugs: string[];
}

export interface WorkoutReviewState {
  completedAt: number;
  startedAt: number;
  durationMs: number;
  gameSlugs: string[];
  runCount: number;
  totalScore: number;
  averageAccuracy: number;
  averageReactionMs: number;
  bestScore: number;
  strongestDomain: CognitiveDomain | null;
}

export interface BrainCurlsState {
  progress: ProgressState;
  settings: AppSettings;
  session: SessionState | null;
  lastWorkoutReview: WorkoutReviewState | null;
}

export interface BrainCurlsBackup {
  version: number;
  exportedAt: string;
  progress: ProgressState;
  settings: AppSettings;
  session: SessionState | null;
}

interface LegacyBrainCurlsBackup {
  progress?: Partial<ProgressState>;
  settings?: Partial<AppSettings>;
  session?: SessionState | null;
}

const STORAGE_KEY = "brain-curls:state:v1";
const BACKUP_VERSION = 2;
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
  onboardingComplete: false,
  dailySessionMode: "balanced",
  dailySessionMinutes: 6,
});

const defaultSettings = (): AppSettings => ({
  audioEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  dailySessionMode: "balanced",
  dailySessionMinutes: 6,
});

const defaultState = (): BrainCurlsState => ({
  progress: enrichProgress(defaultProgress()),
  settings: defaultSettings(),
  session: null,
  lastWorkoutReview: null,
});

function enrichProgress(progress: ProgressState): ProgressState {
  return {
    ...progress,
    unlockedGameSlugs: getUnlockedGameSlugs(progress),
    earnedBadges: getEarnedBadges(progress),
    nextUnlock: getNextUnlock(progress),
  };
}

function normalizeState(snapshot: LegacyBrainCurlsBackup): BrainCurlsState {
  const parsedProgress: Partial<ProgressState> = snapshot.progress ?? {};
  const parsedSettings: Partial<AppSettings> = snapshot.settings ?? {};
  const parsedDomainProgress = parsedProgress.domainProgress ?? {};
  const mergedSettings: AppSettings = {
    ...defaultSettings(),
    ...parsedSettings,
    dailySessionMode: parsedSettings.dailySessionMode ?? parsedProgress.dailySessionMode ?? defaultSettings().dailySessionMode,
    dailySessionMinutes:
      parsedSettings.dailySessionMinutes ?? parsedProgress.dailySessionMinutes ?? defaultSettings().dailySessionMinutes,
  };
  const mergedProgress: ProgressState = {
    ...defaultProgress(),
    ...parsedProgress,
    dailySessionMode: mergedSettings.dailySessionMode,
    dailySessionMinutes: mergedSettings.dailySessionMinutes,
    domainProgress: {
      ...defaultDomainProgress(),
      ...parsedDomainProgress,
    },
  };

  return {
    progress: enrichProgress(mergedProgress),
    settings: mergedSettings,
    session: snapshot.session ?? null,
    lastWorkoutReview: null,
  };
}

function parseBackup(raw: string): LegacyBrainCurlsBackup {
  const parsed = JSON.parse(raw) as Partial<BrainCurlsBackup> | LegacyBrainCurlsBackup;

  if (typeof parsed === "object" && parsed && "version" in parsed) {
    const version = Number((parsed as Partial<BrainCurlsBackup>).version);
    if (version !== BACKUP_VERSION) {
      throw new Error(`Unsupported backup version: ${String((parsed as Partial<BrainCurlsBackup>).version)}`);
    }

    return {
      progress: (parsed as Partial<BrainCurlsBackup>).progress,
      settings: (parsed as Partial<BrainCurlsBackup>).settings,
      session: (parsed as Partial<BrainCurlsBackup>).session,
    };
  }

  return parsed as LegacyBrainCurlsBackup;
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
    return normalizeState(parseBackup(raw));
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

export function completeOnboarding() {
  updateState((current) => ({
    ...current,
    progress: {
      ...current.progress,
      onboardingComplete: true,
    },
  }));
}

export function setDailySessionPreferences(mode: DailySessionMode, minutes: DailySessionLength) {
  updateState((current) => ({
    ...current,
    settings: {
      ...current.settings,
      dailySessionMode: mode,
      dailySessionMinutes: minutes,
    },
    progress: {
      ...current.progress,
      dailySessionMode: mode,
      dailySessionMinutes: minutes,
    },
  }));
}

export function setAudioEnabled(audioEnabled: boolean) {
  updateState((current) => ({
    ...current,
    settings: {
      ...current.settings,
      audioEnabled,
    },
  }));
}

export function setHapticsEnabled(hapticsEnabled: boolean) {
  updateState((current) => ({
    ...current,
    settings: {
      ...current.settings,
      hapticsEnabled,
    },
  }));
}

export function setReducedMotionEnabled(reducedMotion: boolean) {
  updateState((current) => ({
    ...current,
    settings: {
      ...current.settings,
      reducedMotion,
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
      onboardingComplete: currentState.progress.onboardingComplete,
      dailySessionMode: currentState.progress.dailySessionMode,
      dailySessionMinutes: currentState.progress.dailySessionMinutes,
    };

    return {
      settings: currentState.settings,
      session: currentState.session
        ? {
            ...currentState.session,
            completedSlugs: Array.from(nextCompleted),
          }
        : null,
      progress: enrichProgress(nextProgress),
      lastWorkoutReview: currentState.lastWorkoutReview,
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
  updateState((current) => {
    const session = current.session;
    if (!session) {
      return {
        ...current,
        lastWorkoutReview: null,
      };
    }

    const sessionRuns = current.progress.recentRuns
      .filter((run) => run.completedAt >= session.startedAt && session.gameSlugs.includes(run.slug))
      .slice(0, session.gameSlugs.length);
    const totalScore = sessionRuns.reduce((sum, run) => sum + run.score, 0);
    const averageAccuracy = sessionRuns.length ? sessionRuns.reduce((sum, run) => sum + run.accuracy, 0) / sessionRuns.length : 0;
    const averageReactionMs = sessionRuns.length
      ? sessionRuns.reduce((sum, run) => sum + run.reactionMs, 0) / sessionRuns.length
      : 0;
    const strongestDomain = sessionRuns.reduce<{ domain: CognitiveDomain | null; score: number }>(
      (best, run) => {
        if (run.score > best.score) {
          return { domain: run.domain, score: run.score };
        }
        return best;
      },
      { domain: null, score: 0 },
    ).domain;

    return {
      ...current,
      session: null,
      lastWorkoutReview: {
        completedAt: Date.now(),
        startedAt: session.startedAt,
        durationMs: Date.now() - session.startedAt,
        gameSlugs: session.gameSlugs,
        runCount: sessionRuns.length,
        totalScore,
        averageAccuracy,
        averageReactionMs,
        bestScore: sessionRuns.reduce((best, run) => Math.max(best, run.score), 0),
        strongestDomain,
      },
    };
  });
}

export function resetProgress() {
  updateState(() => defaultState());
}

export function resetAllData() {
  updateState(() => defaultState());
}

export function serializeBrainCurlsBackup() {
  const backup: BrainCurlsBackup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress: state.progress,
    settings: state.settings,
    session: state.session,
  };
  return JSON.stringify(backup, null, 2);
}

export function importBrainCurlsBackup(raw: string) {
  updateState(() => normalizeState(parseBackup(raw)));
}

export function getWorkoutProgress() {
  return getActiveSessionIndex(state.session);
}
