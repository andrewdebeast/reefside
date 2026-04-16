// levels.js — REEFSIDE Multi-Level System (7 levels + whale boss)
export const FLOOR_Y = 600;
export const CEIL_Y  = 82;
export const MID_Y   = Math.floor((FLOOR_Y + CEIL_Y) / 2); // ~341
const ZONE_W = 1200;

const R = () => Math.random();

function pearlRow(x, y, count, gap = 32) {
  return Array.from({ length: count }, (_, i) => ({ type: 'pearl', x: x + i * gap, y, frame: (i * 7) % 30 }));
}
function pearlArc(cx, y, count, r) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / (count - 1)) * Math.PI;
    return { type: 'pearl', x: cx - r + i * (r * 2 / (count - 1)), y: y - Math.sin(t) * r * 0.4, frame: i * 4 };
  });
}
function plat(x, y, w, h = 48) { return { x, y, w, h, zone: Math.floor(x / ZONE_W) }; }
function enemy(type, x, y, vx, opts = {}) {
  return { type, x, y, vx, vy: 0, active: false, dead: false, stunTimer: 0, timer: 0,
    hp: type === 'shark' ? 3 : type === 'crown' ? 2 : 1,
    ...(type === 'net' ? { baseY: y } : {}),
    ...opts };
}
function powerup(type, x, y) { return { type, x, y, active: true }; }

// ── LEVEL FACTORY ─────────────────────────────────────────────────────────────
function makeLevel({ nz = 10, diff = 0.4, eTypes = ['blooper','jellyfish'],
  sh = 75, hasCrab = false, hasSeahorse = false, hasShark = false,
  hasDolphin = false, hasNet = false, bossLevel = false } = {}) {
  const W = ZONE_W * nz;
  const obs = [], col = [], ene = [], pup = [];

  for (let z = 0; z < nz; z++) {
    const zx = z * ZONE_W;
    const d = diff + (z / nz) * 0.35;
    const zone = z;

    // Platforms
    const pConfig = [
      plat(zx + 220, FLOOR_Y - 130, 100 + R() * 60),
      plat(zx + 440, CEIL_Y + 20 + R() * 40, 110 + R() * 50),
      plat(zx + 680, MID_Y - 40 + (R() - 0.5) * 100, 140 + R() * 60),
      plat(zx + 900, FLOOR_Y - 170, 110 + R() * 70),
    ].slice(0, Math.min(4, 2 + Math.floor(d * 3)));
    obs.push(...pConfig);

    // Pearls
    col.push(...pearlRow(zx + 200, MID_Y - 60, 5 + Math.floor(d)));
    col.push(...pearlArc(zx + 700, MID_Y, 7, 70));
    if (z % 3 === 0) col.push(...pearlRow(zx + 1000, CEIL_Y + 50, 4, 28));

    // Enemies
    const eCount = 2 + Math.floor(d * 3.5);
    const gap = Math.floor((ZONE_W - 500) / eCount);
    for (let ei = 0; ei < eCount; ei++) {
      const ex = zx + 300 + ei * gap;
      const ey = MID_Y + (R() - 0.5) * 220;
      const type = eTypes[Math.floor(R() * eTypes.length)];
      const spd = 1.2 + d * 1.8;
      const vx = type === 'shark' ? -spd : (R() < 0.5 ? -spd : spd);
      ene.push(enemy(type, ex, Math.max(CEIL_Y + 20, Math.min(FLOOR_Y - 44, ey)), vx));
    }

    if (hasCrab) {
      ene.push(enemy('crab', zx + 350, FLOOR_Y - 22, 0.7, { zone }));
      if (z % 2 === 0) ene.push(enemy('crab', zx + 850, FLOOR_Y - 22, -0.7, { zone }));
    }
    if (hasSeahorse && z % 3 === 1) {
      ene.push(enemy('seahorse', zx + 600, MID_Y - 30, 0, { vy: -0.4, zone }));
    }
    if (hasNet) {
      // Fishing net: hangs in mid-water, appears every 2-3 zones
      if (z % 2 === 0) {
        const nx = zx + 450 + R() * 300;
        ene.push(enemy('net', nx, CEIL_Y + 50 + R() * 80, 0, { baseY: CEIL_Y + 50 + R() * 80, zone }));
      }
      if (z % 3 === 1) {
        const nx2 = zx + 800 + R() * 200;
        ene.push(enemy('net', nx2, CEIL_Y + 60 + R() * 70, 0, { baseY: CEIL_Y + 60 + R() * 70, zone }));
      }
    }

    if (z % 3 === 2) pup.push(powerup('oxygen', zx + 580, MID_Y - 90));
    if (z === nz - 3) pup.push(powerup('guardian_power', zx + 500, MID_Y - 100));
    if (z === nz - 5) pup.push(powerup('oxygen', zx + 700, MID_Y - 80));
  }

  return { width: W, obstacles: obs, collectibles: col, enemies: ene, powerups: pup,
    exitX: W - 180, exitY: MID_Y, startHealth: sh };
}

// ── LEVEL CONFIGS ─────────────────────────────────────────────────────────────
const LEVELS = [
  {
    name: 'SHALLOW REEF', theme: 'reef', subtitle: 'Learn to protect the coral',
    diff: '[+  ]', bgFrom: '#020D22', bgTo: '#041830',
    data: makeLevel({ nz: 8, diff: 0.25, eTypes: ['blooper','jellyfish','dolphin'],
      sh: 82, hasDolphin: true }),
  },
  {
    name: 'DEEP OCEAN', theme: 'deep', subtitle: 'Darker waters, bigger threats',
    diff: '[++ ]', bgFrom: '#010815', bgTo: '#020E20',
    data: makeLevel({ nz: 9, diff: 0.50, eTypes: ['shark','blooper','jellyfish','crown'],
      sh: 72, hasShark: true, hasNet: true }),
  },
  {
    name: 'NIGHT OCEAN', theme: 'night', subtitle: 'Only your light guides you',
    diff: '[++ ]', bgFrom: '#000308', bgTo: '#010510',
    data: makeLevel({ nz: 8, diff: 0.55, eTypes: ['jellyfish','blooper'],
      sh: 65 }),
  },
  {
    name: 'SHIPWRECK', theme: 'shipwreck', subtitle: 'Explore the forgotten hull',
    diff: '[+++]', bgFrom: '#061210', bgTo: '#0A1C18',
    data: makeLevel({ nz: 9, diff: 0.65, eTypes: ['crown','crab','blooper'],
      sh: 58, hasCrab: true, hasSeahorse: true, hasNet: true }),
  },
  {
    name: 'VOLCANIC VENT', theme: 'volcanic', subtitle: 'Heat rises from the deep',
    diff: '[+++]', bgFrom: '#120802', bgTo: '#1A0E04',
    data: makeLevel({ nz: 9, diff: 0.75, eTypes: ['crown','shark','blooper'],
      sh: 45, hasShark: true }),
  },
  {
    name: 'ARCTIC WATERS', theme: 'arctic', subtitle: 'The frozen frontier',
    diff: '[+++]', bgFrom: '#040E1A', bgTo: '#0A1A28',
    data: makeLevel({ nz: 10, diff: 0.85, eTypes: ['shark','jellyfish','crab'],
      sh: 50, hasShark: true, hasCrab: true, hasNet: true }),
  },
  {
    name: 'THE DEEP HUNT', theme: 'boss', subtitle: 'Something ancient stirs...',
    diff: '[+++]', bgFrom: '#000508', bgTo: '#000C14',
    data: {
      width: 5000, exitX: 4800, exitY: MID_Y, startHealth: 60, isBossLevel: true,
      obstacles: [
        plat(800,  FLOOR_Y - 150, 180), plat(1600, CEIL_Y + 30, 160),
        plat(2400, MID_Y - 50, 200),    plat(3200, FLOOR_Y - 120, 160),
        plat(4000, CEIL_Y + 60, 140),
      ],
      collectibles: [
        ...pearlRow(300,  MID_Y - 40, 8, 40),
        ...pearlRow(1200, MID_Y + 20, 6, 35),
        ...pearlRow(2500, MID_Y - 60, 7, 38),
        ...pearlRow(3600, MID_Y + 30, 6, 32),
        ...pearlArc(4200, MID_Y, 10, 90),
      ],
      enemies: [],
      powerups: [
        powerup('oxygen', 1000, MID_Y - 90),
        powerup('oxygen', 2800, MID_Y - 90),
        powerup('guardian_power', 1800, MID_Y - 100),
      ],
    },
  },
];

export function getLevelConfig(idx) {
  return LEVELS[Math.min(Math.max(0, idx), LEVELS.length - 1)];
}
export function getLevelCount() { return LEVELS.length; }

// Backward compat
export function getReefLevel() { return LEVELS[0].data; }
export function getLevel(num)  { return getLevelConfig(num - 1).data; }
export function getArcadeLevel() { return LEVELS[0].data; }
