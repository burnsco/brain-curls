import { useEffect, useMemo, useState } from "react";

interface ReactionDrillGameProps {
  level: number;
  onComplete: (metrics: { accuracy: number; reactionMs: number }) => void;
}

export function ReactionDrillGame({ level, onComplete }: ReactionDrillGameProps) {
  const [phase, setPhase] = useState<"waiting" | "ready" | "done">("waiting");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const delay = useMemo(() => 1200 + level * 140, [level]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("ready");
      setStartedAt(Date.now());
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay]);

  function handleTap() {
    if (phase !== "ready") return;
    const reaction = Math.max(150, Date.now() - (startedAt ?? Date.now()));
    setReactionMs(reaction);
    setPhase("done");
    onComplete({ accuracy: 1, reactionMs: reaction });
  }

  return (
    <div className="game-play">
      <div className={`reaction-stage reaction-stage-${phase}`} onClick={handleTap} role="button" tabIndex={0}>
        <p>{phase === "waiting" ? "Get ready..." : phase === "ready" ? "Tap now" : "Saved"}</p>
        <strong>{reactionMs ? `${reactionMs} ms` : " "}</strong>
      </div>
      <div className="game-progress">
        <span>Focus on a single clean response.</span>
        <span>Delay scales with level {level}</span>
      </div>
    </div>
  );
}
