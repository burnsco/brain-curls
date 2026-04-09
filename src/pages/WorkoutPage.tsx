import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { getNextWorkoutSlug, getGameBySlug } from "../lib/workouts";
import { buildDailyWorkoutQueue, getLengthLabel, getModeLabel, type DailySessionLength, type DailySessionMode } from "../lib/session-builder";
import { playCue } from "../lib/audio";
import { resetWorkout, setDailySessionPreferences, startWorkout, useBrainCurlsState } from "../store/brain-curls-store";

export function WorkoutPage() {
  const navigate = useNavigate();
  const { session, progress, settings } = useBrainCurlsState();
  const queuedSlugs =
    session?.gameSlugs ??
    buildDailyWorkoutQueue(
      progress.unlockedGameSlugs,
      progress.dailySessionMode,
      progress.dailySessionMinutes,
      settings,
    );
  const lastCompleted = session?.completedSlugs.at(-1) ?? "";
  const nextSlug = session ? getNextWorkoutSlug(lastCompleted, queuedSlugs) : queuedSlugs[0];
  const queuedGames = queuedSlugs.map((slug) => getGameBySlug(slug)).filter(Boolean);
  const sessionLabel = session ? "Resume workout" : "Start workout";
  const profileLabel = settings.reducedMotion
    ? "Motion-light workout"
    : settings.audioEnabled
      ? "Full feedback workout"
      : "Quiet workout";

  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="daily workout"
        title="Keep the session short, focused, and adaptive."
        description="A good workout should mix memory, speed, and control without turning into a random pile of drills."
      />

      <div className="progress-layout">
        <Card className="progress-card">
          <p className="panel-label">Today&apos;s workout</p>
          <h3>{queuedGames.length} games queued</h3>
          <p className="game-mechanic">
            {profileLabel}. Unlocks shape the queue, and saved settings bias the order toward the kind of
            session you actually want to run today.
          </p>
          <div className="session-summary">
            <span>{getModeLabel(progress.dailySessionMode)}</span>
            <span>{getLengthLabel(progress.dailySessionMinutes)}</span>
          </div>
          <div className="workout-list">
            {queuedGames.map((game) => (
              <div key={game?.slug}>
                <strong>{game?.name}</strong>
                <span>{game?.domains.join(" · ")}</span>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                void playCue("start");
                if (!session) {
                  startWorkout(queuedSlugs);
                  if (queuedSlugs[0]) navigate(`/games/${queuedSlugs[0]}`);
                  return;
                }

                if (nextSlug) {
                  navigate(`/games/${nextSlug}`);
                }
              }}
            >
              {sessionLabel}
              <Sparkles size={16} />
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => resetWorkout()}
            >
              <RotateCcw size={16} />
              Reset session
            </button>
          </div>
        </Card>

        <Card className="progress-card">
          <p className="panel-label">Session routing</p>
          <h3>{session ? "Live session active" : "No active session"}</h3>
          <p>
            {nextSlug
              ? `Next route: /games/${nextSlug}`
              : `${profileLabel} is ready to launch with ${getLengthLabel(progress.dailySessionMinutes)} of work.`}
          </p>
          <Link className="inline-link" to="/dashboard">
            View dashboard
            <ArrowRight size={16} />
          </Link>
        </Card>
      </div>

      <Card className="progress-card">
        <p className="panel-label">Daily session selection</p>
        <div className="preset-grid">
          {[
            { mode: "balanced", label: "Balanced", minutes: 6 },
            { mode: "memory", label: "Memory", minutes: 8 },
            { mode: "attention", label: "Attention", minutes: 8 },
            { mode: "speed", label: "Speed", minutes: 6 },
            { mode: "reasoning", label: "Reasoning", minutes: 10 },
          ].map((preset) => (
            <button
              key={`${preset.mode}-${preset.minutes}`}
              type="button"
              className={`preset-card ${
                progress.dailySessionMode === preset.mode && progress.dailySessionMinutes === preset.minutes
                  ? "preset-card-active"
                  : ""
              }`}
              onClick={() => {
                void playCue("select");
                setDailySessionPreferences(
                  preset.mode as DailySessionMode,
                  preset.minutes as DailySessionLength,
                );
              }}
            >
              <strong>{preset.label}</strong>
              <span>{preset.minutes} min</span>
            </button>
          ))}
        </div>
      </Card>
    </main>
  );
}
