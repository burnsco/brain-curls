import { useEffect, useMemo, useRef, useState } from "react";
import { getTargetTrackingConfig } from "../lib/game-difficulty";

interface TargetTrackingGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

function buildPath(level: number) {
  const points = getTargetTrackingConfig(level).pathPoints;
  return Array.from({ length: points }, (_, index) => ({
    x: 10 + ((index * 19 + level * 13) % 80),
    y: 14 + ((index * 23 + level * 11) % 74),
  }));
}

export function TargetTrackingGame({ level, onComplete }: TargetTrackingGameProps) {
  const config = useMemo(() => getTargetTrackingConfig(level), [level]);
  const path = useMemo(() => buildPath(level), [level]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("Track the highlighted target as it moves.");
  const timerRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const start = Date.now();
    startedAtRef.current = start;
    setIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setFinished(false);
    setMessage("Track the highlighted target as it moves.");

    const schedule = (currentIndex: number) => {
      timerRef.current = window.setTimeout(() => {
        if (currentIndex >= path.length - 1) {
          const reactionMs = Math.max(300, Date.now() - (startedAtRef.current ?? Date.now()));
          setFinished(true);
          setMessage("Tracking complete.");
          onCompleteRef.current({ accuracy: scoreRef.current / path.length, reactionMs });
          return;
        }

        setIndex(currentIndex + 1);
        schedule(currentIndex + 1);
      }, config.intervalMs);
    };

    schedule(0);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [config.intervalMs, path.length]);

  function handleCatch(targetIndex: number) {
    if (finished) return;
    const correct = targetIndex === index;
    if (!correct) {
      setMessage("Correction needed.");
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);
    setMessage("Locked on.");

    if (targetIndex === path.length - 1) {
      const reactionMs = Math.max(300, Date.now() - (startedAtRef.current ?? Date.now()));
      setFinished(true);
      setMessage("Tracking complete.");
      onCompleteRef.current({ accuracy: nextScore / path.length, reactionMs });
      return;
    }

    setIndex((current) => current + 1);
    const nextIndex = targetIndex + 1;
    timerRef.current = window.setTimeout(() => {
      if (nextIndex >= path.length - 1) {
        const reactionMs = Math.max(300, Date.now() - (startedAtRef.current ?? Date.now()));
        setFinished(true);
        setMessage("Tracking complete.");
        onCompleteRef.current({ accuracy: scoreRef.current / path.length, reactionMs });
        return;
      }

      setIndex(nextIndex + 1);
    }, config.intervalMs);
  }

  return (
    <div className="game-play">
      <div className="game-status">{message}</div>
      <div className="game-meta-row">
        <span>Tier {config.tier}</span>
        <span>Targets {path.length}</span>
        <span>Interval {config.intervalMs} ms</span>
        <span>Hits {score}</span>
      </div>
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
