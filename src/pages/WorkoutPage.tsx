import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { getDefaultWorkoutSlugs, getNextWorkoutSlug, getGameBySlug } from "../lib/workouts";
import { resetWorkout, startWorkout, useBrainCurlsState } from "../store/brain-curls-store";

export function WorkoutPage() {
  const navigate = useNavigate();
  const { session } = useBrainCurlsState();
  const queuedSlugs = session?.gameSlugs ?? getDefaultWorkoutSlugs();
  const lastCompleted = session?.completedSlugs.at(-1) ?? "";
  const nextSlug = session ? getNextWorkoutSlug(lastCompleted, queuedSlugs) : queuedSlugs[0];
  const queuedGames = queuedSlugs.map((slug) => getGameBySlug(slug)).filter(Boolean);
  const sessionLabel = session ? "Resume workout" : "Start workout";

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
            {nextSlug ? `Next route: /games/${nextSlug}` : "The default workout plan is ready to launch."}
          </p>
          <Link className="inline-link" to="/dashboard">
            View dashboard
            <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    </main>
  );
}
