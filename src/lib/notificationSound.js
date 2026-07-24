let sharedContext = null;
let unlockListenersAttached = false;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) sharedContext = new AudioContextClass();
  return sharedContext;
}

/**
 * Browsers only allow AudioContext playback after a genuine user gesture.
 * A push can arrive at any time, long after (or without) any click, so we
 * create/resume the shared context on the first interaction with the page
 * rather than waiting for the first chime to be needed. We don't attempt
 * this at mount time — the context wouldn't be allowed to start yet anyway,
 * and doing so just logs a benign-but-noisy Chrome autoplay warning.
 */
export function unlockNotificationSound() {
  if (unlockListenersAttached || typeof window === 'undefined') return;
  unlockListenersAttached = true;

  const unlock = () => {
    const c = getContext();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  };

  ['pointerdown', 'keydown', 'touchstart'].forEach((event) => {
    window.addEventListener(event, unlock, { passive: true });
  });
}

/**
 * Two-tone chime synthesized on the fly — no audio asset to ship/license.
 */
export async function playNotificationChime() {
  const ctx = getContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return; // still locked (no user gesture yet on this page) — skip silently
    }
  }

  const notes = [
    { freq: 880, start: 0, duration: 0.16 },
    { freq: 1318.5, start: 0.1, duration: 0.22 },
  ];

  notes.forEach(({ freq, start, duration }) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = freq;

    const startTime = ctx.currentTime + start;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  });
}
