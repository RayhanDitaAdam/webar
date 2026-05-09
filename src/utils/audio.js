/**
 * Minimalist audio utility to provide feedback without external assets.
 * Uses Web Audio API to synthesize sounds.
 */

const playTone = (freq, type, duration, volume = 0.2) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    
    // Close context after sound finished to save resources
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
};

export const playSuccessSound = () => {
  // A simple "ding" - two tones
  playTone(660, 'sine', 0.2, 0.15);
  setTimeout(() => playTone(880, 'sine', 0.3, 0.15), 100);
};

export const playLevelCompleteSound = () => {
  // Fanfare: C5, E5, G5, C6
  playTone(523.25, 'sine', 0.15, 0.2); 
  setTimeout(() => playTone(659.25, 'sine', 0.15, 0.2), 150); 
  setTimeout(() => playTone(783.99, 'sine', 0.15, 0.2), 300); 
  setTimeout(() => playTone(1046.50, 'sine', 0.5, 0.25), 450); 
};

export const playPhaseCompleteSound = () => {
  // A single clear tone
  playTone(523.25, 'sine', 0.4, 0.1); // C5
};

export const playFailSound = () => {
  // A low-pitched buzz
  playTone(220, 'sawtooth', 0.3, 0.1);
};
