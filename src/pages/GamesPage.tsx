import { SectionHeading } from "../components/section-heading";
import { GameCard } from "../components/game-card";
import { Card } from "../components/card";
import { starterGames } from "../data/games";
import { useBrainCurlsState } from "../store/brain-curls-store";

export function GamesPage() {
  const { progress } = useBrainCurlsState();
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

      <div className="games-grid">
        {starterGames.map((game) => (
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
