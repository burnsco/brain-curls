import { ArrowLeft, ArrowRight, BrainCircuit, Clock3, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/card";
import { SectionHeading } from "../components/section-heading";
import { playCue } from "../lib/audio";
import { getGameBySlug } from "../lib/workouts";
import { buildDailyWorkoutQueue, getLengthLabel, getModeLabel, type DailySessionLength, type DailySessionMode } from "../lib/session-builder";
import { completeOnboarding, setDailySessionPreferences, useBrainCurlsState } from "../store/brain-curls-store";

const sessionModes: Array<{ mode: DailySessionMode; title: string; description: string }> = [
  { mode: "balanced", title: "Balanced Mix", description: "A little memory, a little speed, a little reasoning." },
  { mode: "memory", title: "Memory Focus", description: "Prioritizes sequence recall and working memory drills." },
  { mode: "attention", title: "Attention Focus", description: "More inhibition, tracking, and control under interference." },
  { mode: "speed", title: "Speed Focus", description: "Short, high-tempo runs with lower decision latency." },
  { mode: "reasoning", title: "Reasoning Focus", description: "Pattern-heavy sessions with more inference and choice tasks." },
];

const sessionLengths: DailySessionLength[] = [6, 8, 10];

const walkthroughSteps = [
  {
    title: "How the loop works",
    description:
      "Brain Curls keeps workouts short, rotates the drills, and nudges difficulty so each run stays in the training zone.",
    points: ["Short daily sets", "Adaptive challenge", "Visible progress"],
  },
  {
    title: "Choose a focus",
    description:
      "Pick the domain you want to emphasize. The workout builder will use this setting as the anchor for the day.",
    points: ["Memory", "Attention", "Speed", "Reasoning"],
  },
  {
    title: "Set the session length",
    description:
      "Pick the session length that matches your attention span. Shorter sessions prioritize consistency; longer ones add more variety.",
    points: ["6 minutes", "8 minutes", "10 minutes"],
  },
  {
    title: "Review the first workout",
    description:
      "The app assembles a small queue from the unlocked set, then keeps the flow focused so you can start training immediately.",
    points: ["Workout queue", "Unlock-aware", "One-tap start"],
  },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { progress, settings } = useBrainCurlsState();
  const [step, setStep] = useState(0);

  const previewQueue = useMemo(
    () =>
      buildDailyWorkoutQueue(
        progress.unlockedGameSlugs,
        progress.dailySessionMode,
        progress.dailySessionMinutes,
        settings,
      ),
    [progress.dailySessionMode, progress.dailySessionMinutes, progress.unlockedGameSlugs, settings],
  );
  const previewGames = previewQueue.map((slug) => getGameBySlug(slug)).filter(Boolean);
  const isLastStep = step === walkthroughSteps.length - 1;
  const profileLabel = settings.reducedMotion
    ? "motion-light"
    : settings.audioEnabled
      ? "full-feedback"
      : "quiet";

  const advanceStep = () => {
    if (step < walkthroughSteps.length - 1) {
      void playCue("select");
      setStep((current) => Math.min(current + 1, walkthroughSteps.length - 1));
    }
  };

  const retreatStep = () => {
    if (step > 0) {
      void playCue("select");
      setStep((current) => Math.max(current - 1, 0));
    }
  };

  const handleContinue = () => {
    void playCue("start");
    completeOnboarding();
    navigate("/workout");
  };

  return (
    <main className="section-page">
      <SectionHeading
        eyebrow="welcome"
        title="Set up your daily training profile."
        description="This walkthrough shows the loop first, then lets you choose the focus and session length that will shape your workout."
      />

      <div className="walkthrough-layout">
        <Card className="progress-card walkthrough-rail">
          <p className="panel-label">Guided setup</p>
          <div className="walkthrough-steps">
            {walkthroughSteps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`walkthrough-step ${index === step ? "walkthrough-step-active" : ""}`}
                onClick={() => {
                  void playCue("select");
                  setStep(index);
                }}
              >
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="hero-panel walkthrough-panel">
          <p className="panel-label">Step {step + 1} of {walkthroughSteps.length}</p>
          <h3>{walkthroughSteps[step].title}</h3>
          <p className="game-mechanic">{walkthroughSteps[step].description}</p>

          <div className="walkthrough-points">
            {walkthroughSteps[step].points.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>

          {step === 1 && (
            <div className="mode-grid">
              {sessionModes.map(({ mode, title, description }) => (
                <button
                  key={mode}
                  type="button"
                  className={`mode-card ${progress.dailySessionMode === mode ? "mode-card-active" : ""}`}
                  onClick={() => {
                    void playCue("select");
                    setDailySessionPreferences(mode, progress.dailySessionMinutes);
                    setStep(2);
                  }}
                >
                  <BrainCircuit size={18} />
                  <strong>{title}</strong>
                  <span>{description}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="length-grid">
              {sessionLengths.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`length-card ${progress.dailySessionMinutes === minutes ? "length-card-active" : ""}`}
                  onClick={() => {
                    void playCue("select");
                    setDailySessionPreferences(progress.dailySessionMode, minutes);
                    setStep(3);
                  }}
                >
                  <Clock3 size={18} />
                  <strong>{getLengthLabel(minutes)}</strong>
                  <span>
                    {minutes === 6 ? "Quick daily set" : minutes === 8 ? "Standard set" : "Long focus set"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="walkthrough-preview">
              <div className="session-summary">
                <span>{getModeLabel(progress.dailySessionMode)}</span>
                <span>{getLengthLabel(progress.dailySessionMinutes)}</span>
              </div>
              <div className="workout-list">
                {previewGames.map((game) => (
                  <div key={game?.slug}>
                    <strong>{game?.name}</strong>
                    <span>{game?.domains.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="hero-actions">
            <button type="button" className="button button-secondary" onClick={retreatStep} disabled={step === 0}>
              <ArrowLeft size={16} />
              Back
            </button>
            {!isLastStep ? (
              <button type="button" className="button button-primary" onClick={advanceStep}>
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className="button button-primary" onClick={handleContinue}>
                Save and start training
                <Sparkles size={16} />
              </button>
            )}
          </div>

          <p className="game-progress">
            <span>Progress persists locally</span>
            <span>Unlocked games shape the workout queue</span>
          </p>
          <p className="game-mechanic">
            Current profile: <strong>{profileLabel}</strong>. Saved settings bias what the next workout surfaces first.
          </p>
        </Card>
      </div>
    </main>
  );
}
