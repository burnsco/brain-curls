type ToneName = "start" | "success" | "complete" | "select" | "error";

type ToneStep = {
  frequency: number;
  duration: number;
  gap?: number;
  gain?: number;
};

const cueMap: Record<ToneName, ToneStep[]> = {
  start: [
    { frequency: 392, duration: 0.07, gain: 0.08 },
    { frequency: 523.25, duration: 0.11, gap: 0.04, gain: 0.12 },
  ],
  success: [
    { frequency: 523.25, duration: 0.08, gain: 0.1 },
    { frequency: 659.25, duration: 0.08, gap: 0.03, gain: 0.11 },
    { frequency: 783.99, duration: 0.1, gap: 0.04, gain: 0.12 },
  ],
  complete: [
    { frequency: 659.25, duration: 0.09, gain: 0.1 },
    { frequency: 523.25, duration: 0.09, gap: 0.03, gain: 0.08 },
    { frequency: 392, duration: 0.12, gap: 0.05, gain: 0.08 },
  ],
  select: [{ frequency: 330, duration: 0.045, gain: 0.06 }],
  error: [
    { frequency: 220, duration: 0.08, gain: 0.08 },
    { frequency: 185, duration: 0.12, gap: 0.03, gain: 0.1 },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new window.AudioContext();
  }

  return audioContext;
}

export async function playCue(name: ToneName) {
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

  for (const step of cueMap[name]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
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
