import { ArrowRight, RefreshCcw, Sparkles, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { SessionReviewCharts } from "../components/session-review-charts";
import { starterGames } from "../data/games";
import { playCue } from "../lib/audio";
import { getModeLabel } from "../lib/session-builder";
import { useBrainCurlsState } from "../store/brain-curls-store";
import { getGameBySlug } from "../lib/workouts";

function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  return `${minutes} min`;
}

function getDrillTip(slug: string, accuracy: number, reactionMs: number) {
  const game = starterGames.find((entry) => entry.slug === slug);
  const domain = game?.domains[0] ?? "training";

  if (slug === "sequence-memory") {
    return accuracy >= 0.85
      ? "Next pass: raise the sequence length or switch to backward recall."
      : "Focus on chunking the sequence into smaller groups before replaying it.";
  }

  if (slug === "grid-memory") {
    return accuracy >= 0.85
      ? "Try a longer flash window with a larger grid or delayed recall."
      : "Trace the grid in a fixed order so the pattern has a spatial anchor.";
  }

  if (slug === "number-span") {
    return reactionMs < 600
      ? "Push the span length up while keeping the same tempo."
      : "Slow the first pass and rehearse the numbers in one continuous block.";
  }

  if (slug === "stroop-shift") {
    return accuracy >= 0.8
      ? "Increase the proportion of incongruent trials to keep inhibition under pressure."
      : "Pause on the color rule and ignore the word shape before tapping.";
  }

  if (slug === "target-tracking") {
    return accuracy >= 0.8
      ? "Add one more moving target or introduce a distraction layer."
      : "Lock onto one target at a time and avoid chasing nearby noise objects.";
  }

  if (slug === "pattern-completion") {
    return accuracy >= 0.8
      ? "Use a faster sequence window and mix in a new pattern family."
      : "Look for repetition, direction, or spacing before guessing the next step.";
  }

  if (slug === "word-association") {
    return reactionMs < 550
      ? "Raise the vocabulary band and keep the same response tempo."
      : "Read the clue once, then commit to the strongest semantic match.";
  }

  return `Use the ${domain} signal from this run to decide whether to add speed or hold the current load.`;
}

function getRetryLabel(accuracy: number) {
  if (accuracy >= 0.85) return "Push difficulty";
  if (accuracy >= 0.7) return "Retry at same level";
  return "Rebuild this drill";
}

export function SessionReviewPage() {
  const navigate = useNavigate();
  const { lastWorkoutReview, lastWorkoutCoaching, progress } = useBrainCurlsState();

  if (!lastWorkoutReview) {
    return (
      <main className="section-page">
        <Card className="progress-card">
          <p className="panel-label">Session review</p>
          <h1>No recent workout found</h1>
          <p>Finish a workout to see the review screen.</p>
          <Link className="inline-link" to="/workout">
            Go to workout
          </Link>
        </Card>
      </main>
    );
  }

  const sessionMode = getModeLabel(progress.dailySessionMode);

  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="session review"
        title="Wrap the workout before jumping to the dashboard."
        description="This screen summarizes the completed session, surfaces the strongest signals, and gives you a clean next step."
      />

      <div className="progress-layout">
        <Card className="progress-card recap-card">
          <p className="panel-label">Workout summary</p>
          <h3>{sessionMode}</h3>
          <div className="session-summary replay-summary-strip">
            <span>{lastWorkoutReview.runCount} runs</span>
            <span>{Math.round(lastWorkoutReview.averageAccuracy * 100)}% average accuracy</span>
            <span>{Math.round(lastWorkoutReview.averageReactionMs)} ms average reaction</span>
            <span>{formatDuration(lastWorkoutReview.durationMs)}</span>
          </div>
          <p className="game-mechanic">
            {lastWorkoutReview.strongestDomain
              ? `Strongest signal today: ${lastWorkoutReview.strongestDomain}.`
              : "No completed runs were recorded for this session."}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                void playCue("complete");
                navigate("/dashboard");
              }}
            >
              <Sparkles size={16} />
              Continue to dashboard
            </button>
            <Link className="button button-secondary" to="/workout">
              <ArrowRight size={16} />
              Start another workout
            </Link>
          </div>
        </Card>

        <Card className="progress-card recap-card">
          <p className="panel-label">What the set trained</p>
          <div className="replay-strip">
            <div className="replay-item">
              <strong>Total score</strong>
              <span>{lastWorkoutReview.totalScore} points</span>
            </div>
            <div className="replay-item">
              <strong>Best run</strong>
              <span>{lastWorkoutReview.bestScore} points</span>
            </div>
            <div className="replay-item">
              <strong>Start time</strong>
              <span>{new Date(lastWorkoutReview.startedAt).toLocaleTimeString()}</span>
            </div>
            <div className="replay-item">
              <strong>Completed</strong>
              <span>{new Date(lastWorkoutReview.completedAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="session-summary">
            <span>{lastWorkoutReview.gameSlugs.length} queued games</span>
            <span>{lastWorkoutReview.strongestDomain ?? "No dominant domain"}</span>
          </div>
          <Link className="inline-link" to="/dashboard">
            Skip to dashboard
            <Target size={16} />
          </Link>
          <p className="game-progress">
            <span>Session review is saved locally</span>
            <span>Progress remains available on the dashboard</span>
          </p>
        </Card>
      </div>
      <SessionReviewCharts review={lastWorkoutReview} />
      <Card className="progress-card recap-card">
        <p className="panel-label">Next-step coaching</p>
        <div className="telemetry-domain-list">
          {lastWorkoutCoaching.length > 0 ? (
            lastWorkoutCoaching.slice(0, 3).map((note) => (
              <div key={note.slug} className="telemetry-domain-card">
                <div className="telemetry-domain-topline">
                  <strong>{note.name}</strong>
                  <span>{note.signal}</span>
                </div>
                <p>{note.recommendation}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">No coaching notes available until a workout is completed.</p>
          )}
        </div>
      </Card>
      <Card className="progress-card recap-card">
        <p className="panel-label">Retry drills</p>
        <div className="drill-retry-grid">
          {lastWorkoutReview.sessionRuns.slice(0, 4).map((run) => {
            const game = getGameBySlug(run.slug);
            const retryLabel = getRetryLabel(run.accuracy);
            return (
              <div key={`${run.slug}-${run.completedAt}`} className="drill-retry-card">
                <div className="telemetry-domain-topline">
                  <strong>{game?.name ?? run.name}</strong>
                  <span>{Math.round(run.accuracy * 100)}%</span>
                </div>
                <p>{getDrillTip(run.slug, run.accuracy, run.reactionMs)}</p>
                <div className="session-summary">
                  <span>{run.score} points</span>
                  <span>{run.reactionMs} ms</span>
                  <span>{game?.domains.join(" · ") ?? run.domain}</span>
                </div>
                <button
                  type="button"
                  className="button button-secondary drill-retry-button"
                  onClick={() => {
                    void playCue("select");
                    navigate(`/games/${run.slug}`);
                  }}
                >
                  <RefreshCcw size={16} />
                  {retryLabel}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="progress-card">
        <p className="panel-label">Session route</p>
        <p className="game-mechanic">
          The review screen closes the loop after a workout, then hands you off to the dashboard for trends, history, and unlock progress.
        </p>
      </Card>
    </main>
  );
}
