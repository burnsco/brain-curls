import { SectionHeading } from "../components/section-heading";
import { Card } from "../components/card";
import { DifficultyTelemetry } from "../components/difficulty-telemetry";
import { ProgressCharts } from "../components/progress-charts";
import { ProgressHistory } from "../components/progress-history";
import { buildDomainTelemetry, buildOverallDifficultyTelemetry } from "../lib/telemetry";
import { useBrainCurlsState } from "../store/brain-curls-store";

export function DashboardPage() {
  const { progress } = useBrainCurlsState();
  const recent = progress.recentRuns;
  const domainTelemetry = buildDomainTelemetry(progress);
  const overall = buildOverallDifficultyTelemetry(progress);

  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="dashboard"
        title="Progress should be visible, not implied."
        description="Track the signals that matter most: volume, consistency, best scores, and domain-level growth."
      />

      <div className="progress-layout">
        <Card className="progress-card">
          <p className="panel-label">Lifetime totals</p>
          <div className="dashboard-stats">
            <div>
              <span>Sessions</span>
              <strong>{progress.totalSessions}</strong>
            </div>
            <div>
              <span>Runs</span>
              <strong>{progress.totalRuns}</strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{progress.totalScore}</strong>
            </div>
            <div>
              <span>Best run</span>
              <strong>{progress.bestRunScore}</strong>
            </div>
            <div>
              <span>Best streak</span>
              <strong>{progress.bestStreak}</strong>
            </div>
          </div>
        </Card>
      </div>

      <DifficultyTelemetry
        domains={domainTelemetry}
        overallLevel={overall.level}
        targetAccuracy={overall.targetAccuracy}
        speedBudgetMs={overall.speedBudgetMs}
      />

      <ProgressCharts progress={progress} />

      <ProgressHistory progress={progress} />

      <Card className="progress-card">
        <p className="panel-label">Recent runs</p>
        <div className="recent-runs">
          {recent.length === 0 ? (
            <p className="empty-state">No runs yet. Start a workout to populate the dashboard.</p>
          ) : (
            recent.map((run) => (
              <div key={`${run.slug}-${run.completedAt}`}>
                <strong>{run.name}</strong>
                <span>
                  score {run.score} · {Math.round(run.accuracy * 100)}% · {run.reactionMs} ms
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}
