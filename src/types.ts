export type CognitiveDomain =
  | "Memory"
  | "Attention"
  | "Speed"
  | "Reasoning"
  | "Spatial"
  | "Language";

export type GameStatus = "planned" | "ready" | "prototype";

export interface TrainingGame {
  slug: string;
  name: string;
  status: GameStatus;
  domains: CognitiveDomain[];
  hook: string;
  mechanic: string;
  notes: string[];
}

export interface TrainingPillar {
  title: CognitiveDomain;
  description: string;
  signal: string;
}

export interface RoadmapStep {
  phase: string;
  title: string;
  description: string;
}
