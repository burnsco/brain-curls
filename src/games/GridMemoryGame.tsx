import { useEffect, useMemo, useState } from "react";
import { getGridMemoryConfig } from "../lib/game-difficulty";

interface GridMemoryGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

function buildPattern(level: number) {
  const config = getGridMemoryConfig(level);
  const length = config.patternLength;
  const gridSize = config.gridSize;
  const seen = new Set<number>();
  const pattern: number[] = [];

  while (pattern.length < length) {
    const next = (pattern.length * 2 + level + 1) % (gridSize * gridSize);
    if (!seen.has(next)) {
      seen.add(next);
      pattern.push(next);
    }
  }

  return pattern;
}

export function GridMemoryGame({ level, onComplete }: GridMemoryGameProps) {
  const config = useMemo(() => getGridMemoryConfig(level), [level]);
  const pattern = useMemo(() => buildPattern(level), [level]);
  const [phase, setPhase] = useState<"show" | "delay" | "input" | "done">("show");
  const [selection, setSelection] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [message, setMessage] = useState("Remember the highlighted tiles.");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!config.delayedRecall) {
        setPhase("input");
        setStartedAt(Date.now());
        setMessage("Recreate the pattern.");
        return;
      }

      setPhase("delay");
      setMessage("Hold the pattern in mind through the delay.");
      window.setTimeout(() => {
        setPhase("input");
        setStartedAt(Date.now());
        setMessage("Recreate the pattern.");
      }, 900);
    }, config.revealMs);

    return () => window.clearTimeout(timer);
  }, []);

  function handleTile(index: number) {
    if (phase !== "input") return;

    const next = [...selection, index];
    setSelection(next);
    const expected = pattern[selection.length];
    const correct = index === expected;

    if (!correct) {
      setPhase("done");
      setMessage("Pattern missed.");
      onComplete({
        accuracy: selection.length / pattern.length,
        reactionMs: Math.max(450, Date.now() - (startedAt ?? Date.now())),
      });
      return;
    }

    if (next.length === pattern.length) {
      setPhase("done");
      setMessage("Pattern complete.");
      onComplete({
        accuracy: 1,
        reactionMs: Math.max(350, Date.now() - (startedAt ?? Date.now())),
      });
    }
  }

  return (
    <div className="game-play">
      <div className="game-status">{message}</div>
      <div className="game-meta-row">
        <span>Tier {config.tier}</span>
        <span>Grid {config.gridSize}×{config.gridSize}</span>
        <span>Length {pattern.length}</span>
      </div>
      <div className="grid-memory-board">
        {Array.from({ length: config.gridSize * config.gridSize }, (_, index) => {
          const isLit = phase === "show" && pattern.includes(index);
          const isSelected = selection.includes(index);

          return (
            <button
              key={index}
              type="button"
              className={`grid-memory-tile ${isLit ? "lit" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => handleTile(index)}
              aria-label={`Tile ${index + 1}`}
              disabled={phase !== "input"}
            />
          );
        })}
      </div>
      <div className="game-progress">
        <span>Pattern length: {pattern.length}</span>
        <span>{phase === "delay" ? "Delay recall" : phase === "show" ? "Memorize the grid" : "Tap the tiles in order"}</span>
      </div>
    </div>
  );
}
