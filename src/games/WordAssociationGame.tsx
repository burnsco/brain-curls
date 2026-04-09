import { useEffect, useMemo, useState } from "react";

const prompts = [
  { word: "glacier", answer: "ice", distractors: ["paper", "salt", "stone"] },
  { word: "orbit", answer: "circle", distractors: ["branch", "thread", "spike"] },
  { word: "echo", answer: "repeat", distractors: ["sleep", "press", "split"] },
  { word: "spark", answer: "flash", distractors: ["mountain", "bubble", "socket"] },
  { word: "bloom", answer: "flower", distractors: ["clock", "fence", "cloud"] },
];

interface WordAssociationGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

function buildPrompt(level: number) {
  return prompts[level % prompts.length];
}

export function WordAssociationGame({ level, onComplete }: WordAssociationGameProps) {
  const prompt = useMemo(() => buildPrompt(level), [level]);
  const options = useMemo(
    () => [prompt.answer, ...prompt.distractors].sort(() => Math.random() - 0.5),
    [prompt],
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [message, setMessage] = useState("Pick the closest meaning.");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  function handlePick(choice: string) {
    if (finished) return;
    const correct = choice === prompt.answer;
    const reactionMs = Math.max(240, Date.now() - (startedAt ?? Date.now()));
    setFinished(true);
    setMessage(correct ? "Correct association." : "Missed the semantic match.");
    onComplete({ accuracy: correct ? 1 : 0, reactionMs });
  }

  return (
    <div className="game-play">
      <div className="game-status">{message}</div>
      <div className="word-card">
        <span>{prompt.word}</span>
      </div>
      <div className="choice-grid">
        {options.map((choice) => (
          <button
            key={choice}
            type="button"
            className="choice-button choice-button-large"
            onClick={() => handlePick(choice)}
            disabled={finished}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="game-progress">
        <span>Verbal speed</span>
        <span>Single prompt run</span>
      </div>
    </div>
  );
}
