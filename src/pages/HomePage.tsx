import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { starterGames } from "../data/games";
import { useBrainCurlsState } from "../store/brain-curls-store";

const featuredGames = starterGames.slice(0, 3);

export function HomePage() {
  const { progress } = useBrainCurlsState();
  const startRoute = progress.onboardingComplete ? "/workout" : "/welcome";

  return (
    <main id="top" className="home-main">
      <section className="hero home-landing">
        <div className="hero-copy">
          <p className="eyebrow">quick daily training</p>
          <h1>Start a brain workout.</h1>
          <p className="hero-text">
            Pick a short session or jump into a game. Each drill focuses on one skill:
            memory, focus, speed, reasoning, spatial recall, or words.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to={startRoute}>
              Start workout
              <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" to="/games">
              Browse games
            </Link>
          </div>

          <div className="home-strip" aria-label="Current progress">
            <span>{progress.currentStreak} day streak</span>
            <span>{progress.unlockedGameSlugs.length} games open</span>
            <span>{progress.totalRuns} workouts done</span>
          </div>
        </div>

        <aside className="home-panel" aria-label="Next step">
          <p className="panel-label">Next step</p>
          <div>
            <h2>Keep it simple.</h2>
            <p>Run one short workout, then check your score after the session.</p>
          </div>

          <dl className="home-next-list">
            <div>
              <dt>Session length</dt>
              <dd>5 to 10 minutes</dd>
            </div>
            {progress.nextUnlock ? (
              <div>
                <dt>Next unlock</dt>
                <dd>
                  {progress.nextUnlock.label} in {progress.nextUnlock.remainingRuns} run
                  {progress.nextUnlock.remainingRuns === 1 ? "" : "s"}
                </dd>
              </div>
            ) : (
              <div>
                <dt>Games</dt>
                <dd>All starter games are open</dd>
              </div>
            )}
          </dl>
        </aside>
      </section>

      <section className="home-games" id="games">
        <div className="home-section-title">
          <p className="eyebrow">games</p>
          <h2>Choose a drill.</h2>
          <p>Short games with clear goals. Pick one, play a round, and move on.</p>
        </div>

        <div className="home-game-list">
          {featuredGames.map((game) => (
            <article key={game.slug} className="home-game-row">
              <div>
                <span>{game.domains.join(" · ")}</span>
                <h3>{game.name}</h3>
                <p>{game.hook}</p>
              </div>
              <Link className="inline-link" to={`/games/${game.slug}`}>
                Open
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <Link className="button button-secondary home-games-link" to="/games">
          See all games
        </Link>
      </section>
    </main>
  );
}
