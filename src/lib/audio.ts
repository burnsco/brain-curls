import { getBrainCurlsState } from "../store/brain-curls-store";

type ToneName = "start" | "success" | "complete" | "select" | "error";
type GameOutcome = "success" | "failure";

type ToneStep = {
  frequency: number;
  duration: number;
  gain?: number;
  gap?: number;
  wave?: OscillatorType;
};

const cueMap: Record<ToneName, ToneStep[]> = {
  start: [
    { frequency: 392, duration: 0.07, gain: 0.08, wave: "sine" },
    { frequency: 523.25, duration: 0.11, gap: 0.04, gain: 0.12, wave: "triangle" },
  ],
  success: [
    { frequency: 523.25, duration: 0.08, gain: 0.1, wave: "triangle" },
    { frequency: 659.25, duration: 0.08, gap: 0.03, gain: 0.11, wave: "triangle" },
    { frequency: 783.99, duration: 0.1, gap: 0.04, gain: 0.12, wave: "sine" },
  ],
  complete: [
    { frequency: 659.25, duration: 0.09, gain: 0.1, wave: "sine" },
    { frequency: 523.25, duration: 0.09, gap: 0.03, gain: 0.08, wave: "triangle" },
    { frequency: 392, duration: 0.12, gap: 0.05, gain: 0.08, wave: "sine" },
  ],
  select: [{ frequency: 330, duration: 0.045, gain: 0.06, wave: "square" }],
  error: [
    { frequency: 220, duration: 0.08, gain: 0.08, wave: "sawtooth" },
    { frequency: 185, duration: 0.12, gap: 0.03, gain: 0.1, wave: "sawtooth" },
  ],
};

const gameCueMap: Record<string, { success: ToneStep[]; failure: ToneStep[] }> = {
  "sequence-memory": {
    success: [
      { frequency: 392, duration: 0.06, gain: 0.07, wave: "triangle" },
      { frequency: 523.25, duration: 0.08, gap: 0.02, gain: 0.1, wave: "triangle" },
      { frequency: 659.25, duration: 0.1, gap: 0.04, gain: 0.12, wave: "sine" },
    ],
    failure: [
      { frequency: 220, duration: 0.08, gain: 0.09, wave: "sawtooth" },
      { frequency: 196, duration: 0.12, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "grid-memory": {
    success: [
      { frequency: 523.25, duration: 0.06, gain: 0.08, wave: "sine" },
      { frequency: 659.25, duration: 0.06, gap: 0.02, gain: 0.1, wave: "triangle" },
      { frequency: 783.99, duration: 0.08, gap: 0.03, gain: 0.12, wave: "sine" },
    ],
    failure: [
      { frequency: 246.94, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 220, duration: 0.1, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "number-span": {
    success: [
      { frequency: 330, duration: 0.05, gain: 0.06, wave: "triangle" },
      { frequency: 440, duration: 0.06, gap: 0.02, gain: 0.08, wave: "triangle" },
      { frequency: 554.37, duration: 0.08, gap: 0.03, gain: 0.1, wave: "sine" },
    ],
    failure: [
      { frequency: 196, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 174.61, duration: 0.12, gap: 0.02, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "stroop-shift": {
    success: [
      { frequency: 784, duration: 0.04, gain: 0.06, wave: "square" },
      { frequency: 988, duration: 0.04, gap: 0.015, gain: 0.08, wave: "square" },
      { frequency: 1174.66, duration: 0.05, gap: 0.025, gain: 0.1, wave: "triangle" },
    ],
    failure: [
      { frequency: 233.08, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 196, duration: 0.12, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "target-tracking": {
    success: [
      { frequency: 349.23, duration: 0.05, gain: 0.06, wave: "square" },
      { frequency: 392, duration: 0.05, gap: 0.025, gain: 0.08, wave: "square" },
      { frequency: 440, duration: 0.05, gap: 0.025, gain: 0.08, wave: "triangle" },
    ],
    failure: [
      { frequency: 185, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 155.56, duration: 0.12, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "pattern-completion": {
    success: [
      { frequency: 440, duration: 0.06, gain: 0.07, wave: "triangle" },
      { frequency: 554.37, duration: 0.08, gap: 0.02, gain: 0.09, wave: "triangle" },
      { frequency: 698.46, duration: 0.1, gap: 0.03, gain: 0.11, wave: "sine" },
    ],
    failure: [
      { frequency: 246.94, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 207.65, duration: 0.12, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "word-association": {
    success: [
      { frequency: 329.63, duration: 0.05, gain: 0.06, wave: "triangle" },
      { frequency: 493.88, duration: 0.08, gap: 0.02, gain: 0.09, wave: "triangle" },
      { frequency: 659.25, duration: 0.1, gap: 0.03, gain: 0.11, wave: "sine" },
    ],
    failure: [
      { frequency: 220, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 174.61, duration: 0.1, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
  "reaction-drill": {
    success: [
      { frequency: 880, duration: 0.03, gain: 0.05, wave: "square" },
      { frequency: 1046.5, duration: 0.04, gap: 0.02, gain: 0.08, wave: "square" },
      { frequency: 1174.66, duration: 0.05, gap: 0.02, gain: 0.1, wave: "triangle" },
    ],
    failure: [
      { frequency: 196, duration: 0.08, gain: 0.08, wave: "sawtooth" },
      { frequency: 164.81, duration: 0.12, gap: 0.03, gain: 0.1, wave: "sawtooth" },
    ],
  },
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new window.AudioContext();
  }

  return audioContext;
}

async function playSteps(steps: ToneStep[]) {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return;
    }
  }

  const startAt = context.currentTime + 0.02;
  let cursor = startAt;

  for (const step of steps) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = step.wave ?? "sine";
    oscillator.frequency.value = step.frequency;

    gain.gain.setValueAtTime(0.0001, cursor);
    gain.gain.exponentialRampToValueAtTime(step.gain ?? 0.08, cursor + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, cursor + step.duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(cursor);
    oscillator.stop(cursor + step.duration + 0.04);

    cursor += step.duration + (step.gap ?? 0.02);
  }
}

function vibrate(pattern: number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!getBrainCurlsState().settings.hapticsEnabled) return;
  navigator.vibrate(pattern);
}

export async function playCue(name: ToneName) {
  if (!getBrainCurlsState().settings.audioEnabled) return;
  await playSteps(cueMap[name]);
}

export async function playGameFeedback(gameSlug: string, outcome: GameOutcome) {
  if (!getBrainCurlsState().settings.audioEnabled) return;

  const cue = gameCueMap[gameSlug];
  const steps = cue?.[outcome] ?? cueMap[outcome === "success" ? "success" : "error"];
  await playSteps(steps);

  const successPattern =
    gameSlug === "reaction-drill" ? [20, 20, 20] : gameSlug === "target-tracking" ? [15, 15, 25] : [30];
  vibrate(outcome === "success" ? successPattern : [80, 45, 80]);
}
