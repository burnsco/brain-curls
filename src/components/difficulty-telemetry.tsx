import { Card } from "./card";
import type { DomainTelemetry, GameTelemetry, UnlockTelemetry } from "../lib/telemetry";

interface DifficultyTelemetryProps {
  domains: DomainTelemetry[];
  games: GameTelemetry[];
  unlocks: UnlockTelemetry[];
  overallLevel: number;
  targetAccuracy: number;
  speedBudgetMs: number;
}

export function DifficultyTelemetry({
  domains,
  games,
  unlocks,
  overallLevel,
  targetAccuracy,
  speedBudgetMs,
}: DifficultyTelemetryProps) {
  return (
    <div className="progress-layout telemetry-layout">
      <Card className="progress-card telemetry-card">
        <p className="panel-label">Difficulty telemetry</p>
        <div className="session-summary">
          <span>Level {overallLevel}</span>
          <span>{Math.round(targetAccuracy * 100)}% target accuracy</span>
          <span>{Math.round(speedBudgetMs)} ms speed budget</span>
          <span>{domains.length} domains tracked</span>
        </div>
        <div className="telemetry-note-grid">
          <div>
            <strong>What this means</strong>
            <p>
              The adaptive target follows the latest run and streak, then keeps each domain near a productive challenge
              band.
            </p>
          </div>
          <div>
            <strong>How to read it</strong>
            <p>
              When accuracy climbs and reaction time holds, the next workout can push harder. When it falls, the load
              should stay steady.
            </p>
          </div>
        </div>
      </Card>

      <Card className="progress-card telemetry-card">
        <p className="panel-label">Domain explanations</p>
        <div className="telemetry-domain-list">
          {domains.map((domain) => (
            <div key={domain.domain} className="telemetry-domain-card">
              <div className="telemetry-domain-topline">
                <strong>{domain.domain}</strong>
                <span>{domain.runs} runs</span>
              </div>
              <p>{domain.explanation}</p>
              <div className="telemetry-domain-metrics">
                <span>avg {Math.round(domain.averageAccuracy * 100)}%</span>
                <span>{Math.round(domain.averageReactionMs)} ms</span>
                <span>best {domain.bestScore}</span>
              </div>
              <small>{domain.recommendation}</small>
            </div>
          ))}
        </div>
      </Card>

      <Card className="progress-card telemetry-card telemetry-wide">
        <p className="panel-label">Game detail</p>
        <div className="telemetry-domain-list">
          {games.map((game) => (
            <div key={game.slug} className="telemetry-domain-card">
              <div className="telemetry-domain-topline">
                <strong>{game.name}</strong>
                <span>{game.runs} runs</span>
              </div>
              <p>{game.summary}</p>
              <div className="telemetry-domain-metrics">
                <span>best {game.bestScore}</span>
                <span>avg {Math.round(game.averageAccuracy * 100)}%</span>
                <span>{Math.round(game.averageReactionMs)} ms</span>
              </div>
              <small>{game.lastPlayedAt ? `Last played ${new Date(game.lastPlayedAt).toLocaleDateString()}` : "Not played yet"}</small>
            </div>
          ))}
        </div>
      </Card>

      <Card className="progress-card telemetry-card telemetry-wide">
        <p className="panel-label">Unlock explanations</p>
        <div className="telemetry-domain-list">
          {unlocks.map((unlock) => (
            <div key={unlock.slug} className="telemetry-domain-card">
              <div className="telemetry-domain-topline">
                <strong>{unlock.name}</strong>
                <span>{unlock.status}</span>
              </div>
              <p>{unlock.summary}</p>
              <div className="telemetry-domain-metrics">
                <span>{unlock.unlocked ? "Unlocked" : `${unlock.runsRequired} total runs`}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
