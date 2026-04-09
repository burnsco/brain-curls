import { useEffect, useMemo, useState } from "react";
import { getNumberSpanConfig } from "../lib/game-difficulty";

interface NumberSpanGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

function generateSpan(level: number) {
  const length = getNumberSpanConfig(level).length;
  return Array.from({ length }, (_, index) => ((index * 3 + level * 7) % 10).toString());
}

export function NumberSpanGame({ level, onComplete }: NumberSpanGameProps) {
  const config = useMemo(() => getNumberSpanConfig(level), [level]);
  const span = useMemo(() => generateSpan(level), [level]);
  const [phase, setPhase] = useState<"show" | "input" | "complete">("show");
  const [value, setValue] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState("Study the number string.");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("input");
      setStartedAt(Date.now());
      setResult(
        config.mode === "backward"
          ? "Type the string in reverse."
          : config.mode === "sorted"
            ? "Type the digits in sorted order."
            : "Type the string exactly as shown.",
      );
    }, Math.max(1000, 2400 - config.tier * 160));

    return () => window.clearTimeout(timer);
  }, []);

  function finish() {
    const reactionMs = Math.max(300, Date.now() - (startedAt ?? Date.now()));
    const normalized =
      config.mode === "backward"
        ? [...span].reverse().join("")
        : config.mode === "sorted"
          ? [...span].sort().join("")
          : span.join("");
    const accuracy = value.trim() === normalized ? 1 : 0;
    setPhase("complete");
    setResult(accuracy === 1 ? "Exact match." : "Not quite. The run is saved anyway.");
    onComplete({ accuracy, reactionMs });
  }

  return (
    <div className="game-play">
      <div className="game-status">{result}</div>
      <div className="game-meta-row">
        <span>Tier {config.tier}</span>
        <span>Mode {config.mode}</span>
        <span>Length {span.length}</span>
      </div>
      <div className="number-span-display" aria-label="Number span prompt">
        {phase === "show" ? span.join(" ") : "• • • • •"}
      </div>
      <div className="input-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, ""))}
          placeholder="Enter the sequence"
          disabled={phase !== "input"}
          inputMode="numeric"
          aria-label="Number span answer"
        />
        <button type="button" className="button button-primary" onClick={finish} disabled={phase !== "input"}>
          Submit
        </button>
      </div>
      <div className="game-progress">
        <span>Mode: forward recall</span>
        <span>Length: {span.length}</span>
      </div>
    </div>
  );
}
