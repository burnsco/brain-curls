import { useEffect, useMemo, useState } from "react";
import { getSequenceMemoryConfig } from "../lib/game-difficulty";

const palette = [
  { name: "ember", value: "#fb7185" },
  { name: "sky", value: "#38bdf8" },
  { name: "leaf", value: "#4ade80" },
  { name: "sun", value: "#facc15" },
  { name: "violet", value: "#a78bfa" },
  { name: "cyan", value: "#22d3ee" },
];

interface SequenceMemoryGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

export function SequenceMemoryGame({ level, onComplete }: SequenceMemoryGameProps) {
  const config = useMemo(() => getSequenceMemoryConfig(level), [level]);
  const sequenceLength = config.sequenceLength;
  const sequence = useMemo(
    () =>
      Array.from({ length: sequenceLength }, (_, index) => palette[(index + level) % palette.length]),
    [level, sequenceLength],
  );
  const [phase, setPhase] = useState<"show" | "input" | "complete">("show");
  const [recallMode, setRecallMode] = useState<"forward" | "backward" | "index">("forward");
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [status, setStatus] = useState("Watch the sequence, then replay it from memory.");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("input");
      setStartedAt(Date.now());
      const mode = config.requireReverseRecall ? (Math.random() > 0.5 ? "backward" : "forward") : "forward";
      const nextMode = config.askForIndexRecall && Math.random() > 0.55 ? "index" : mode;
      setRecallMode(nextMode);
      setStatus(
        nextMode === "backward"
          ? "Recreate the pattern in reverse."
          : nextMode === "index"
            ? "Tap the item that matches the prompt."
            : "Recreate the pattern in the same order.",
      );
    }, config.revealMs);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "show") return;

    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      if (frame >= sequenceLength) {
        window.clearInterval(timer);
      }
      setIndex(Math.min(frame, sequenceLength - 1));
    }, 350);

    return () => window.clearInterval(timer);
  }, [phase, sequenceLength]);

  const activeColor = phase === "show" ? sequence[index] : null;

  function handlePick(color: string) {
    if (phase !== "input") return;

    const next = [...choices, color];
    const expectedSequence =
      recallMode === "backward" ? [...sequence].reverse() : sequence;
    const expected = expectedSequence[choices.length]?.name;
    setChoices(next);

    if (color !== expected) {
      setPhase("complete");
      setStatus("Sequence missed. Review the pattern and try again.");
      onComplete({
        accuracy: choices.length / sequence.length,
        reactionMs: Math.max(450, Date.now() - (startedAt ?? Date.now())),
      });
      return;
    }

    if (next.length === sequence.length) {
      const reactionMs = Math.max(350, Date.now() - (startedAt ?? Date.now()));
      setPhase("complete");
      setStatus("Sequence complete.");
      onComplete({
        accuracy: 1,
        reactionMs,
      });
    }
  }

  return (
    <div className="game-play">
      <div className="game-status">{status}</div>
      <div className="game-meta-row">
        <span>Tier {config.tier}</span>
        <span>Mode {recallMode}</span>
        <span>Length {sequence.length}</span>
      </div>
      <div className="sequence-grid" aria-label="Sequence memory palette">
        {palette.map((color) => {
          const isActive = activeColor?.name === color.name;
          return (
            <button
              key={color.name}
              type="button"
              className={`sequence-tile ${isActive ? "active" : ""}`}
              style={{ backgroundColor: color.value }}
              onClick={() => handlePick(color.name)}
              disabled={phase !== "input"}
              aria-label={color.name}
            >
              {phase === "input" ? choices.includes(color.name) ? "●" : "" : ""}
            </button>
          );
        })}
      </div>
      <div className="game-progress">
        <span>
          Stage {phase} · {Math.min(choices.length, sequence.length)} / {sequence.length}
        </span>
        <span>{phase === "show" ? "Memorize" : "Tap the order"}</span>
      </div>
    </div>
  );
}
