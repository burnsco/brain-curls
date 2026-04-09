import { AudioLines, BellRing, BrainCircuit, Clock3, MoonStar, Sparkles } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { getLengthLabel, getModeLabel, type DailySessionLength, type DailySessionMode } from "../lib/session-builder";
import {
  type BackupPreview,
  appendBackupHistoryEntry,
  importBrainCurlsBackup,
  resetAllData,
  serializeBrainCurlsBackup,
  previewBrainCurlsBackup,
  setAudioEnabled,
  setDailySessionPreferences,
  setHapticsEnabled,
  setReducedMotionEnabled,
  useBrainCurlsState,
} from "../store/brain-curls-store";

const sessionModes: Array<{ mode: DailySessionMode; title: string }> = [
  { mode: "balanced", title: "Balanced Mix" },
  { mode: "memory", title: "Memory Focus" },
  { mode: "attention", title: "Attention Focus" },
  { mode: "speed", title: "Speed Focus" },
  { mode: "reasoning", title: "Reasoning Focus" },
];

const sessionLengths: DailySessionLength[] = [6, 8, 10];

function ToggleCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: typeof AudioLines;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`settings-toggle ${active ? "settings-toggle-active" : ""}`}
      onClick={onClick}
    >
      <Icon size={18} />
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

export function SettingsPage() {
  const { progress, settings, backupHistory } = useBrainCurlsState();
  const [backupText, setBackupText] = useState("");
  const [backupMessage, setBackupMessage] = useState("Export a backup or paste one here to restore your state.");
  const [backupMeta, setBackupMeta] = useState<{ version: number; exportedAt: string } | null>(null);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [detailView, setDetailView] = useState<"preferences" | "backup" | "summary">("preferences");

  const refreshBackupPreview = (text: string) => {
    if (!text.trim()) {
      setBackupPreview(null);
      return;
    }

    try {
      setBackupPreview(previewBrainCurlsBackup(text));
    } catch {
      setBackupPreview(null);
    }
  };

  const handleExport = () => {
    const backup = serializeBrainCurlsBackup();
    const preview = previewBrainCurlsBackup(backup);
    setBackupText(backup);
    setBackupPreview(preview);
    try {
      const parsed = JSON.parse(backup) as { version?: number; exportedAt?: string };
      setBackupMeta({
        version: typeof parsed.version === "number" ? parsed.version : 0,
        exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
      });
      setBackupMessage("Backup generated. You can copy it or download it from your browser.");
      appendBackupHistoryEntry({
        kind: "export",
        note: `Exported backup with ${preview.changes.length} previewed changes.`,
        timestamp: Date.now(),
        version: typeof parsed.version === "number" ? parsed.version : 0,
      });
    } catch {
      setBackupMeta(null);
      setBackupMessage("Backup generated. You can copy it or download it from your browser.");
    }

    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "brain-curls-backup.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleImport = () => {
    try {
      const preview = previewBrainCurlsBackup(backupText);
      importBrainCurlsBackup(backupText);
      setBackupPreview(preview);
      const parsed = JSON.parse(backupText) as { version?: number; exportedAt?: string };
      setBackupMeta({
        version: typeof parsed.version === "number" ? parsed.version : 1,
        exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : "legacy",
      });
      setBackupMessage("Backup restored. The app now reflects the imported progress and settings.");
      appendBackupHistoryEntry({
        kind: "import",
        note: preview.conflicts.length
          ? `Imported with ${preview.conflicts.length} conflict warning${preview.conflicts.length === 1 ? "" : "s"}.`
          : "Imported cleanly with no conflicts.",
        timestamp: Date.now(),
        version: typeof parsed.version === "number" ? parsed.version : 1,
      });
    } catch {
      setBackupMeta(null);
      setBackupMessage("That backup could not be imported. Check that the JSON is complete and valid.");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setBackupText(text);
    refreshBackupPreview(text);
    setBackupMessage(`Loaded ${file.name}. Review the JSON and import it when ready.`);
  };

  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="settings"
        title="Keep the experience tuned to how you want to train."
        description="These preferences are saved locally and feed the workout builder, feedback cues, and motion behavior."
      />

      <div className="section-toolbar">
        <div className="section-toolbar-copy">
          <p className="panel-label">Settings view</p>
          <p>Keep the page in a single viewport by switching between preferences, backup tools, and summary details.</p>
        </div>
        <div className="section-toolbar-actions">
          <button
            type="button"
            className={`telemetry-chip ${detailView === "preferences" ? "telemetry-chip-active" : ""}`}
            onClick={() => setDetailView("preferences")}
          >
            Preferences
          </button>
          <button
            type="button"
            className={`telemetry-chip ${detailView === "backup" ? "telemetry-chip-active" : ""}`}
            onClick={() => setDetailView("backup")}
          >
            Backup
          </button>
          <button
            type="button"
            className={`telemetry-chip ${detailView === "summary" ? "telemetry-chip-active" : ""}`}
            onClick={() => setDetailView("summary")}
          >
            Summary
          </button>
        </div>
      </div>

      {detailView === "preferences" && (
        <div className="progress-layout">
          <Card className="progress-card">
            <p className="panel-label">Feedback</p>
            <div className="settings-grid">
              <ToggleCard
                active={settings.audioEnabled}
                title="Audio cues"
                description="Plays completion and navigation sounds."
                icon={AudioLines}
                onClick={() => setAudioEnabled(!settings.audioEnabled)}
              />
              <ToggleCard
                active={settings.hapticsEnabled}
                title="Haptics"
                description="Uses vibration feedback when available."
                icon={BellRing}
                onClick={() => setHapticsEnabled(!settings.hapticsEnabled)}
              />
              <ToggleCard
                active={settings.reducedMotion}
                title="Reduced motion"
                description="Minimizes animation intensity across the app."
                icon={MoonStar}
                onClick={() => setReducedMotionEnabled(!settings.reducedMotion)}
              />
            </div>
          </Card>

          <Card className="progress-card">
            <p className="panel-label">Session defaults</p>
            <div className="session-summary">
              <span>{getModeLabel(settings.dailySessionMode)}</span>
              <span>{getLengthLabel(settings.dailySessionMinutes)}</span>
            </div>
            <div className="mode-grid">
              {sessionModes.map(({ mode, title }) => (
                <button
                  key={mode}
                  type="button"
                  className={`mode-card ${settings.dailySessionMode === mode ? "mode-card-active" : ""}`}
                  onClick={() => setDailySessionPreferences(mode, settings.dailySessionMinutes)}
                >
                  <BrainCircuit size={18} />
                  <strong>{title}</strong>
                  <span>Selected for daily workouts</span>
                </button>
              ))}
            </div>
            <div className="length-grid">
              {sessionLengths.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`length-card ${settings.dailySessionMinutes === minutes ? "length-card-active" : ""}`}
                  onClick={() => setDailySessionPreferences(settings.dailySessionMode, minutes)}
                >
                  <Clock3 size={18} />
                  <strong>{getLengthLabel(minutes)}</strong>
                  <span>{minutes === 6 ? "Quick set" : minutes === 8 ? "Standard set" : "Long focus set"}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {detailView === "backup" && (
        <Card className="progress-card">
          <p className="panel-label">Backup and reset</p>
          <p className="game-mechanic">{backupMessage}</p>
          {backupMeta && (
            <div className="session-summary">
              <span>Version {backupMeta.version}</span>
              <span>{backupMeta.exportedAt === "legacy" ? "Legacy backup" : new Date(backupMeta.exportedAt).toLocaleString()}</span>
            </div>
          )}
          {backupPreview && (
            <div className="backup-preview">
              <div className="session-summary">
                <span>Imported v{backupPreview.version}</span>
                <span>{backupPreview.exportedAt ? new Date(backupPreview.exportedAt).toLocaleString() : "No timestamp"}</span>
                <span>{backupPreview.conflicts.length} conflicts</span>
                <span>{backupPreview.changes.length} changes</span>
              </div>
              <div className="backup-preview-grid">
                <div>
                  <strong>Will change</strong>
                  {backupPreview.changes.length > 0 ? (
                    <ul>
                      {backupPreview.changes.map((change) => (
                        <li key={change}>{change}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No field-level changes detected.</p>
                  )}
                </div>
                <div>
                  <strong>Potential conflicts</strong>
                  {backupPreview.conflicts.length > 0 ? (
                    <ul>
                      {backupPreview.conflicts.map((conflict) => (
                        <li key={conflict}>{conflict}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No conflicts detected against the current local state.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="hero-actions">
            <button type="button" className="button button-primary" onClick={handleExport}>
              <Sparkles size={16} />
              Export backup
            </button>
            <button type="button" className="button button-secondary" onClick={handleImport} disabled={!backupText}>
              Restore backup
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                resetAllData();
                setBackupText("");
                setBackupMessage("All progress and settings were reset to defaults.");
              }}
            >
              Reset all data
            </button>
          </div>
          <label className="backup-upload">
            <span>Paste JSON backup or load a file</span>
            <input type="file" accept="application/json,.json" onChange={handleFileChange} />
            <textarea
              className="backup-textarea"
              value={backupText}
              onChange={(event) => {
                const nextText = event.target.value;
                setBackupText(nextText);
                refreshBackupPreview(nextText);
              }}
              placeholder="Paste a Brain Curls backup here"
              rows={8}
            />
          </label>
        </Card>
      )}

      {detailView === "summary" && (
        <>
          <Card className="progress-card">
            <p className="panel-label">Backup history</p>
            <div className="backup-history-list">
              {backupHistory.length === 0 ? (
                <p className="empty-state">No backup activity recorded yet.</p>
              ) : (
                backupHistory.slice(0, 4).map((entry) => (
                  <div key={`${entry.kind}-${entry.timestamp}`} className="backup-history-item">
                    <div>
                      <strong>{entry.kind}</strong>
                      <span>{entry.note}</span>
                    </div>
                    <small>
                      v{entry.version} · {new Date(entry.timestamp).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="hero-panel">
            <p className="panel-label">Summary</p>
            <h3>
              {progress.onboardingComplete ? "Training profile saved" : "Profile ready to save"}
            </h3>
            <p className="game-mechanic">
              Audio, haptics, motion, and session preferences all update the same persisted profile, so the next workout launches with the same setup.
            </p>
            <div className="session-summary">
              <span>{settings.audioEnabled ? "Audio on" : "Audio off"}</span>
              <span>{settings.hapticsEnabled ? "Haptics on" : "Haptics off"}</span>
              <span>{settings.reducedMotion ? "Reduced motion on" : "Reduced motion off"}</span>
              <span>{getLengthLabel(settings.dailySessionMinutes)}</span>
            </div>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={() => setReducedMotionEnabled(!settings.reducedMotion)}>
                <Sparkles size={16} />
                {settings.reducedMotion ? "Restore motion" : "Reduce motion"}
              </button>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
