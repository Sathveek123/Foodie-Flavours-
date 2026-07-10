let isMuted = true; // Default OFF as per guidelines

export function getMuteState() {
  return isMuted;
}

export function setMuteState(muted: boolean) {
  isMuted = muted;
  try {
    localStorage.setItem("flavora_muted", String(muted));
  } catch {}
}

// Initialise state
try {
  const stored = localStorage.getItem("flavora_muted");
  if (stored !== null) {
    isMuted = stored === "true";
  }
} catch {}

function playTone(freqs: number[], type: OscillatorType, duration: number, delays: number[] = []) {
  if (isMuted) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    freqs.forEach((freq, idx) => {
      const delay = delays[idx] || 0;
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      }, delay * 1000);
    });
  } catch {}
}

export function playAddToCartSound() {
  // Premium high-pitched double chime
  playTone([523.25, 659.25], "sine", 0.4, [0, 0.06]);
}

export function playDrawerOpenSound() {
  // Soft triangle sweep whoosh
  playTone([180, 240], "triangle", 0.35, [0, 0.04]);
}

export function playTickSound() {
  // High woodblock click
  playTone([1400], "sine", 0.05);
}
