import { useEffect, useMemo, useState } from "react";
import { getStroopConfig } from "../lib/game-difficulty";

const colors = [
  { name: "scarlet", value: "#ef4444" },
  { name: "amber", value: "#f59e0b" },
  { name: "emerald", value: "#10b981" },
  { name: "sky", value: "#38bdf8" },
];

interface StroopShiftGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

type Trial = {
  word: string;
  color: string;
  answer: string;
};

function buildTrials(level: number): Trial[] {
  const count = Math.min(7, 4 + Math.floor(level / 2));
  return Array.from({ length: count }, (_, index) => {
    const color = colors[(index + level) % colors.length];
    const congruent = index % 3 === 0;
    const word = congruent ? color.name.toUpperCase() : colors[(index + 1) % colors.length].name.toUpperCase();
    return {
      word,
      color: color.value,
      answer: color.name,
    };
  });
}

export function StroopShiftGame({ level, onComplete }: StroopShiftGameProps) {
  const config = useMemo(() => getStroopConfig(level), [level]);
  const trials = useMemo(() => buildTrials(level), [level]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("Tap the color that matches the text ink.");

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  const trial = trials[index];

  function complete(nextCorrect: number) {
    const reactionMs = Math.max(250, Date.now() - (startedAt ?? Date.now()));
    const accuracy = nextCorrect / trials.length;
    setFinished(true);
    onComplete({ accuracy, reactionMs });
    setMessage(accuracy === 1 ? "Perfect inhibition run." : "Run complete. Review the mismatch cost.");
  }

  function handleChoice(choice: string) {
    if (finished) return;

    const nextCorrect = choice === trial.answer ? correct + 1 : correct;
    const nextIndex = index + 1;

    setCorrect(nextCorrect);
    if (nextIndex >= trials.length) {
      complete(nextCorrect);
      return;
    }

    setIndex(nextIndex);
    setMessage(choice === trial.answer ? "Correct. Next conflict." : "Mismatch. Keep going.");
  }

  return (
    <div className="game-play">
      <div className="game-status">{message}</div>
      <div className="game-meta-row">
        <span>Tier {config.tier}</span>
        <span>Trials {trials.length}</span>
        <span>Conflict {Math.round((1 - config.congruentRate) * 100)}%</span>
      </div>
      <div className="stroop-card">
        <span style={{ color: trial.color }}>{trial.word}</span>
      </div>
      <div className="choice-grid">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            className="choice-button"
            onClick={() => handleChoice(color.name)}
            disabled={finished}
          >
            <span className="color-swatch" style={{ backgroundColor: color.value }} />
            {color.name}
          </button>
        ))}
      </div>
      <div className="game-progress">
        <span>Round {Math.min(index + 1, trials.length)} / {trials.length}</span>
        <span>Correct {correct}</span>
      </div>
    </div>
  );
}
