import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/card";
import { GameShell } from "../components/game-shell";
import { getGameBySlug, getNextWorkoutSlug } from "../lib/workouts";
import { completeGameRun, finishWorkout, useBrainCurlsState } from "../store/brain-curls-store";
import { GridMemoryGame } from "../games/GridMemoryGame";
import { NumberSpanGame } from "../games/NumberSpanGame";
import { ReactionDrillGame } from "../games/ReactionDrillGame";
import { SequenceMemoryGame } from "../games/SequenceMemoryGame";
import { StroopShiftGame } from "../games/StroopShiftGame";
import { TargetTrackingGame } from "../games/TargetTrackingGame";
import { PatternCompletionGame } from "../games/PatternCompletionGame";
import { WordAssociationGame } from "../games/WordAssociationGame";
import { playCue, playGameFeedback } from "../lib/audio";

export function GamePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { progress, session } = useBrainCurlsState();
  const [runSummary, setRunSummary] = useState<{
    accuracy: number;
    reactionMs: number;
    score: number;
    level: number;
  } | null>(null);

  const game = useMemo(() => (slug ? getGameBySlug(slug) : undefined), [slug]);
  const isUnlocked = game ? progress.unlockedGameSlugs.includes(game.slug) : false;

  if (!game) {
    return (
      <main className="section-page">
        <Card className="progress-card">
          <h1>Game not found</h1>
          <p>The requested route does not match a known game.</p>
        </Card>
      </main>
    );
  }

  if (!isUnlocked) {
    return (
      <main className="section-page">
        <Card className="progress-card">
          <p className="panel-label">Locked</p>
          <h1>{game.name}</h1>
          <p>{game.hook}</p>
          <p>
            Unlock this game by completing more runs. {progress.nextUnlock ? `Next unlock: ${progress.nextUnlock.label} in ${progress.nextUnlock.remainingRuns} run${progress.nextUnlock.remainingRuns === 1 ? "" : "s"}.` : "You have all games unlocked."}
          </p>
        </Card>
      </main>
    );
  }

  const handleComplete = (metrics: { accuracy: number; reactionMs: number }) => {
    const run = completeGameRun(game, metrics);
    setRunSummary(run);
    void playGameFeedback(game.slug, metrics.accuracy >= 0.75 ? "success" : "failure");
  };

  const nextSlug = session ? getNextWorkoutSlug(game.slug, session.gameSlugs) : null;

  useEffect(() => {
    if (!runSummary) return;

    const target = nextSlug ? `/games/${nextSlug}` : "/dashboard";
    const timer = window.setTimeout(() => {
      if (!nextSlug) {
        finishWorkout();
      }
      navigate(target);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [navigate, nextSlug, runSummary]);

  return (
    <GameShell
      game={game}
      title={game.name}
      subtitle={game.hook}
    >
      {game.slug === "sequence-memory" && (
        <SequenceMemoryGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "grid-memory" && (
        <GridMemoryGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "number-span" && (
        <NumberSpanGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "reaction-drill" && (
        <ReactionDrillGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "stroop-shift" && (
        <StroopShiftGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "target-tracking" && (
        <TargetTrackingGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "pattern-completion" && (
        <PatternCompletionGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}
      {game.slug === "word-association" && (
        <WordAssociationGame level={progress.cognitiveLevel} onComplete={handleComplete} />
      )}

      {runSummary && (
        <Card className="progress-card run-summary-card">
          <p className="panel-label">Run complete</p>
          <h3>{runSummary.score} points</h3>
          <p>
            Accuracy {Math.round(runSummary.accuracy * 100)}% · {runSummary.reactionMs} ms · level {runSummary.level}
          </p>
          <p>{nextSlug ? `Auto-advancing to /games/${nextSlug}` : "Wrapping up the workout and returning to the dashboard."}</p>
        </Card>
      )}

      <div className="game-next-actions">
        {nextSlug ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              void playCue("select");
              navigate(`/games/${nextSlug}`);
            }}
          >
            Next game
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              void playCue("complete");
              finishWorkout();
              navigate("/dashboard");
            }}
          >
            Finish session
          </button>
        )}
      </div>
    </GameShell>
  );
}
