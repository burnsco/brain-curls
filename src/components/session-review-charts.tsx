import { Card } from "./card";
import type { WorkoutReviewState } from "../store/brain-curls-store";

interface SessionReviewChartsProps {
  review: WorkoutReviewState;
}

function toBarHeight(value: number, max: number) {
  if (max <= 0) return 12;
  return Math.max(12, Math.round((value / max) * 100));
}

export function SessionReviewCharts({ review }: SessionReviewChartsProps) {
  const maxScore = Math.max(...review.sessionRuns.map((run) => run.score), 1);
  const maxAccuracy = Math.max(...review.sessionRuns.map((run) => run.accuracy), 0.1);

  return (
    <Card className="progress-card recap-card">
      <p className="panel-label">Session charts</p>
      <div className="review-chart-grid">
        <div>
          <strong>Scores by game</strong>
          <div className="review-bars">
            {review.sessionRuns.map((run) => (
              <div key={`${run.slug}-${run.completedAt}`} className="review-bar-column">
                <div className="review-bar-track">
                  <div className="review-bar-fill" style={{ height: `${toBarHeight(run.score, maxScore)}%` }} />
                </div>
                <span>{run.name}</span>
                <small>{run.score}</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <strong>Accuracy by game</strong>
          <div className="review-bars review-bars-accuracy">
            {review.sessionRuns.map((run) => (
              <div key={`${run.slug}-accuracy-${run.completedAt}`} className="review-bar-column">
                <div className="review-bar-track">
                  <div
                    className="review-bar-fill review-bar-fill-accuracy"
                    style={{ height: `${toBarHeight(run.accuracy, maxAccuracy)}%` }}
                  />
                </div>
                <span>{run.name}</span>
                <small>{Math.round(run.accuracy * 100)}%</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
