import { SectionHeading } from "../components/section-heading";
import { Card } from "../components/card";
import { DifficultyTelemetry } from "../components/difficulty-telemetry";
import { ProgressCharts } from "../components/progress-charts";
import { ProgressHistory } from "../components/progress-history";
import { buildDomainTelemetry, buildGameTelemetry, buildOverallDifficultyTelemetry, buildUnlockTelemetry } from "../lib/telemetry";
import { useBrainCurlsState } from "../store/brain-curls-store";
import { useState } from "react";

export function DashboardPage() {
  const { progress } = useBrainCurlsState();
  const recent = progress.recentRuns;
  const [gameSort, setGameSort] = useState<"recent" | "score" | "accuracy">("recent");
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [detailView, setDetailView] = useState<"signals" | "charts" | "history">("signals");
  const domainTelemetry = buildDomainTelemetry(progress);
  const gameTelemetry = buildGameTelemetry(progress);
  const unlockTelemetry = buildUnlockTelemetry(progress);
  const overall = buildOverallDifficultyTelemetry(progress);
  const sortedGameTelemetry = gameTelemetry
    .filter((game) => !onlyUnlocked || progress.unlockedGameSlugs.includes(game.slug))
    .sort((left, right) => {
      switch (gameSort) {
        case "score":
          return right.bestScore - left.bestScore;
        case "accuracy":
          return right.averageAccuracy - left.averageAccuracy;
        case "recent":
        default:
          return (right.lastPlayedAt ?? 0) - (left.lastPlayedAt ?? 0);
      }
    });

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

      <div className="section-toolbar">
        <div className="section-toolbar-copy">
          <p className="panel-label">Dashboard view</p>
          <p>Switch between the live signals, charts, and history panels without extending the page vertically.</p>
        </div>
        <div className="section-toolbar-actions">
          <button
            type="button"
            className={`telemetry-chip ${detailView === "signals" ? "telemetry-chip-active" : ""}`}
            onClick={() => setDetailView("signals")}
          >
            Signals
          </button>
          <button
            type="button"
            className={`telemetry-chip ${detailView === "charts" ? "telemetry-chip-active" : ""}`}
            onClick={() => setDetailView("charts")}
          >
            Charts
          </button>
          <button
            type="button"
            className={`telemetry-chip ${detailView === "history" ? "telemetry-chip-active" : ""}`}
            onClick={() => setDetailView("history")}
          >
            History
          </button>
        </div>
      </div>

      {detailView === "signals" && (
        <DifficultyTelemetry
          domains={domainTelemetry}
          games={sortedGameTelemetry}
          unlocks={unlockTelemetry}
          overallLevel={overall.level}
          targetAccuracy={overall.targetAccuracy}
          speedBudgetMs={overall.speedBudgetMs}
          gameSort={gameSort}
          onGameSortChange={setGameSort}
          onlyUnlocked={onlyUnlocked}
          onOnlyUnlockedChange={setOnlyUnlocked}
        />
      )}

      {detailView === "charts" && <ProgressCharts progress={progress} />}

      {detailView === "history" && <ProgressHistory progress={progress} />}

      <Card className="progress-card">
        <p className="panel-label">Recent runs</p>
        <div className="recent-runs">
          {recent.length === 0 ? (
            <p className="empty-state">No runs yet. Start a workout to populate the dashboard.</p>
          ) : (
            recent.slice(0, 4).map((run) => (
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
