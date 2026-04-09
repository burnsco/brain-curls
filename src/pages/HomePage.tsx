import { ArrowRight, Gauge, HeartPulse, ShieldCheck, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { starterGames } from "../data/games";
import { pillars } from "../data/pillars";
import { roadmap } from "../data/roadmap";
import { estimateNextDifficulty } from "../lib/difficulty";
import { useBrainCurlsState } from "../store/brain-curls-store";

const trainingSignals = [
  {
    label: "Daily workout",
    value: "5 to 10 minutes",
    icon: TimerReset,
  },
  {
    label: "Adaptive target",
    value: "~78% success",
    icon: ShieldCheck,
  },
  {
    label: "Primary metric",
    value: "Accuracy + speed",
    icon: Gauge,
  },
  {
    label: "Anti-boredom",
    value: "Rotating sessions",
    icon: HeartPulse,
  },
] as const;

export function HomePage() {
  const { progress } = useBrainCurlsState();
  const startRoute = progress.onboardingComplete ? "/workout" : "/welcome";
  const difficultySnapshot = estimateNextDifficulty({
    accuracy: Math.max(0.6, Math.min(0.96, progress.totalRuns ? progress.totalScore / (progress.totalRuns * 1200) : 0.78)),
    reactionMs: progress.recentRuns[0]?.reactionMs ?? 620,
    streak: progress.currentStreak,
  });

  return (
    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">brain training, but less gimmick and more system</p>
          <h1>Train memory, attention, speed, reasoning, spatial skill, and language in one loop.</h1>
          <p className="hero-text">
            Brain Curls starts as a compact set of high-quality drills with adaptive difficulty,
            daily workouts, and a scoring layer that can actually show progress.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to={startRoute}>
              Start today&apos;s workout
              <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" to="/games">
              See the starter game set
            </Link>
          </div>

          <div className="signal-grid" aria-label="Training signals">
            {trainingSignals.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="signal-card">
                <Icon size={18} />
                <span>{label}</span>
                <strong>{value}</strong>
              </Card>
            ))}
          </div>
        </div>

        <Card className="hero-panel">
          <p className="panel-label">Adaptive snapshot</p>
          <div className="panel-number">
            <strong>Level {difficultySnapshot.level}</strong>
            <span>{Math.round(difficultySnapshot.speedBudgetMs)} ms speed budget</span>
          </div>

          <div className="progress-graph" aria-hidden="true">
            <div style={{ height: "42%" }} />
            <div style={{ height: "63%" }} />
            <div style={{ height: "71%" }} />
            <div style={{ height: "54%" }} />
            <div style={{ height: "82%" }} />
            <div style={{ height: "74%" }} />
          </div>

          <dl className="metric-grid">
            <div>
              <dt>Target accuracy</dt>
              <dd>{Math.round(difficultySnapshot.targetAccuracy * 100)}%</dd>
            </div>
            <div>
              <dt>Session mix</dt>
              <dd>Memory + speed</dd>
            </div>
            <div>
              <dt>Run length</dt>
              <dd>6 minutes</dd>
            </div>
            <div>
              <dt>Trend focus</dt>
              <dd>{progress.totalRuns > 0 ? "Tracked" : "Consistency"}</dd>
            </div>
            <div>
              <dt>Unlocked games</dt>
              <dd>{progress.unlockedGameSlugs.length}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="progression layer"
          title="Unlocks and streaks keep the loop moving."
          description="The app now tracks earned badges, visible unlock milestones, and the next game you’re working toward."
        />

        <div className="progress-layout">
          <Card className="progress-card">
            <p className="panel-label">Badges earned</p>
            <div className="badge-row">
              {progress.earnedBadges.length > 0 ? (
                progress.earnedBadges.map((badge) => (
                  <span key={badge} className="badge-pill">
                    {badge}
                  </span>
                ))
              ) : (
                <span className="empty-state">No badges yet. Finish a few runs to unlock them.</span>
              )}
            </div>
          </Card>

          <Card className="progress-card">
            <p className="panel-label">Next unlock</p>
            <h3>{progress.nextUnlock ? progress.nextUnlock.label : "All games unlocked"}</h3>
            <p>
              {progress.nextUnlock
                ? `${progress.nextUnlock.remainingRuns} more run${progress.nextUnlock.remainingRuns === 1 ? "" : "s"} to unlock the next drill.`
                : "The full starter set is available."}
            </p>
          </Card>
        </div>
      </section>

      <section className="section" id="pillars">
        <SectionHeading
          eyebrow="the training model"
          title="Each game should map to a real cognitive domain."
          description="The first version should avoid random mini-games and instead build a clean relationship between the mechanic and the skill it trains."
        />

        <div className="pillars-grid">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="pillar-card">
              <p>{pillar.title}</p>
              <h3>{pillar.signal}</h3>
              <span>{pillar.description}</span>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" id="games">
        <SectionHeading
          eyebrow="starter game set"
          title="Build a small set of excellent drills before adding breadth."
          description="These are the first games I’d treat as core: memory, attention, speed, reasoning, spatial, and language."
        />

        <div className="games-grid">
          {starterGames.map((game) => (
            <Card key={game.slug} className="game-card">
              <div className="game-topline">
                <span className={`status status-${game.status}`}>{game.status}</span>
                <span className="domains">{game.domains.join(" · ")}</span>
              </div>
              <h3>{game.name}</h3>
              <p className="game-hook">{game.hook}</p>
              <p className="game-mechanic">{game.mechanic}</p>
              <ul>
                {game.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" id="progress">
        <SectionHeading
          eyebrow="progress layer"
          title="Show improvement with a score that means something."
          description="Track accuracy, reaction time, streaks, and difficulty so users can see whether the system is actually pushing them."
        />

        <div className="progress-layout">
          <Card className="progress-card">
            <p className="panel-label">Score model</p>
            <h3>score = accuracy × speed × consistency × difficulty</h3>
            <p>Start with simple derived metrics, then tune the weighting once you have play data.</p>
          </Card>

          <Card className="progress-card">
            <p className="panel-label">First dashboard view</p>
            <div className="dashboard-stats">
              <div>
                <span>Memory</span>
                <strong>{progress.domainProgress.Memory.bestScore || 0}</strong>
              </div>
              <div>
                <span>Focus</span>
                <strong>{progress.domainProgress.Attention.bestScore || 0}</strong>
              </div>
              <div>
                <span>Reaction</span>
                <strong>{progress.recentRuns[0]?.reactionMs ?? 0} ms</strong>
              </div>
              <div>
                <span>Streak</span>
                <strong>{progress.currentStreak} days</strong>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="section" id="roadmap">
        <SectionHeading
          eyebrow="build roadmap"
          title="The first implementation pass should stay focused."
          description="Ship the core loop first, then layer in adaptivity, progression, and richer training modes."
        />

        <div className="roadmap-list">
          {roadmap.map((step) => (
            <Card key={step.phase} className="roadmap-card">
              <span>{step.phase}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
