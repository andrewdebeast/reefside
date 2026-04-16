// audio.js — Reef Symphony Audio Engine (Web Audio API)
let _ctx = null;
let _master = null;
let _enabled = false;
let _ambienceTimer = null;
let _droneOsc = null;

function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
      _master = _ctx.createGain();
      _master.gain.value = 0.18;
      _master.connect(_ctx.destination);
    } catch(e) { return null; }
  }
  return _ctx;
}

function beep(freq, dur, type = 'square', vol = 0.08) {
  if (!_enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(_master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

function slideBeep(f1, f2, dur, type = 'square', vol = 0.07) {
  if (!_enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2, ctx.currentTime + dur);
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g); g.connect(_master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

export function toggleAudio() {
  _enabled = !_enabled;
  if (_enabled) getCtx();
  if (_master) _master.gain.value = _enabled ? 0.18 : 0;
  return _enabled;
}

export function isAudioEnabled() { return _enabled; }
export function initAudio() { if (_enabled) getCtx(); }

// ── SOUND EFFECTS ───────────────────────────────────────────────────────────
export function playHit() {
  // Short sharp impact: low thump + noise burst
  beep(80, 0.06, 'sawtooth', 0.14);
  beep(110, 0.04, 'square', 0.08);
  setTimeout(() => beep(55, 0.1, 'sawtooth', 0.07), 30);
}

export function playNetEntangle() {
  // Scraping rope + dull thud
  slideBeep(180, 60, 0.25, 'sawtooth', 0.09);
  setTimeout(() => beep(55, 0.4, 'triangle', 0.05), 80);
  setTimeout(() => slideBeep(140, 50, 0.2, 'sawtooth', 0.06), 200);
}

export function playPearl() {
  beep(880, 0.07, 'square', 0.07);
  setTimeout(() => beep(1175, 0.06, 'square', 0.06), 55);
}

export function playJump() {
  slideBeep(300, 650, 0.13, 'square', 0.06);
}

export function playStomp() {
  beep(110, 0.07, 'square', 0.12);
  beep(90, 0.07, 'sawtooth', 0.06);
}

export function playDeath() {
  [330, 311, 294, 277, 261].forEach((f, i) =>
    setTimeout(() => beep(f, 0.13, 'triangle', 0.11), i * 95)
  );
}

export function playPowerUp() {
  [523, 587, 659, 784, 880, 1047].forEach((f, i) =>
    setTimeout(() => beep(f, 0.09, 'square', 0.09), i * 70)
  );
}

export function playLevelClear() {
  const m = [523, 659, 784, 523, 659, 784, 1047, 1047];
  m.forEach((f, i) => setTimeout(() => beep(f, 0.14, 'square', 0.09), i * 110));
}

export function playBloom() {
  // Harmonious chord burst  
  [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => beep(f, 0.4, 'sine', 0.045), i * 40)
  );
  // Shimmering high notes
  setTimeout(() => {
    [2093, 2349, 2637].forEach((f, i) =>
      setTimeout(() => beep(f, 0.2, 'sine', 0.025), i * 60)
    );
  }, 300);
}

export function playWarning() {
  beep(196, 0.15, 'sawtooth', 0.12);
  setTimeout(() => beep(196, 0.15, 'sawtooth', 0.12), 250);
  setTimeout(() => beep(220, 0.2, 'sawtooth', 0.1), 500);
}

export function playBubble() {
  slideBeep(120 + Math.random()*200, 200 + Math.random()*400, 0.1, 'sine', 0.025);
}

export function playShellKick() {
  beep(200, 0.04, 'square', 0.1);
  slideBeep(200, 100, 0.1, 'square', 0.08);
}

export function playDolphinBounce() {
  slideBeep(400, 900, 0.2, 'sine', 0.07);
  setTimeout(() => beep(1200, 0.1, 'sine', 0.04), 180);
}

export function playCampaign() {
  const m = [392, 494, 587, 698, 784];
  m.forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.1), i * 80));
}

export function playHeatwave() {
  beep(55, 1.5, 'sawtooth', 0.06);
  setTimeout(() => beep(58, 1.5, 'sawtooth', 0.05), 800);
}

// ── AMBIENT SOUNDSCAPE ───────────────────────────────────────────────────────
const PENTATONIC = [130, 146, 164, 196, 220, 261, 294, 329, 392, 440, 523, 587, 659, 784, 880];

export function updateAmbience(reefHealth) {
  if (!_enabled || _ambienceTimer) return;
  const delay = 500 + Math.random() * 1500;
  _ambienceTimer = setTimeout(() => {
    _ambienceTimer = null;
    if (!_enabled) return;
    if (reefHealth > 70) {
      // Healthy reef: rich pentatonic harmonics
      const root = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      beep(root * 2, 0.7, 'sine', 0.018);
      if (Math.random() > 0.5) setTimeout(() => beep(root * 3, 0.4, 'sine', 0.01), 200);
      if (Math.random() > 0.7) setTimeout(() => beep(root * 1.5, 0.5, 'triangle', 0.012), 350);
    } else if (reefHealth > 40) {
      // Medium health: sparse, slightly off-tune
      if (Math.random() > 0.4) {
        const f = 100 + Math.random() * 150;
        beep(f, 1.2, 'triangle', 0.012);
      }
    } else {
      // Dying reef: dissonant, low drones
      const f = 50 + Math.random() * 30;
      beep(f, 2.0, 'sawtooth', 0.009);
      if (Math.random() > 0.6) setTimeout(() => beep(f * 1.07, 1.5, 'sawtooth', 0.007), 700);
    }
  }, delay);
}
