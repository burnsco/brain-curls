import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/card";
import { GameShell } from "../components/game-shell";
import { getGameBySlug, getNextWorkoutSlug } from "../lib/workouts";
import { completeGameRun, useBrainCurlsState } from "../store/brain-curls-store";
import { GridMemoryGame } from "../games/GridMemoryGame";
import { NumberSpanGame } from "../games/NumberSpanGame";
import { ReactionDrillGame } from "../games/ReactionDrillGame";
import { SequenceMemoryGame } from "../games/SequenceMemoryGame";

export function GamePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { progress, session } = useBrainCurlsState();

  const game = useMemo(() => (slug ? getGameBySlug(slug) : undefined), [slug]);

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

  const handleComplete = (metrics: { accuracy: number; reactionMs: number }) => {
    completeGameRun(game, metrics);
  };

  const nextSlug = session ? getNextWorkoutSlug(game.slug, session.gameSlugs) : null;

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
      {game.status === "planned" && game.slug !== "reaction-drill" && game.slug !== "sequence-memory" && game.slug !== "grid-memory" && game.slug !== "number-span" && (
        <Card className="progress-card">
          <h3>This game is planned</h3>
          <p>
            The structure is in the catalog, but the playable runner has not been built yet.
          </p>
        </Card>
      )}

      <div className="game-next-actions">
        {nextSlug ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => navigate(`/games/${nextSlug}`)}
          >
            Next game
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={() => navigate("/dashboard")}
          >
            Finish session
          </button>
        )}
      </div>
    </GameShell>
  );
}
