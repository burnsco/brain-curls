import { Card } from "./card";
import type { ProgressState } from "../store/brain-curls-store";

interface ProgressChartsProps {
  progress: ProgressState;
}

function toPolylinePoints(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ProgressCharts({ progress }: ProgressChartsProps) {
  const recentScores = progress.recentRuns.slice().reverse().map((run) => run.score);
  const recentTimes = progress.recentRuns.slice().reverse().map((run) => run.reactionMs);
  const scorePoints = toPolylinePoints(recentScores, 360, 120);
  const timePoints = toPolylinePoints(recentTimes, 360, 120);
  const domainEntries = Object.entries(progress.domainProgress).map(([domain, stats]) => {
    const averageAccuracy = stats.runs ? stats.totalAccuracy / stats.runs : 0;
    return {
      domain,
      averageAccuracy,
      bestScore: stats.bestScore,
      runs: stats.runs,
    };
  });

  return (
    <div className="chart-grid">
      <Card className="chart-card">
        <p className="panel-label">Recent score trend</p>
        <svg viewBox="0 0 360 120" className="sparkline" role="img" aria-label="Recent score trend">
          <defs>
            <linearGradient id="score-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
          </defs>
          <polyline points={scorePoints} stroke="url(#score-gradient)" />
        </svg>
        <div className="chart-caption">
          <span>{recentScores.length} runs</span>
          <span>best {progress.bestRunScore}</span>
        </div>
      </Card>

      <Card className="chart-card">
        <p className="panel-label">Reaction time trend</p>
        <svg viewBox="0 0 360 120" className="sparkline sparkline-muted" role="img" aria-label="Recent reaction times">
          <defs>
            <linearGradient id="time-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
          <polyline points={timePoints} stroke="url(#time-gradient)" />
        </svg>
        <div className="chart-caption">
          <span>{recentTimes.length} runs</span>
          <span>fastest {recentTimes.length ? Math.min(...recentTimes) : 0} ms</span>
        </div>
      </Card>

      <Card className="chart-card chart-card-wide">
        <p className="panel-label">Domain balance</p>
        <div className="bar-chart">
          {domainEntries.map((entry) => (
            <div key={entry.domain} className="bar-column">
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${Math.round(entry.averageAccuracy * 100)}%` }} />
              </div>
              <strong>{entry.domain}</strong>
              <span>{Math.round(entry.averageAccuracy * 100)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
