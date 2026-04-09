import { SectionHeading } from "../components/section-heading";
import { GameCard } from "../components/game-card";
import { starterGames } from "../data/games";

export function GamesPage() {
  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="game catalog"
        title="Start small and make each drill count."
        description="The first set includes the highest-leverage drills from the outline, with room to expand later."
      />

      <div className="games-grid">
        {starterGames.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </main>
  );
}
