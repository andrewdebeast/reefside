// sprites.js — Pixel art sprites for REEFSIDE (extends Aqua Quest base)

export const P = 3; // canvas pixels per game pixel

function dr(ctx, color, x, y, bx, by, bw, bh, s = P) {
  ctx.fillStyle = color;
  ctx.fillRect(x + bx * s, y + by * s, bw * s, bh * s);
}

// ── PLAYER DIVER ─────────────────────────────────────────────────────────────
export function drawDiver(ctx, x, y, facingLeft = false, big = false, invincible = false, frame = 0) {
  if (invincible && Math.floor(frame / 4) % 2 === 1) return;
  ctx.save();
  if (facingLeft) {
    const w = big ? 10 : 8;
    ctx.translate(x + w * P, y);
    ctx.scale(-1, 1);
    x = 0; y = 0;
  }
  if (invincible) {
    const hue = (frame * 8) % 360;
    ctx.globalAlpha = 0.85;
    dr(ctx, `hsl(${hue},100%,60%)`, x, y, big ? 1 : 0, 0, 8, big ? 13 : 10);
    ctx.globalAlpha = 1;
  }
  if (big) drawDiverBig(ctx, x, y, frame);
  else drawDiverSmall(ctx, x, y, frame);
  ctx.restore();
}

function drawDiverSmall(ctx, x, y, frame) {
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  r('#F8D870', 2, 0, 4, 2);
  r('#F8D870', 1, 0, 1, 3);
  r('#F8D870', 6, 0, 1, 3);
  r('#222222', 2, 1, 4, 1);
  r('#44AAFF', 2, 1, 1, 2);
  r('#44AAFF', 5, 1, 1, 2);
  r('#88CCFF', 2, 1, 1, 1);
  r('#88CCFF', 5, 1, 1, 1);
  r('#000000', 3, 1, 1, 2);
  r('#E45C10', 1, 3, 5, 5);
  r('#FF7030', 1, 3, 2, 1);
  r('#888888', 6, 3, 2, 4);
  r('#AAAAAA', 6, 3, 1, 1);
  r('#555555', 7, 6, 1, 1);
  r('#CC8800', 1, 5, 5, 1);
  r('#F8D870', 0, 4, 1, 2);
  const kick = frame % 16 < 8;
  r('#2244BB', 0, kick ? 8 : 9, 3, 1);
  r('#2244BB', 5, kick ? 9 : 8, 3, 1);
  r('#1133AA', 0, kick ? 8 : 9, 1, 1);
  r('#1133AA', 7, kick ? 9 : 8, 1, 1);
  r('#888888', 5, 2, 1, 1);
}

function drawDiverBig(ctx, x, y, frame) {
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  r('#F8D870', 3, 0, 4, 3);
  r('#F8D870', 2, 1, 1, 3);
  r('#F8D870', 7, 1, 1, 3);
  r('#222222', 3, 1, 4, 2);
  r('#44AAFF', 3, 1, 1, 2);
  r('#44AAFF', 6, 1, 1, 2);
  r('#88CCFF', 3, 1, 1, 1);
  r('#88CCFF', 6, 1, 1, 1);
  r('#000000', 4, 1, 1, 2);
  r('#E45C10', 1, 3, 7, 8);
  r('#FF7030', 1, 3, 3, 1);
  r('#888888', 8, 3, 2, 7);
  r('#AAAAAA', 8, 3, 1, 2);
  r('#555555', 9, 9, 1, 1);
  r('#CC8800', 1, 6, 7, 1);
  r('#F8D870', 0, 4, 1, 3);
  const kick = frame % 16 < 8;
  r('#2244BB', 0, kick ? 11 : 12, 4, 1);
  r('#2244BB', 6, kick ? 12 : 11, 4, 1);
  r('#1133AA', 0, kick ? 11 : 12, 1, 1);
  r('#1133AA', 9, kick ? 12 : 11, 1, 1);
  r('#888888', 6, 2, 1, 1);
}

// ── BLOOPER (squid) ───────────────────────────────────────────────────────────
export function drawBlooper(ctx, x, y, frame = 0) {
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  r('#FC9838', 1, 0, 8, 1);
  r('#FC9838', 0, 1, 10, 5);
  r('#FFC070', 2, 1, 6, 3);
  r('#FFAA50', 4, 1, 2, 4);
  r('#000000', 3, 2, 2, 2);
  r('#000000', 6, 2, 2, 2);
  r('#FFFFFF', 3, 2, 1, 1);
  r('#FFFFFF', 6, 2, 1, 1);
  const open = frame % 40 < 20;
  const tLen = open ? 6 : 3;
  const tOffsets = open ? [1, 3, 5, 7, 9] : [2, 4, 5, 7, 8];
  tOffsets.forEach(tx => {
    for (let j = 0; j < tLen; j++) {
      r(j % 2 === 0 ? '#FC9838' : '#E8843A', tx, 6 + j, 1, 1);
    }
  });
}

// ── JELLYFISH ─────────────────────────────────────────────────────────────────
export function drawJellyfish(ctx, x, y, frame = 0) {
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  r('#AADDFF', 2, 0, 6, 1);
  r('#88CCFF', 1, 1, 8, 3);
  r('#AADDFF', 2, 1, 6, 2);
  r('#66AAEE', 0, 3, 10, 2);
  r('#4488CC', 1, 4, 8, 1);
  r('#CCEEFF', 3, 1, 1, 2);
  r('#CCEEFF', 6, 2, 1, 2);
  const tc = ['#88CCFF', '#AADDFF'];
  [1, 3, 6, 8].forEach((tx, i) => {
    const off = Math.floor((frame + i * 7) / 6) % 2;
    for (let j = 0; j < 6; j++) r(tc[(j + off) % 2], tx, 5 + j, 1, 1);
  });
}

// ── SEAWEED ───────────────────────────────────────────────────────────────────
export function drawSeaweed(ctx, x, floorY, height, frame = 0, colorBase = '#00CC00') {
  const sway = Math.sin(frame * 0.03) * 5;
  for (let i = 0; i < height; i += 8) {
    const s = sway * (i / height);
    ctx.fillStyle = i % 16 === 0 ? colorBase : '#00A800';
    ctx.fillRect(x + s, floorY - height + i, 4, 8);
    if (i % 24 === 0) {
      ctx.fillStyle = '#00DD00';
      ctx.fillRect(x + s + 4, floorY - height + i + 2, 8, 4);
    }
  }
}

// ── BUBBLE ────────────────────────────────────────────────────────────────────
export function drawBubble(ctx, x, y, size) {
  ctx.strokeStyle = 'rgba(170,221,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

// ── PARTICLE ──────────────────────────────────────────────────────────────────
export function drawParticle(ctx, p) {
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  ctx.globalAlpha = 1;
}

// ── PEARL (replaces coin) ─────────────────────────────────────────────────────
export function drawPearl(ctx, x, y, frame = 0) {
  const spin = Math.abs(Math.sin(frame * 0.1));
  const w = Math.max(1, Math.round(7 * spin));
  const ox = Math.floor((7 - w) / 2);
  dr(ctx, '#E8E0D4', x, y, ox, 0, w, 7);
  if (w > 2) dr(ctx, '#F8F4F0', x, y, ox + 1, 1, Math.max(1, w - 2), 5);
  if (w > 4) dr(ctx, '#FFFFFF', x, y, ox + 1, 1, 2, 2);
  // Iridescent shimmer
  const shimHue = (frame * 5) % 360;
  if (w > 3) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = `hsl(${shimHue},80%,80%)`;
    ctx.fillRect(x + (ox + 2) * P, y + P, 2 * P, 3 * P);
    ctx.globalAlpha = 1;
  }
}

// ── SHARK ─────────────────────────────────────────────────────────────────────
export function drawShark(ctx, x, y, facingLeft = false, frame = 0, stunned = false) {
  ctx.save();
  if (facingLeft) {
    ctx.translate(x + 20 * P, y);
    ctx.scale(-1, 1);
    x = 0; y = 0;
  }
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  const tail = frame % 20 < 10 ? 0 : 1;
  // Body
  r('#8899AA', 2, 3, 14, 5);
  r('#AABBCC', 3, 3, 12, 3);
  r('#FFFFFF', 3, 5, 12, 3); // white belly
  r('#7788AA', 2, 4, 14, 2);
  // Dorsal fin (top)
  r('#7788AA', 8, 0, 3, 3);
  r('#8899AA', 9, 0, 2, 2);
  // Tail fin
  r('#7788AA', 0, 2 + tail, 3, 3);
  r('#8899AA', 1, 2 + tail, 2, 2);
  // Pectoral fin (bottom)
  r('#8899AA', 5, 7, 4, 2);
  // Head / snout
  r('#8899AA', 14, 3, 4, 4);
  r('#AABBCC', 15, 3, 3, 3);
  r('#FFFFFF', 15, 5, 3, 2);
  r('#666677', 17, 4, 1, 2); // nostril
  // Eye
  if (stunned) {
    r('#FFFF00', 15, 3, 2, 2);
    r('#000000', 15, 3, 1, 1);
    r('#000000', 16, 4, 1, 1);
  } else {
    r('#000000', 15, 3, 2, 2);
    r('#FFFFFF', 15, 3, 1, 1);
  }
  // Teeth
  r('#FFFFFF', 15, 6, 1, 1);
  r('#FFFFFF', 16, 6, 1, 1);
  r('#FFFFFF', 17, 6, 1, 1);
  ctx.restore();
}

// ── DOLPHIN ───────────────────────────────────────────────────────────────────
export function drawDolphin(ctx, x, y, frame = 0) {
  const bob = Math.sin(frame * 0.1) * 3;
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y + bob, bx, by, bw, bh);
  // Body (blue-grey)
  r('#5599CC', 1, 3, 12, 5);
  r('#77AADD', 2, 2, 10, 5);
  r('#FFFFFF', 2, 5, 10, 3); // white belly
  r('#4488BB', 3, 3, 8, 2);
  // Dorsal fin
  r('#4488BB', 7, 0, 3, 3);
  r('#5599CC', 8, 0, 2, 2);
  // Tail fluke
  r('#4488BB', 0, 4, 2, 2);
  r('#5599CC', 0, 3, 2, 2);
  r('#4488BB', 0, 6, 2, 2);
  // Snout / beak
  r('#5599CC', 12, 3, 4, 4);
  r('#77AADD', 13, 3, 3, 3);
  r('#FFFFFF', 13, 5, 3, 2);
  // Eye (happy)
  r('#000000', 13, 3, 2, 2);
  r('#FFFFFF', 13, 3, 1, 1);
  // Smile
  r('#334499', 14, 6, 2, 1);
  // Pectoral fins
  r('#4488BB', 4, 7, 4, 2);
}

// ── CROWN OF THORNS STARFISH (replaces urchin) ────────────────────────────────
export function drawCrownOfThorns(ctx, x, y, frame = 0) {
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  // Spines
  r('#8B1A1A', 4, 0, 2, 2);
  r('#8B1A1A', 4, 8, 2, 2);
  r('#8B1A1A', 0, 4, 2, 2);
  r('#8B1A1A', 8, 4, 2, 2);
  r('#8B1A1A', 1, 1, 2, 2);
  r('#8B1A1A', 7, 1, 2, 2);
  r('#8B1A1A', 1, 7, 2, 2);
  r('#8B1A1A', 7, 7, 2, 2);
  // Body
  r('#CC3333', 2, 2, 6, 6);
  r('#AA2222', 3, 3, 4, 4);
  r('#DD4444', 3, 2, 4, 2);
  r('#EE5555', 3, 2, 2, 1);
  // Center
  r('#FF6666', 4, 4, 2, 2);
  // Eyes
  r('#FFAA00', 3, 4, 2, 2);
  r('#FFAA00', 6, 4, 2, 2);
  r('#000000', 3, 4, 1, 1);
  r('#000000', 6, 4, 1, 1);
  // Slow movement animation
  const pulse = Math.floor(frame / 30) % 2 === 0 ? 0 : P;
  ctx.globalAlpha = 0.6;
  r('#FF2200', 4, 0, 2, 2);
  ctx.globalAlpha = 1;
}

// ── OXYGEN TANK POWER-UP ──────────────────────────────────────────────────────
export function drawOxygenTank(ctx, x, y, frame = 0) {
  const bob = Math.sin(frame * 0.1) * 2;
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y + bob, bx, by, bw, bh);
  // Tank body (silver)
  r('#AAAAAA', 2, 2, 6, 8);
  r('#CCCCCC', 2, 2, 3, 6);
  r('#888888', 7, 2, 1, 8);
  r('#DDDDDD', 3, 2, 2, 2);
  // Cap
  r('#666666', 3, 1, 4, 1);
  r('#888888', 3, 0, 4, 1);
  // Valve (green)
  r('#00AA00', 4, 0, 2, 1);
  r('#00CC00', 4, 0, 1, 1);
  // Air label
  r('#44AAFF', 3, 3, 4, 1);
  r('#3399EE', 3, 5, 4, 1);
  // Base
  r('#777777', 2, 10, 6, 1);
}

// ── GUARDIAN POWER (replaces star) ───────────────────────────────────────────
export function drawGuardianPower(ctx, x, y, frame = 0) {
  const hue = (frame * 4) % 360;
  const bob = Math.sin(frame * 0.1) * 2;
  const glow = `hsl(${hue},100%,60%)`;
  const inner = `hsl(${(hue + 30) % 360},100%,80%)`;
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y + bob, bx, by, bw, bh);
  // Orb shape
  r(glow, 3, 1, 6, 8);
  r(glow, 1, 3, 10, 4);
  r(glow, 2, 2, 8, 6);
  r(inner, 3, 2, 6, 6);
  r(inner, 4, 3, 4, 4);
  r('#FFFFFF', 4, 3, 2, 2);
  // Sparkles
  r(glow, 0, 0, 1, 1);
  r(glow, 11, 0, 1, 1);
  r(glow, 0, 9, 1, 1);
  r(glow, 11, 9, 1, 1);
}

// ── SUBMARINE (entry animation) ───────────────────────────────────────────────
export function drawSubmarine(ctx, x, y, hatchOpen = false, frame = 0) {
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  // Body (yellow)
  r('#FFD700', 2, 4, 22, 8);
  r('#FFC200', 0, 6, 26, 6);
  r('#FFE850', 2, 4, 22, 3);
  r('#FFB800', 2, 10, 22, 2);
  // Conning tower
  r('#FFCC00', 10, 0, 6, 4);
  r('#FFD700', 11, 0, 4, 3);
  r('#FFEE88', 11, 0, 2, 2);
  // Windows
  r('#88DDFF', 4, 6, 3, 3);
  r('#AAEEFF', 5, 6, 1, 2);
  r('#88DDFF', 9, 6, 3, 3);
  r('#AAEEFF', 10, 6, 1, 2);
  r('#88DDFF', 14, 6, 3, 3);
  r('#AAEEFF', 15, 6, 1, 2);
  // Propeller (animated)
  const prop = frame % 8;
  r('#666666', 0, 7 + (prop < 4 ? 0 : 1), 2, 2);
  r('#888888', 0, 7 + (prop < 4 ? 1 : 0), 2, 1);
  // Periscope
  r('#AAAAAA', 12, -2, 2, 2);
  // Hatch
  if (hatchOpen) {
    r('#CC9900', 10, 0, 6, 2);
    r('#FFAA00', 11, 0, 4, 1);
  } else {
    r('#CC9900', 10, 0, 6, 4);
  }
  // Teal stripe
  r('#00BCD4', 2, 8, 22, 1);
  // Nose
  r('#FFB800', 24, 6, 2, 4);
  r('#FFC200', 25, 7, 1, 2);
  // Bow
  r('#CC9900', 0, 7, 2, 4);
}

// ── REEF FISH (ambient) ───────────────────────────────────────────────────────
export function drawReefFish(ctx, x, y, color = '#00D4FF', facingLeft = false, frame = 0) {
  ctx.save();
  if (!facingLeft) {
    ctx.translate(x + 8 * P, y);
    ctx.scale(-1, 1);
    x = 0; y = 0;
  }
  const r = (c, bx, by, bw, bh) => dr(ctx, c, x, y, bx, by, bw, bh);
  const tail = frame % 12 < 6;
  r(color, 0, 1, 2, 2 + (tail ? 1 : 0));
  r(color, 2, 0, 6, 4);
  r(color, 8, 1, 1, 2);
  r('#FFFFFF', 7, 0, 2, 2);
  r('#000000', 7, 0, 1, 1);
  ctx.restore();
}

// ── CORAL FORMATION ───────────────────────────────────────────────────────────
export function drawCoralFormation(ctx, x, y, color1, color2, variant = 0, frame = 0) {
  const r = (c, bx, by, bw, bh) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + bx * P, y + by * P, bw * P, bh * P);
  };
  const sway = Math.sin(frame * 0.02 + variant) * 1.5;

  if (variant === 0) {
    // Branching coral
    r(color1, 3, 0, 2, 8);
    r(color1, 1, 0, 2, 4 + Math.floor(sway));
    r(color1, 5, 1, 2, 3 - Math.floor(sway));
    r(color2, 0, 0, 3, 1);
    r(color2, 4, 1, 3, 1);
    r(color1, 2, 4, 2, 4);
    r(color2, 1, 4, 4, 1);
  } else if (variant === 1) {
    // Brain coral (dome)
    r(color1, 1, 3, 6, 5);
    r(color1, 0, 5, 8, 3);
    r(color2, 1, 3, 6, 2);
    r(color2, 2, 2, 4, 2);
    r(color1, 2, 2, 4, 1);
    // Ridges
    r(color2, 2, 4, 1, 4);
    r(color2, 4, 3, 1, 5);
    r(color2, 6, 5, 1, 3);
  } else {
    // Fan coral
    r(color2, 3, 8, 2, 2);
    r(color1, 3, 0, 2, 8);
    r(color1, 0, 2, 3, 2);
    r(color1, 5, 2, 3, 2);
    r(color1, 1, 1, 2, 2);
    r(color1, 5, 1, 2, 2);
    r(color2, 0, 2, 1, 2);
    r(color2, 7, 2, 1, 2);
    r(color2, 3, 0, 2, 1);
  }
}

// ── CORAL BLOCK (for obstacles) ───────────────────────────────────────────────
export function drawCoralBlock(ctx, x, y, w, h, health = 100) {
  // Health-based colors
  let c1, c2;
  if (health > 70) { c1 = '#2A5A3A'; c2 = '#3A7A4A'; }
  else if (health > 40) { c1 = '#3A4A38'; c2 = '#4A5A48'; }
  else { c1 = '#3A3838'; c2 = '#4A4848'; }
  ctx.fillStyle = c1;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = c2;
  ctx.fillRect(x + 2, y + 2, w - 4, 4);
  ctx.fillRect(x + 2, y + 2, 4, h - 4);
  // Coral nubs on top
  if (health > 40) {
    const nubC = health > 70 ? '#FF6B35' : '#AA9988';
    for (let nx = x + 8; nx < x + w - 8; nx += 16) {
      ctx.fillStyle = nubC;
      ctx.fillRect(nx, y - 4, 6, 6);
      if (health > 70) {
        ctx.fillStyle = '#FF9B21';
        ctx.fillRect(nx, y - 4, 3, 3);
      }
    }
  }
}


// ── CRAB ──────────────────────────────────────────────────────────────────────
export function drawCrab(ctx, x, y, dir = 1, frame = 0, stunned = false) {
  const r = (c, bx, by, bw, bh) => { ctx.fillStyle = c; ctx.fillRect(x + bx * P, y + by * P, bw * P, bh * P); };
  const walk = Math.floor(frame / 6) % 2;
  // Claws (outermost)
  r(stunned ? '#FFFF00' : '#CC2200', -2, 2 + walk, 3, 2);
  r(stunned ? '#FFFF00' : '#CC2200', 9,  2 - walk, 3, 2);
  // Legs
  r('#AA1100', 0, 4 + walk, 2, 1);
  r('#AA1100', 2, 5,        2, 1);
  r('#AA1100', 6, 5,        2, 1);
  r('#AA1100', 8, 4 - walk, 2, 1);
  // Body
  r('#DD3300', 1, 1, 8, 6);
  r('#EE4400', 2, 1, 6, 4);
  r('#FF5500', 3, 1, 4, 2);
  // Eyes (on stalks)
  r('#AA2200', 2, 0, 1, 2);
  r('#AA2200', 7, 0, 1, 2);
  r('#000000', 2, 0, 1, 1);
  r('#000000', 7, 0, 1, 1);
  r('#FFFFFF', 2, 0, 1, 1);
  r('#FFFFFF', 7, 0, 1, 1);
}

// ── SEAHORSE ──────────────────────────────────────────────────────────────────
export function drawSeahorse(ctx, x, y, frame = 0) {
  const sway = Math.sin(frame * 0.06) * P;
  const r = (c, bx, by, bw, bh) => { ctx.fillStyle = c; ctx.fillRect(x + bx * P + sway, y + by * P, bw * P, bh * P); };
  // Crown/spines
  r('#FFCC00', 3, 0, 1, 2);
  r('#FFCC00', 4, 0, 1, 1);
  r('#FFCC00', 5, 0, 1, 2);
  // Head
  r('#F8A800', 2, 2, 5, 4);
  r('#FFCC44', 2, 2, 3, 2);
  // Snout
  r('#E89400', 5, 3, 3, 2);
  // Eye
  r('#000000', 3, 2, 2, 2);
  r('#FFFFFF', 3, 2, 1, 1);
  // Body (curving)
  r('#F8A800', 2, 6,  5, 3);
  r('#E89400', 3, 6,  3, 2);
  r('#F8A800', 2, 9,  4, 3);
  r('#E89400', 3, 9,  2, 2);
  r('#F8A800', 3, 12, 3, 2);
  // Tail curl
  r('#E89400', 3, 14, 2, 2);
  r('#F8A800', 4, 15, 2, 2);
  r('#E89400', 5, 14, 1, 1);
  // Dorsal fin
  r('#FFEE88', 1, 7, 2, 4);
  r('#FFEE88', 0, 8, 1, 2);
  // Belly plates (stripes)
  r('#FFD060', 2, 7,  5, 1);
  r('#FFD060', 2, 10, 4, 1);
  r('#FFD060', 3, 13, 3, 1);
  // Sparkle (collectible feel)
  if (frame % 20 < 10) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 1 * P + sway, y - 2 * P, P, P);
    ctx.fillRect(x + 8 * P + sway, y + 4 * P, P, P);
  }
}

// ── WHALE (BOSS) ──────────────────────────────────────────────────────────────
export function drawWhale(ctx, x, y, frame = 0, mouthOpen = false) {
  // Whale is very large — drawn in raw canvas pixels (not P-scaled)
  const w = 260, h = 110;
  const r = (c, bx, by, bw, bh) => { ctx.fillStyle = c; ctx.fillRect(x + bx, y + by, bw, bh); };

  // Tail fluke (leftmost)
  const tailWag = Math.sin(frame * 0.08) * 8;
  r('#334A60', 0,  30 + tailWag, 40, 18);
  r('#334A60', 10, 20 + tailWag, 20, 36);
  r('#445566', 10, 26 + tailWag, 20, 20);

  // Main body
  r('#445566', 30,  10, 200, 80);
  r('#556677', 30,  10, 180, 50);
  r('#667788', 40,  10, 120, 30);
  r('#CCDDEE', 40,  60, 160, 40);  // Lighter belly
  r('#DDEEFF', 60,  65, 100, 28);  // White belly patch

  // Dorsal fin
  r('#334A60', 130, 0,  30, 30);
  r('#445566', 140, 4,  18, 20);

  // Pectoral fin
  r('#334A60', 80, 80, 60, 30);
  r('#445566', 90, 82, 40, 20);

  // Head
  r('#334A60', 220, 15,  40, 70);
  r('#445566', 225, 20,  32, 55);

  // Eye
  r('#FFFFFF', 232, 28,  14, 14);
  r('#112233', 234, 30,  10, 10);
  r('#FFFFFF', 234, 30,   4,  4);

  // Mouth
  if (mouthOpen) {
    r('#112233', 228, 55, 40, 25);
    r('#FFFFFF', 228, 56, 40,  4);  // Baleen
    r('#FFFFFF', 228, 62, 40,  4);
    r('#FFFFFF', 228, 68, 40,  4);
    r('#FF4400', 235, 58, 26, 14); // Mouth interior
    // Danger glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    const mg = ctx.createRadialGradient(x + 248, y + 67, 5, x + 248, y + 67, 60);
    mg.addColorStop(0, '#FF4400'); mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg;
    ctx.fillRect(x + 220, y + 40, 80, 50);
    ctx.restore();
  } else {
    r('#334A60', 228, 70, 40,  8);
    r('#223344', 228, 74, 40,  4);
  }

  // Barnacles / texture
  r('#667788', 90,  18,  4, 4);
  r('#667788', 140, 22,  4, 4);
  r('#667788', 180, 16,  4, 4);
}

// ── WHALE STOMACH ENVIRONMENT ─────────────────────────────────────────────────
export function drawWhaleStomachBg(ctx, W, H, frame) {
  // Organic yellow-green background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1A1408');
  grad.addColorStop(0.5, '#242010');
  grad.addColorStop(1, '#181208');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stomach walls (wavy organic shapes)
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 8; i++) {
    const wx = (i * 160 + frame * 0.5) % (W + 160);
    const wh = 60 + Math.sin(i * 1.3 + frame * 0.02) * 20;
    ctx.fillStyle = '#3A2A10';
    ctx.beginPath();
    ctx.ellipse(wx, H - 30, 80, wh, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Bioluminescent particles
  for (let i = 0; i < 12; i++) {
    const px = (i * 110 + frame * 1.2) % W;
    const py = 100 + Math.sin(frame * 0.04 + i * 0.8) * 100;
    const alpha = Math.abs(Math.sin(frame * 0.05 + i * 1.1)) * 0.7;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#88FF44';
    ctx.fillRect(px, py, 4, 4);
    ctx.restore();
  }

  // Floating debris
  const debris = [
    { label: 'old boot',    x: 200, y: 380 },
    { label: 'fish bones',  x: 500, y: 420 },
    { label: 'seaweed',     x: 800, y: 360 },
    { label: 'coral chunk', x: 1000, y: 400 },
  ];
  debris.forEach(d => {
    const dy = d.y + Math.sin(frame * 0.03 + d.x * 0.01) * 10;
    ctx.fillStyle = '#554433';
    ctx.fillRect(d.x - 15, dy - 10, 30, 20);
    ctx.fillStyle = '#887766';
    ctx.fillRect(d.x - 10, dy - 6, 20, 12);
  });
}

// ── NET ENEMY (illegal fishing) ───────────────────────────────────────────────
export function drawNet(ctx, x, y, frame = 0) {
  const drift = Math.sin(frame * 0.05) * 3;
  ctx.save();
  ctx.strokeStyle = '#AA8822';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  // Net grid
  for (let ny = 0; ny < 60; ny += 12) {
    ctx.beginPath();
    ctx.moveTo(x, y + ny + drift);
    ctx.lineTo(x + 50, y + ny - drift);
    ctx.stroke();
  }
  for (let nx = 0; nx < 50; nx += 10) {
    ctx.beginPath();
    ctx.moveTo(x + nx + drift, y);
    ctx.lineTo(x + nx - drift, y + 60);
    ctx.stroke();
  }
  ctx.restore();
  // Float line
  ctx.fillStyle = '#FF6600';
  ctx.fillRect(x - 5, y - 8, 60, 6);
}

// ── HUB BACKGROUND ELEMENTS ────────────────────────────────────────────────────
export function drawSubmarineInterior(ctx, W, H, frame) {
  // Walls and ceiling
  ctx.fillStyle = '#1A2230';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#141C28';
  ctx.fillRect(0, H - 150, W, 150);  // Floor area

  // Floor grating
  ctx.fillStyle = '#1E2A3A';
  for (let fx = 0; fx < W; fx += 32) {
    ctx.fillRect(fx, H - 148, 30, 4);
  }
  ctx.fillStyle = '#2A3848';
  for (let fy = H - 148; fy < H; fy += 18) {
    ctx.fillRect(0, fy, W, 2);
  }

  // Yellow warning stripe on floor
  for (let sx = -20; sx < W; sx += 40) {
    ctx.fillStyle = '#F8B800';
    ctx.fillRect(sx, H - 148, 20, 8);
  }

  // Ceiling pipes
  ctx.fillStyle = '#2A3A50';
  ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = '#3A4A60';
  ctx.fillRect(0, 18, W, 16);
  ctx.fillStyle = '#2A3A50';
  for (let px = 0; px < W; px += 120) {
    ctx.fillRect(px, 0, 16, 60);
    ctx.fillStyle = '#445566'; ctx.fillRect(px + 2, 8, 12, 6); ctx.fillStyle = '#2A3A50';
  }

  // Overhead lights
  for (let lx = 80; lx < W; lx += 240) {
    ctx.fillStyle = '#FFFFAA';
    ctx.fillRect(lx - 10, 30, 20, 8);
    ctx.save();
    ctx.globalAlpha = 0.15;
    const lg = ctx.createRadialGradient(lx, 34, 0, lx, 100, 150);
    lg.addColorStop(0, '#FFFF88'); lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 150, 30, 300, 220);
    ctx.restore();
  }

  // Porthole windows (2)
  [180, W - 180].forEach(cx => {
    const cy = 220;
    ctx.fillStyle = '#0D1824';
    ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fill();
    // Ocean view inside porthole
    const og = ctx.createRadialGradient(cx, cy, 10, cx, cy, 58);
    og.addColorStop(0, '#0A2A4A'); og.addColorStop(1, '#041828');
    ctx.fillStyle = og;
    ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill();
    // Animated fish in porthole
    const fishX = cx - 40 + ((frame * 0.8) % 90);
    ctx.fillStyle = '#00AACC';
    ctx.fillRect(fishX, cy + 5, 18, 8);
    ctx.fillRect(fishX - 6, cy + 7, 8, 6);
    ctx.fillStyle = '#007799';
    ctx.fillRect(fishX + 16, cy + 7, 6, 4);
    // Bubble in porthole
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(100,200,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx + 20, cy - 20, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // Porthole rim
    ctx.strokeStyle = '#445566'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#667788'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.stroke();
    // Bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillStyle = '#556677';
      ctx.fillRect(cx + Math.cos(a) * 64 - 4, cy + Math.sin(a) * 64 - 4, 8, 8);
    }
  });

  // WALL PANELS (center decoration)
  ctx.fillStyle = '#1E2C3E';
  ctx.fillRect(W/2 - 120, 60, 240, 200);
  ctx.strokeStyle = '#2A3C52'; ctx.lineWidth = 3;
  ctx.strokeRect(W/2 - 120, 60, 240, 200);
  // Blinking indicator lights
  for (let i = 0; i < 5; i++) {
    const active = Math.floor((frame + i * 20) / 30) % 2 === 0;
    ctx.fillStyle = active ? ['#FF4444','#44FF44','#FFAA00','#4444FF','#FF44FF'][i] : '#223344';
    ctx.fillRect(W/2 - 90 + i * 36, 90, 14, 14);
  }
  // Screen readout
  ctx.fillStyle = '#001800';
  ctx.fillRect(W/2 - 100, 120, 200, 120);
  ctx.fillStyle = '#00AA00';
  ctx.font = `7px 'Press Start 2P'`;
  ctx.fillText('REEF STATUS', W/2 - 75, 140);
  ctx.fillStyle = '#00FF00';
  ctx.font = `6px 'Press Start 2P'`;
  const statusLines = ['OXYGEN: OK', 'DEPTH: 42m', 'HEADING: 090'];
  statusLines.forEach((l, i) => ctx.fillText(l, W/2 - 85, 160 + i * 18));
  // Blinking cursor
  if (frame % 40 < 20) {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(W/2 - 85, 200, 6, 8);
  }

  // Left rivet panel
  ctx.fillStyle = '#151E2C';
  ctx.fillRect(20, 80, 30, H - 230);
  for (let ry = 100; ry < H - 160; ry += 40) {
    ctx.fillStyle = '#2A3848';
    ctx.fillRect(26, ry, 18, 18);
  }
  // Right rivet panel
  ctx.fillStyle = '#151E2C';
  ctx.fillRect(W - 50, 80, 30, H - 230);
  for (let ry = 100; ry < H - 160; ry += 40) {
    ctx.fillStyle = '#2A3848';
    ctx.fillRect(W - 44, ry, 18, 18);
  }
}


// ── TREASURE CHEST ───────────────────────────────────────────────────────────
export function drawTreasureChest(ctx, x, y, open = false, frame = 0) {
  // Body
  ctx.fillStyle = '#5A3210';
  ctx.fillRect(x, y, 30, 20);
  ctx.fillStyle = '#7A4820';
  ctx.fillRect(x + 2, y + 2, 26, 16);
  // Lid
  ctx.fillStyle = open ? '#7A4820' : '#5A3210';
  ctx.fillRect(x, y - (open ? 12 : 6), 30, open ? 10 : 8);
  // Metal banding
  ctx.fillStyle = '#CC9922';
  ctx.fillRect(x, y + 8, 30, 3);
  ctx.fillRect(x + 12, y - (open ? 12 : 6), 6, open ? 30 : 28);
  // Lock
  ctx.fillStyle = '#FFB800';
  ctx.fillRect(x + 11, y + 6, 8, 6);
  ctx.fillRect(x + 13, y + 4, 4, 4);
  // Gold spill when open
  if (open) {
    const shine = Math.abs(Math.sin(frame * 0.05)) * 0.3 + 0.7;
    ctx.save(); ctx.globalAlpha = shine;
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + 2 + i * 4, y + 16 + (i % 2) * 3, 4, 4);
    }
    ctx.restore();
  }
}

// ── PORTHOLE ────────────────────────────────────────────────────────────────
export function drawPorthole(ctx, x, y, radius, frame) {
  // Outer rim
  ctx.fillStyle = '#4A3010';
  ctx.beginPath(); ctx.arc(x, y, radius + 5, 0, Math.PI * 2); ctx.fill();
  // Inner frame
  ctx.fillStyle = '#2A1C0C';
  ctx.beginPath(); ctx.arc(x, y, radius + 2, 0, Math.PI * 2); ctx.fill();
  // Glass (ocean view)
  const glow = Math.abs(Math.sin(frame * 0.02)) * 0.2 + 0.1;
  ctx.fillStyle = `rgba(0,100,140,0.7)`;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.globalAlpha = glow;
  ctx.fillStyle = '#00E8D8';
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Rivet bolts at N/S/E/W
  [[0,-1],[0,1],[1,0],[-1,0]].forEach(([dx,dy]) => {
    ctx.fillStyle = '#CC8822';
    ctx.beginPath(); ctx.arc(x + dx*(radius+3), y + dy*(radius+3), 3, 0, Math.PI*2); ctx.fill();
  });
  // Highlight
  ctx.save(); ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(x - radius*0.3, y - radius*0.3, radius*0.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ── ICE STALACTITE ───────────────────────────────────────────────────────────
export function drawIceStalactite(ctx, x, y, length, width = 8) {
  const grad = ctx.createLinearGradient(x, y, x + width, y + length);
  grad.addColorStop(0, '#C8E8FF');
  grad.addColorStop(1, 'rgba(160,220,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width * 0.5, y + length);
  ctx.closePath();
  ctx.fill();
  // Inner glint
  ctx.save(); ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 4, y); ctx.lineTo(x + 3, y + length * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ── LAVA CRACK ───────────────────────────────────────────────────────────────
export function drawLavaCrack(ctx, x, y, w, h, frame) {
  const pulse = Math.abs(Math.sin(frame * 0.06)) * 0.5 + 0.5;
  // Crack channel
  ctx.fillStyle = '#1A0800';
  ctx.fillRect(x, y, w, h);
  // Lava glow inside
  ctx.save(); ctx.globalAlpha = pulse;
  const lg = ctx.createLinearGradient(x, y, x, y + h);
  lg.addColorStop(0, '#FF6600'); lg.addColorStop(0.5, '#FF2200'); lg.addColorStop(1, '#FF8800');
  ctx.fillStyle = lg;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();
  // Outer heat glow
  ctx.save(); ctx.globalAlpha = pulse * 0.2;
  ctx.fillStyle = '#FF4400';
  ctx.fillRect(x - 2, y, w + 4, h);
  ctx.restore();
}

// ── SHIPWRECK HULL EXTERIOR ──────────────────────────────────────────────────
export function drawShipHullExterior(ctx, zx, zoneW, CEIL, FLOOR, frame) {
  // Large hull shape across top-right of zone
  const hullX = zx + zoneW * 0.35;
  const hullW = zoneW * 0.65;
  // Barnacle-covered hull plates
  ctx.fillStyle = '#2A1808';
  ctx.fillRect(hullX, CEIL - 20, hullW, FLOOR - CEIL + 20);
  // Plate lines
  ctx.strokeStyle = '#3A2410'; ctx.lineWidth = 3;
  for (let py = CEIL; py < FLOOR; py += 60) {
    ctx.beginPath(); ctx.moveTo(hullX, py); ctx.lineTo(hullX + hullW, py); ctx.stroke();
  }
  // Rivet rows
  for (let py = CEIL + 10; py < FLOOR; py += 60) {
    for (let px = hullX + 20; px < hullX + hullW; px += 40) {
      ctx.fillStyle = '#553022'; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Portholes
  [0.3, 0.55, 0.78].forEach(t => {
    const px = hullX + hullW * t;
    const py = CEIL + 80 + (t * 30 % 40);
    drawPorthole(ctx, px, py, 22, frame);
  });
  // Barnacles on hull edge
  for (let bi = 0; bi < 12; bi++) {
    const bx = hullX + bi * 40;
    const by = CEIL - 5 + Math.sin(bi * 1.3) * 8;
    ctx.fillStyle = '#445533'; ctx.beginPath(); ctx.arc(bx, by, 5 + bi%3, 0, Math.PI*2); ctx.fill();
  }
  // Anchor chain hanging
  const chainX = hullX + 80;
  ctx.strokeStyle = '#4A4030'; ctx.lineWidth = 4;
  for (let cy = CEIL; cy < FLOOR - 50; cy += 20) {
    ctx.beginPath(); ctx.moveTo(chainX, cy); ctx.lineTo(chainX + 4, cy + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chainX + 4, cy + 10); ctx.lineTo(chainX - 4, cy + 20); ctx.stroke();
  }
}

// ── SHIPWRECK INTERIOR CEILING ────────────────────────────────────────────────
export function drawShipCeiling(ctx, zx, zoneW, CEIL, frame) {
  // Plank ceiling from top of playfield down
  const ceilH = 48;
  // Dark wood background
  ctx.fillStyle = '#1C0E06';
  ctx.fillRect(zx, CEIL - 8, zoneW, ceilH);
  // Plank lines
  ctx.strokeStyle = '#110A04'; ctx.lineWidth = 2;
  for (let py = CEIL; py < CEIL + ceilH; py += 14) {
    ctx.beginPath(); ctx.moveTo(zx, py); ctx.lineTo(zx + zoneW, py); ctx.stroke();
  }
  // Cross beams
  ctx.fillStyle = '#150C06';
  for (let bx = zx + 80; bx < zx + zoneW - 40; bx += 280) {
    ctx.fillRect(bx, CEIL - 8, 22, ceilH + 8);
    ctx.fillStyle = '#220E06';
    ctx.fillRect(bx + 2, CEIL - 8, 4, ceilH + 8);
    ctx.fillStyle = '#150C06';
  }
  // Water drips on ceiling (animated)
  for (let di = 0; di < 5; di++) {
    const dx = zx + 120 + di * 220;
    const dPhase = (frame * 0.03 + di * 1.1) % (Math.PI * 2);
    const dripY = CEIL + ceilH - 2 + Math.abs(Math.sin(dPhase)) * 8;
    ctx.save(); ctx.globalAlpha = Math.sin(dPhase) * 0.6;
    ctx.fillStyle = '#00AACC';
    ctx.beginPath(); ctx.arc(dx, dripY, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ── ROCKY CAVE CEILING ────────────────────────────────────────────────────────
export function drawRockyCeiling(ctx, zx, zoneW, CEIL, theme, frame) {
  const isLava = theme === 'volcanic';
  const ceilH = 55;
  const baseCol = isLava ? '#1A0806' : '#0E1A1C';
  ctx.fillStyle = baseCol;
  ctx.fillRect(zx, CEIL - 10, zoneW, ceilH + 10);
  // Jagged rock silhouette
  ctx.fillStyle = isLava ? '#140604' : '#0A1416';
  ctx.beginPath(); ctx.moveTo(zx, CEIL - 10);
  let rx = zx;
  while (rx < zx + zoneW + 30) {
    const jagH = 15 + Math.sin(rx * 0.05) * 10 + Math.sin(rx * 0.13) * 8;
    ctx.lineTo(rx, CEIL + jagH);
    rx += 18 + Math.abs(Math.sin(rx * 0.07)) * 12;
  }
  ctx.lineTo(zx + zoneW, CEIL - 10);
  ctx.closePath(); ctx.fill();
  // Stalactites (volcanic or cave)
  const count = isLava ? 6 : 8;
  for (let si = 0; si < count; si++) {
    const sx = zx + 60 + si * (zoneW / count) + Math.sin(si * 2.1) * 20;
    const sLen = 22 + si % 3 * 14;
    const sW = 7 + si % 2 * 4;
    if (isLava) {
      // Lava drip stalactite
      ctx.fillStyle = '#1A0C04';
      ctx.beginPath(); ctx.moveTo(sx, CEIL); ctx.lineTo(sx + sW, CEIL); ctx.lineTo(sx + sW/2, CEIL + sLen); ctx.closePath(); ctx.fill();
      // Glowing tip
      ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(frame*0.05+si)*0.2;
      ctx.fillStyle = '#FF4400';
      ctx.beginPath(); ctx.arc(sx + sW/2, CEIL + sLen - 4, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else {
      drawIceStalactite(ctx, sx - sW/2, CEIL, sLen, sW);
    }
  }
  // Lava cracks in ceiling
  if (isLava) {
    for (let ci = 0; ci < 4; ci++) {
      const cx = zx + 100 + ci * (zoneW / 4) + Math.sin(ci * 1.7) * 40;
      drawLavaCrack(ctx, cx, CEIL + 10, 3, 30, frame + ci * 20);
    }
  }
}

// ── ICE CAVE CEILING ──────────────────────────────────────────────────────────
export function drawIceCeiling(ctx, zx, zoneW, CEIL, frame) {
  const ceilH = 50;
  // Ice base
  const iceg = ctx.createLinearGradient(zx, CEIL - 8, zx, CEIL + ceilH);
  iceg.addColorStop(0, '#1A3A5A');
  iceg.addColorStop(1, 'rgba(20,60,100,0)');
  ctx.fillStyle = iceg; ctx.fillRect(zx, CEIL - 8, zoneW, ceilH + 8);
  // Ice plate cracks
  ctx.strokeStyle = 'rgba(120,200,255,0.3)'; ctx.lineWidth = 1;
  for (let ci = 0; ci < 8; ci++) {
    const cx = zx + ci * (zoneW / 8) + 20;
    ctx.beginPath(); ctx.moveTo(cx, CEIL); ctx.lineTo(cx + 40, CEIL + 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 20, CEIL); ctx.lineTo(cx - 15, CEIL + 25); ctx.stroke();
  }
  // Stalactites
  for (let si = 0; si < 9; si++) {
    const sx = zx + 40 + si * (zoneW / 9) + Math.sin(si * 1.8) * 15;
    const sLen = 18 + si % 4 * 12;
    drawIceStalactite(ctx, sx, CEIL, sLen, 5 + si % 3 * 3);
  }
  // Air bubbles frozen in ice
  for (let bi = 0; bi < 6; bi++) {
    const bx = zx + 60 + bi * (zoneW / 6) + Math.sin(bi * 2.3) * 20;
    const by = CEIL + 8 + bi % 3 * 10;
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#88CCFF'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx, by, 4 + bi%2*2, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }
  // Light filtering effect (ambient from above)
  const shimmer = 0.04 + Math.abs(Math.sin(frame * 0.02)) * 0.03;
  ctx.save(); ctx.globalAlpha = shimmer;
  ctx.fillStyle = '#88CCFF';
  for (let ri = 0; ri < 4; ri++) {
    const rxx = zx + ri * (zoneW/4) + 20;
    ctx.fillRect(rxx, CEIL, 30, ceilH);
  }
  ctx.restore();
}
