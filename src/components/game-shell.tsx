import type { ReactNode } from "react";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./card";
import type { TrainingGame } from "../types";

interface GameShellProps {
  game: TrainingGame;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function GameShell({ game, title, subtitle, children }: GameShellProps) {
  return (
    <section className="game-shell">
      <div className="game-shell-top">
        <Link className="inline-link" to="/games">
          <ArrowLeft size={16} />
          Back to games
        </Link>
        <span className={`status status-${game.status}`}>{game.status}</span>
      </div>

      <Card className="game-shell-card">
        <p className="eyebrow">{game.domains.join(" · ")}</p>
        <h1>{title}</h1>
        <p className="hero-text">{subtitle}</p>

        <div className="game-shell-meta">
          <div>
            <span>Mechanic</span>
            <strong>{game.mechanic}</strong>
          </div>
          <div>
            <span>Training focus</span>
            <strong>{game.domains.join(", ")}</strong>
          </div>
        </div>

        {children}

        <div className="game-shell-footer">
          <PlayCircle size={16} />
          <span>One run should take under two minutes.</span>
        </div>
      </Card>
    </section>
  );
}
