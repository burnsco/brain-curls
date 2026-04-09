import { Card } from "./card";
import type { ReplayStats } from "../lib/run-recaps";

interface GameReplaySummaryProps {
  label: string;
  stats: ReplayStats;
}

export function GameReplaySummary({ label, stats }: GameReplaySummaryProps) {
  return (
    <Card className="progress-card recap-card">
      <p className="panel-label">{label}</p>
      <div className="dashboard-stats replay-stats">
        <div>
          <span>Attempts</span>
          <strong>{stats.attempts}</strong>
        </div>
        <div>
          <span>Best score</span>
          <strong>{stats.bestScore}</strong>
        </div>
        <div>
          <span>Avg accuracy</span>
          <strong>{Math.round(stats.averageAccuracy * 100)}%</strong>
        </div>
        <div>
          <span>Avg reaction</span>
          <strong>{Math.round(stats.averageReactionMs)} ms</strong>
        </div>
      </div>

      <div className="replay-strip">
        {stats.recentRuns.length === 0 ? (
          <p className="empty-state">No replay history yet for this game.</p>
        ) : (
          stats.recentRuns.map((run) => (
            <div key={`${run.slug}-${run.completedAt}`} className="replay-item">
              <strong>{Math.round(run.accuracy * 100)}%</strong>
              <span>{run.score} pts · {run.reactionMs} ms</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
