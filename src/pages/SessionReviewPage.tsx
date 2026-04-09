import { ArrowRight, Sparkles, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { SessionReviewCharts } from "../components/session-review-charts";
import { playCue } from "../lib/audio";
import { getModeLabel } from "../lib/session-builder";
import { useBrainCurlsState } from "../store/brain-curls-store";

function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  return `${minutes} min`;
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
            lastWorkoutCoaching.map((note) => (
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
      <Card className="progress-card">
        <p className="panel-label">Session route</p>
        <p className="game-mechanic">
          The review screen closes the loop after a workout, then hands you off to the dashboard for trends, history, and unlock progress.
        </p>
      </Card>
    </main>
  );
}
