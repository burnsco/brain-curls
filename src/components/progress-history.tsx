import { Card } from "./card";
import type { ProgressState } from "../store/brain-curls-store";
import { getDailyHistory, getUnlockSteps } from "../lib/progression";

interface ProgressHistoryProps {
  progress: ProgressState;
}

export function ProgressHistory({ progress }: ProgressHistoryProps) {
  const dailyHistory = getDailyHistory(progress);
  const unlockSteps = getUnlockSteps(progress);
  const maxRuns = Math.max(...dailyHistory.map((day) => day.runs), 1);

  return (
    <div className="history-grid">
      <Card className="history-card">
        <p className="panel-label">7-day streak history</p>
        <div className="history-strip">
          {dailyHistory.map((day) => (
            <div key={day.key} className="history-day">
              <span>{day.label}</span>
              <div className="history-bar">
                <div style={{ height: `${Math.max(8, Math.round((day.runs / maxRuns) * 100))}%` }} />
              </div>
              <strong>{day.runs}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card className="history-card">
        <p className="panel-label">Unlock ladder</p>
        <div className="unlock-ladder">
          {unlockSteps.map((step) => (
            <div key={step.slug} className={`unlock-step ${step.unlocked ? "unlock-step-open" : ""}`}>
              <div>
                <strong>{step.name}</strong>
                <span>{step.runsRequired} runs</span>
              </div>
              <span>{step.unlocked ? "Unlocked" : "Locked"}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
