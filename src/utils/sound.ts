/**
 * Cinematic sound engine using Web Audio API — no audio files needed.
 * All sounds are synthesized procedurally.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Low rumble build-up before the burst */
export function playRumble() {
  const ac = getCtx();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (i / data.length) * 0.4;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(80, ac.currentTime);
  filter.frequency.linearRampToValueAtTime(200, ac.currentTime + 0.4);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.6, ac.currentTime + 0.3);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.4);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start();
}

/** Explosive burst — layered impact + noise */
export function playBurst() {
  const ac = getCtx();
  const now = ac.currentTime;

  // --- Sub-bass thud ---
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

  const oscGain = ac.createGain();
  oscGain.gain.setValueAtTime(1.2, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(oscGain);
  oscGain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.35);

  // --- White noise burst ---
  const bufLen = ac.sampleRate * 0.5;
  const noiseBuf = ac.createBuffer(1, bufLen, ac.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;

  const noiseSrc = ac.createBufferSource();
  noiseSrc.buffer = noiseBuf;

  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(800, now);
  noiseFilter.Q.value = 0.5;

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.8, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  noiseSrc.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ac.destination);
  noiseSrc.start(now);

  // --- High crackle ---
  const crackBuf = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
  const cd = crackBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) {
    cd[i] = Math.random() < 0.05 ? (Math.random() * 2 - 1) * 0.9 : 0;
  }
  const crackSrc = ac.createBufferSource();
  crackSrc.buffer = crackBuf;

  const crackFilter = ac.createBiquadFilter();
  crackFilter.type = "highpass";
  crackFilter.frequency.value = 3000;

  const crackGain = ac.createGain();
  crackGain.gain.setValueAtTime(0.5, now);
  crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  crackSrc.connect(crackFilter);
  crackFilter.connect(crackGain);
  crackGain.connect(ac.destination);
  crackSrc.start(now);
}

/** Whoosh — card flying through air */
export function playWhoosh() {
  const ac = getCtx();
  const now = ac.currentTime;

  const bufLen = ac.sampleRate * 0.6;
  const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buf;

  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.6);
  filter.Q.value = 1.5;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start(now);
}

/** Magical shimmer chime on card reveal */
export function playRevealChime() {
  const ac = getCtx();
  const now = ac.currentTime;

  const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ac.createGain();
    const t = now + i * 0.07;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    // Add slight reverb via delay
    const delay = ac.createDelay(0.5);
    delay.delayTime.value = 0.25;
    const delayGain = ac.createGain();
    delayGain.gain.value = 0.25;

    osc.connect(gain);
    gain.connect(ac.destination);
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(ac.destination);

    osc.start(t);
    osc.stop(t + 1.2);
  });
}

/** Soft thud when card lands */
export function playLand() {
  const ac = getCtx();
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}
