import { ArrowRight, BrainCircuit, Clock3, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { completeOnboarding, setDailySessionPreferences, useBrainCurlsState } from "../store/brain-curls-store";
import { getLengthLabel, getModeLabel, type DailySessionLength, type DailySessionMode } from "../lib/session-builder";

const sessionModes: Array<{ mode: DailySessionMode; title: string; description: string }> = [
  { mode: "balanced", title: "Balanced Mix", description: "A little memory, a little speed, a little reasoning." },
  { mode: "memory", title: "Memory Focus", description: "Prioritizes sequence recall and working memory drills." },
  { mode: "attention", title: "Attention Focus", description: "More inhibition, tracking, and control under interference." },
  { mode: "speed", title: "Speed Focus", description: "Short, high-tempo runs with lower decision latency." },
  { mode: "reasoning", title: "Reasoning Focus", description: "Pattern-heavy sessions with more inference and choice tasks." },
];

const sessionLengths: DailySessionLength[] = [6, 8, 10];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { progress } = useBrainCurlsState();

  const handleContinue = () => {
    completeOnboarding();
    navigate("/workout");
  };

  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="welcome"
        title="Set up your daily training profile."
        description="Pick a focus and session length. The app will use those preferences to build a repeatable workout around the unlocked game set."
      />

      <div className="progress-layout">
        <Card className="progress-card">
          <p className="panel-label">Session mode</p>
          <div className="mode-grid">
            {sessionModes.map(({ mode, title, description }) => (
              <button
                key={mode}
                type="button"
                className={`mode-card ${progress.dailySessionMode === mode ? "mode-card-active" : ""}`}
                onClick={() => setDailySessionPreferences(mode, progress.dailySessionMinutes)}
              >
                <BrainCircuit size={18} />
                <strong>{title}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="progress-card">
          <p className="panel-label">Session length</p>
          <div className="length-grid">
            {sessionLengths.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={`length-card ${progress.dailySessionMinutes === minutes ? "length-card-active" : ""}`}
                onClick={() => setDailySessionPreferences(progress.dailySessionMode, minutes)}
              >
                <Clock3 size={18} />
                <strong>{getLengthLabel(minutes)}</strong>
                <span>
                  {minutes === 6 ? "Quick daily set" : minutes === 8 ? "Standard set" : "Long focus set"}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="hero-panel">
        <p className="panel-label">Summary</p>
        <h3>
          {getModeLabel(progress.dailySessionMode)} · {getLengthLabel(progress.dailySessionMinutes)}
        </h3>
        <p className="game-mechanic">
          This profile will shape the daily workout queue and keep the loop consistent from session to session.
        </p>
        <div className="hero-actions">
          <button type="button" className="button button-primary" onClick={handleContinue}>
            Save and continue
            <Sparkles size={16} />
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigate("/workout")}
          >
            Skip for now
            <ArrowRight size={16} />
          </button>
        </div>
        <p className="game-progress">
          <span>Onboarding complete after save</span>
          <span>Progress persists locally</span>
        </p>
      </Card>
    </main>
  );
}
