let ctx: AudioContext | null = null;

/** Call from a user tap so iOS allows sound later. */
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    // audio not supported
  }
}

export function beep(): void {
  try {
    ctx ??= new AudioContext();
    const audio = ctx;
    if (audio.state !== 'running') void audio.resume();
    const t = audio.currentTime;
    for (const offset of [0, 0.3, 0.6]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.connect(gain).connect(audio.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.18);
    }
  } catch {
    // audio not supported
  }
  navigator.vibrate?.([200, 100, 200]);
}
