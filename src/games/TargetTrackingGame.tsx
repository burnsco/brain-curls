import { useEffect, useMemo, useState } from "react";

interface TargetTrackingGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

function buildPath(level: number) {
  const points = 5 + Math.floor(level / 2);
  return Array.from({ length: points }, (_, index) => ({
    x: 10 + ((index * 19 + level * 13) % 80),
    y: 14 + ((index * 23 + level * 11) % 74),
  }));
}

export function TargetTrackingGame({ level, onComplete }: TargetTrackingGameProps) {
  const path = useMemo(() => buildPath(level), [level]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("Track the highlighted target as it moves.");

  useEffect(() => {
    setStartedAt(Date.now());
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1 >= path.length ? current : current + 1));
    }, Math.max(600, 1100 - level * 80));

    return () => window.clearInterval(timer);
  }, [level, path.length]);

  function handleCatch(targetIndex: number) {
    if (finished) return;
    const correct = targetIndex === index;
    const nextScore = correct ? score + 1 : score;
    const finishedRun = targetIndex === path.length - 1;
    setScore(nextScore);

    if (finishedRun) {
      const reactionMs = Math.max(300, Date.now() - (startedAt ?? Date.now()));
      setFinished(true);
      setMessage(correct ? "Tracking complete." : "Tracking ended with a miss.");
      onComplete({ accuracy: nextScore / path.length, reactionMs });
      return;
    }

    setMessage(correct ? "Locked on." : "Correction needed.");
  }

  return (
    <div className="game-play">
      <div className="game-status">{message}</div>
      <div className="tracking-board">
        {path.map((point, pointIndex) => (
          <button
            key={`${point.x}-${point.y}-${pointIndex}`}
            type="button"
            className={`tracking-dot ${pointIndex === index ? "active" : ""}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onClick={() => handleCatch(pointIndex)}
            disabled={finished}
            aria-label={`Target ${pointIndex + 1}`}
          />
        ))}
      </div>
      <div className="game-progress">
        <span>Target {Math.min(index + 1, path.length)} / {path.length}</span>
        <span>Attention under motion</span>
      </div>
    </div>
  );
}
