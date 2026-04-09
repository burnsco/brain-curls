import { SectionHeading } from "../components/section-heading";
import { GameCard } from "../components/game-card";
import { Card } from "../components/card";
import { starterGames } from "../data/games";
import { useBrainCurlsState } from "../store/brain-curls-store";
import { useMemo, useState } from "react";

export function GamesPage() {
  const { progress } = useBrainCurlsState();
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(starterGames.length / pageSize));
  const visibleGames = useMemo(
    () => starterGames.slice(page * pageSize, page * pageSize + pageSize),
    [page],
  );
  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="game catalog"
        title="Start small and make each drill count."
        description="The first set includes the highest-leverage drills from the outline, with room to expand later."
      />

      <Card className="progress-card">
        <p className="panel-label">Progression snapshot</p>
        <div className="dashboard-stats">
          <div>
            <span>Unlocked games</span>
            <strong>{progress.unlockedGameSlugs.length}</strong>
          </div>
          <div>
            <span>Earned badges</span>
            <strong>{progress.earnedBadges.length}</strong>
          </div>
          <div>
            <span>Next unlock</span>
            <strong>{progress.nextUnlock ? progress.nextUnlock.label : "All open"}</strong>
          </div>
          <div>
            <span>Runs to unlock</span>
            <strong>{progress.nextUnlock ? progress.nextUnlock.remainingRuns : 0}</strong>
          </div>
        </div>
      </Card>

      <div className="section-toolbar">
        <div className="section-toolbar-copy">
          <p className="panel-label">Catalog view</p>
          <p>Showing games {page * pageSize + 1} to {Math.min((page + 1) * pageSize, starterGames.length)} of {starterGames.length}.</p>
        </div>
        <div className="section-toolbar-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
            disabled={page >= pages - 1}
          >
            Next
          </button>
        </div>
      </div>

      <div className="games-grid">
        {visibleGames.map((game) => (
          <GameCard
            key={game.slug}
            game={game}
            locked={!progress.unlockedGameSlugs.includes(game.slug)}
            unlockText={
              progress.unlockedGameSlugs.includes(game.slug)
                ? undefined
                : game.status === "planned"
                  ? "Coming soon"
                  : progress.nextUnlock
                    ? `Unlock in ${progress.nextUnlock.remainingRuns} runs`
                    : "Locked"
              }
          />
        ))}
      </div>
    </main>
  );
}
