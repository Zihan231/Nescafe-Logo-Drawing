// Synthesised sound effects for the coffee-pour animation (no audio files needed):
// coffee pouring, sugar cubes plopping into the mug, and a soft chime when the code appears.
// Everything is made with the Web Audio API, so it stays tiny and works offline.

const MASTER_VOLUME = 0.55;
let context = null;
let master = null;
let muted = false;
let noise = null;

// Browsers only allow sound after a click, tap or key press: call this from one (e.g. a form submit).
export function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = muted ? 0 : MASTER_VOLUME;
      master.connect(context.destination);
    }
    if (context.state === "suspended") context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

export function setMuted(value) {
  muted = Boolean(value);
  if (context && master) master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, context.currentTime, 0.03);
}

function noiseBuffer(ctx) {
  if (!noise || noise.sampleRate !== ctx.sampleRate) {
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

// The sound of a stream of coffee hitting liquid: filtered noise that gets higher pitched
// as the mug fills, with a gentle glug and a few bubbles.
function pour(ctx, out, start, end) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.loop = true;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(420, start);
  band.frequency.exponentialRampToValueAtTime(1500, end);

  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 3200;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.5, start + 0.3);
  gain.gain.setValueAtTime(0.5, Math.max(start + 0.3, end - 0.4));
  gain.gain.exponentialRampToValueAtTime(0.0001, end + 0.2);

  const glug = ctx.createOscillator();
  glug.frequency.value = 9;
  const glugDepth = ctx.createGain();
  glugDepth.gain.value = 0.1;
  glug.connect(glugDepth).connect(gain.gain);

  source.connect(band).connect(low).connect(gain).connect(out);
  source.start(start);
  source.stop(end + 0.3);
  glug.start(start);
  glug.stop(end + 0.3);

  // bubbles
  for (let t = start + 0.7; t < end; t += 0.18 + Math.random() * 0.22) {
    const bubble = ctx.createOscillator();
    const level = ctx.createGain();
    const base = 280 + Math.random() * 420;
    bubble.type = "sine";
    bubble.frequency.setValueAtTime(base, t);
    bubble.frequency.exponentialRampToValueAtTime(base * 1.9, t + 0.07);
    level.gain.setValueAtTime(0.0001, t);
    level.gain.exponentialRampToValueAtTime(0.1, t + 0.012);
    level.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    bubble.connect(level).connect(out);
    bubble.start(t);
    bubble.stop(t + 0.12);
  }
}

// A sugar cube dropping into coffee: a short "plop" plus a soft splash.
function plop(ctx, out, time) {
  const tone = ctx.createOscillator();
  const toneGain = ctx.createGain();
  tone.type = "sine";
  tone.frequency.setValueAtTime(640, time);
  tone.frequency.exponentialRampToValueAtTime(170, time + 0.14);
  toneGain.gain.setValueAtTime(0.0001, time);
  toneGain.gain.exponentialRampToValueAtTime(0.55, time + 0.01);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
  tone.connect(toneGain).connect(out);
  tone.start(time);
  tone.stop(time + 0.25);

  const splash = ctx.createBufferSource();
  splash.buffer = noiseBuffer(ctx);
  const splashFilter = ctx.createBiquadFilter();
  splashFilter.type = "bandpass";
  splashFilter.frequency.value = 2400;
  splashFilter.Q.value = 0.8;
  const splashGain = ctx.createGain();
  splashGain.gain.setValueAtTime(0.0001, time);
  splashGain.gain.exponentialRampToValueAtTime(0.28, time + 0.012);
  splashGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
  splash.connect(splashFilter).connect(splashGain).connect(out);
  splash.start(time, Math.random() * 1.5, 0.25);
}

// Two soft bell notes for the moment the code appears.
function chime(ctx, out, time) {
  [880, 1318.5].forEach((frequency, index) => {
    const t = time + index * 0.13;
    const osc = ctx.createOscillator();
    const level = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    level.gain.setValueAtTime(0.0001, t);
    level.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    level.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    osc.connect(level).connect(out);
    osc.start(t);
    osc.stop(t + 1.2);
  });
}

// Builds the whole scene on any AudioContext (also used offline for testing). Times are seconds from "now".
export function buildCoffeeScene(ctx, destination, { pourStart, pourEnd, landings, chimeAt }, now = ctx.currentTime) {
  const bus = ctx.createGain();
  bus.connect(destination);
  pour(ctx, bus, now + pourStart, now + pourEnd);
  landings.forEach((t) => plop(ctx, bus, now + t));
  if (chimeAt != null) chime(ctx, bus, now + chimeAt);
  return bus;
}

// Plays the scene on the unlocked context. Returns a function that fades it out early.
export function playCoffeeScene(timeline) {
  const ctx = context;
  if (!ctx || !master) return () => {};
  try {
    const bus = buildCoffeeScene(ctx, master, timeline);
    return () => {
      try {
        bus.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        setTimeout(() => bus.disconnect(), 400);
      } catch {}
    };
  } catch {
    return () => {};
  }
}
