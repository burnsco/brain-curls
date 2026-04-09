import { useEffect, useMemo, useState } from "react";

const shapes = ["▲", "●", "■", "◆", "★", "⬟"];

interface PatternCompletionGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

function buildPattern(level: number) {
  const start = level % shapes.length;
  return Array.from({ length: 4 }, (_, index) => shapes[(start + index) % shapes.length]);
}

export function PatternCompletionGame({ level, onComplete }: PatternCompletionGameProps) {
  const pattern = useMemo(() => buildPattern(level), [level]);
  const answer = pattern[pattern.length - 1];
  const options = useMemo(
    () => Array.from(new Set([answer, ...shapes.filter((shape) => shape !== answer).slice(0, 3)])),
    [answer],
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [message, setMessage] = useState("Find the missing shape in the sequence.");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  function handleChoice(choice: string) {
    if (finished) return;
    const correct = choice === answer;
    const reactionMs = Math.max(250, Date.now() - (startedAt ?? Date.now()));
    setFinished(true);
    setMessage(correct ? "Pattern solved." : "Incorrect completion.");
    onComplete({ accuracy: correct ? 1 : 0, reactionMs });
  }

  return (
    <div className="game-play">
      <div className="game-status">{message}</div>
      <div className="pattern-strip" aria-label="Pattern completion sequence">
        {pattern.map((shape, index) => (
          <span key={`${shape}-${index}`}>{shape}</span>
        ))}
        <span className="pattern-missing">?</span>
      </div>
      <div className="choice-grid">
        {options.map((shape) => (
          <button
            key={shape}
            type="button"
            className="choice-button choice-button-large"
            onClick={() => handleChoice(shape)}
            disabled={finished}
          >
            {shape}
          </button>
        ))}
      </div>
      <div className="game-progress">
        <span>Sequence depth {pattern.length}</span>
        <span>Reasoning mode</span>
      </div>
    </div>
  );
}
