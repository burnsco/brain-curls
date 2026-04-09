import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./card";
import type { TrainingGame } from "../types";

interface GameCardProps {
  game: TrainingGame;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="game-card">
      <div className="game-topline">
        <span className={`status status-${game.status}`}>{game.status}</span>
        <span className="domains">{game.domains.join(" · ")}</span>
      </div>
      <h3>{game.name}</h3>
      <p className="game-hook">{game.hook}</p>
      <p className="game-mechanic">{game.mechanic}</p>
      <ul>
        {game.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <div className="game-footer">
        {game.status === "planned" ? (
          <span className="coming-soon">Coming soon</span>
        ) : (
          <Link className="inline-link" to={`/games/${game.slug}`}>
            Open game
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </Card>
  );
}
