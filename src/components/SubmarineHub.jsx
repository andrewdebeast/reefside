// SubmarineHub.jsx — Walkable submarine interior hub
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawDiver, drawSubmarineInterior } from '../utils/sprites';
import { getLevelConfig, getLevelCount } from '../utils/levels';
import { getSettings, setSettings, resetSettings, keyCodeLabel } from '../utils/settings';

const BASE_W = 1200, BASE_H = 700;
const FLOOR_Y = BASE_H - 120;
const PLAYER_SPEED = 3;

const GUARDIANS = [
  { id: 'scientist', name: 'MARINE SCIENTIST', color: '#00E8D8', ability: 'THERMAL SCAN: Boosts restoration & reveals pearls' },
  { id: 'ranger',    name: 'INDIGENOUS RANGER', color: '#66AA44', ability: 'REEF RESILIENCE: Halts zone damage temporarily' },
  { id: 'fisher',    name: 'SUSTAINABLE FISHER', color: '#F8B800', ability: 'BALANCE WAVE: Stuns all enemies on screen' },
  { id: 'advocate',  name: 'CLIMATE ADVOCATE',   color: '#CC44FF', ability: 'PUBLIC CAMPAIGN: +15% Support Meter instantly' },
];

const OUTFITS = [
  { name: 'STANDARD',    color: '#E45C10', accent: '#CC8800', bonus: 'Balanced stats' },
  { name: 'DEEP WETSUIT',color: '#1A2A66', accent: '#2244AA', bonus: '+25% Oxygen efficiency' },
  { name: 'HAZMAT SUIT', color: '#F8D800', accent: '#CC9900', bonus: 'Climate event resistance' },
];

// ── INTERACT ZONES ─────────────────────────────────────────────────────────────
const INTERACT_ZONES = [
  { id: 'closet',  floorX: 160,  w: 240, label: '[E] EQUIPMENT',    color: '#F8B800' },
  { id: 'tutorial',floorX: 380,  w: 140, label: '[E] BRIEFING',     color: '#CC44FF' },
  { id: 'robot',   floorX: 620,  w: 240, label: '[E] NAVIGATION',   color: '#00E8D8' },
  { id: 'catalog', floorX: 860,  w: 200, label: '[E] CATALOG',      color: '#66DDAA' },
  { id: 'hatch',   floorX: 1070, w: 200, label: '[E] DIVE IN',      color: '#66AA44' },
];

// ── SPECIES DATA ──────────────────────────────────────────────────────────────
const SPECIES = [
  {
    id: 'coral', name: 'STAGHORN CORAL', scientific: 'Acropora cervicornis',
    role: 'Reef Builder', color: '#FF9B21',
    desc: 'Fast-growing branching coral that forms the structural backbone of reef systems. A single colony can grow 10-20 cm per year.',
    threat: 'Bleaches and dies at +1°C above normal sea temp',
    fact: '25% of all marine life depends on coral reefs covering less than 1% of the ocean floor.',
    terms: ['zooxanthellae', 'bleaching', 'symbiosis'],
  },
  {
    id: 'shark', name: 'REEF SHARK', scientific: 'Carcharhinus amblyrhynchos',
    role: 'Apex Predator', color: '#8899CC',
    desc: 'Controls reef fish populations and prevents overgrazing of coral. Without sharks, the entire reef ecosystem collapses.',
    threat: 'Targeted by illegal finning operations',
    fact: 'Sharks have existed for 450 million years, older than trees.',
    terms: ['apex predator', 'trophic cascade'],
  },
  {
    id: 'dolphin', name: 'BOTTLENOSE DOLPHIN', scientific: 'Tursiops truncatus',
    role: 'Intelligence & Sentinel', color: '#5599CC',
    desc: 'Uses echolocation to navigate and hunt. Dolphins alert reef communities to threats and herd fish into shallow waters.',
    threat: 'Entangled in ghost fishing nets',
    fact: 'Dolphins sleep with one eye open, half the brain rests at a time.',
    terms: ['echolocation', 'bioluminescence'],
  },
  {
    id: 'jellyfish', name: 'MOON JELLYFISH', scientific: 'Aurelia aurita',
    role: 'Plankton Controller', color: '#AADDFF',
    desc: 'Ancient creatures with no brain, heart or blood. They bloom when nutrients are high, recycling energy through the food web.',
    threat: 'Blooms intensify with ocean warming and pollution',
    fact: 'Some jellyfish are biologically immortal, they can revert to a juvenile state.',
    terms: ['bioluminescence', 'thermocline'],
  },
  {
    id: 'blooper', name: 'REEF SQUID', scientific: 'Sepioteuthis sepioidea',
    role: 'Nocturnal Hunter', color: '#FC9838',
    desc: 'Masters of camouflage that can change skin patterns in milliseconds. They coordinate group hunts with sophisticated signals.',
    threat: 'Sensitive to ocean acidification',
    fact: 'Squid have three hearts and blue blood from copper-based hemocyanin.',
    terms: ['bioluminescence', 'ocean acidification'],
  },
  {
    id: 'crown', name: 'CROWN OF THORNS', scientific: 'Acanthaster planci',
    role: 'Coral Consumer', color: '#CC3333',
    desc: 'Venomous starfish that feeds on coral polyps. Outbreaks can devastate large reef sections. Natural but devastating in excess.',
    threat: 'Populations explode due to agricultural runoff removing their predators',
    fact: 'A single CoTS can consume up to 6 sq metres of coral per year.',
    terms: ['trophic cascade', 'symbiosis'],
  },
  {
    id: 'crab', name: 'GHOST CRAB', scientific: 'Ocypode cursor',
    role: 'Scavenger & Aerator', color: '#DD3300',
    desc: 'Fastest crustacean on land, capable of speeds up to 3 m/s. Burrows that aerate reef floor sediment and recycle nutrients.',
    threat: 'Beach development destroys nesting habitat',
    fact: 'Ghost crabs can run in any direction without changing body orientation.',
    terms: ['symbiosis'],
  },
  {
    id: 'seahorse', name: 'LONGSNOUT SEAHORSE', scientific: 'Hippocampus reidi',
    role: 'Ambush Predator', color: '#F8A800',
    desc: 'Only species where the male carries and births the young. Anchors to seagrass and coral with their prehensile tails.',
    threat: 'Harvested for traditional medicine; habitat loss',
    fact: 'Seahorses have no stomach, they must eat constantly to survive.',
    terms: ['symbiosis', 'zooxanthellae'],
  },
  {
    id: 'whale', name: 'BLUE WHALE', scientific: 'Balaenoptera musculus',
    role: 'Ocean Architect', color: '#445577',
    desc: 'Largest animal to ever exist on Earth. Their dives distribute nutrients vertically through the ocean, fertilising entire ecosystems.',
    threat: 'Ship strikes, entanglement; population still recovering from whaling era',
    fact: 'A blue whale\'s heart is the size of a small car and beats just 5 times per minute.',
    terms: ['thermocline', 'bioluminescence'],
  },
];

// ── GLOSSARY TERMS ─────────────────────────────────────────────────────────────
const GLOSSARY = {
  'zooxanthellae':      'Photosynthetic algae living inside coral tissue. They provide up to 90% of coral\'s energy via photosynthesis.',
  'bleaching':          'When stressed coral expels its zooxanthellae, turning white. The coral is alive but starving, and will die without recovery.',
  'symbiosis':          'Two species living in close association. Can be mutual (both benefit), commensal (one benefits, one unaffected), or parasitic.',
  'apex predator':      'A predator at the top of the food chain with no natural predators of its own.',
  'trophic cascade':    'Chain reaction through the food web when a top predator is removed. Prey populations explode, overeating everything below.',
  'bioluminescence':    'Production and emission of light by a living organism. Used for hunting, mating, and defense in the deep ocean.',
  'echolocation':       'Producing sound pulses and reading the echoes to navigate and locate prey in dark or murky water.',
  'thermocline':        'A sharp temperature boundary layer in the ocean separating warm surface water from cold deep water.',
  'ocean acidification':'Rising CO₂ dissolves into seawater forming carbonic acid, lowering pH and weakening coral skeletons and shellfish.',
  'photosymbiosis':     'Energy exchange where photosynthetic organisms (like zooxanthellae) provide food to their host in exchange for shelter.',
};

// ── CANVAS DRAWING: CATALOG DISPLAY CASE ──────────────────────────────────────
function drawCatalogCase(ctx, frame, nearZone, H) {
  const cg = nearZone === 'catalog';
  const baseX = 790;
  // Cabinet frame
  ctx.fillStyle = cg ? '#1A3040' : '#0E1E2C';
  ctx.fillRect(baseX, H - 300, 140, 180);
  ctx.strokeStyle = cg ? '#66DDAA' : '#2A4A60';
  ctx.lineWidth = 3;
  ctx.strokeRect(baseX, H - 300, 140, 180);
  // Glass shelves
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#223344';
    ctx.fillRect(baseX + 6, H - 290 + i * 52, 128, 40);
    ctx.strokeStyle = cg ? '#44BBAA' : '#1A3A50';
    ctx.lineWidth = 1;
    ctx.strokeRect(baseX + 6, H - 290 + i * 52, 128, 40);
  }
  // Specimen icons — drawn as simple pixel symbols (no emoji)
  const symbols = [
    { label: '(o)', color: '#FF9B21' },  // coral shell
    { label: '>_<', color: '#DD3300' },  // crab claws
    { label: '><>', color: '#FF9944' },  // fish
    { label: '/|\\', color: '#8899CC' }, // shark fin
    { label: '~~~', color: '#445577' },  // whale
    { label: '-x-', color: '#FC9838' },  // squid
  ];
  ctx.font = `8px monospace`;
  symbols.forEach((sym, i) => {
    const sx = baseX + 8 + (i % 3) * 42;
    const sy = H - 272 + Math.floor(i / 3) * 52;
    ctx.fillStyle = sym.color;
    ctx.fillText(sym.label, sx, sy);
  });
  // Glow
  if (cg) {
    ctx.save(); ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#66DDAA';
    ctx.fillRect(baseX - 10, H - 315, 160, 210);
    ctx.restore();
  }
  ctx.fillStyle = cg ? '#66DDAA' : '#445566';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText('SPECIES LOG', baseX + 8, H - 308);
}

// ── RENDER FULL HUB SCENE ─────────────────────────────────────────────────────
function renderHub(canvas, state) {
  const ctx = canvas.getContext('2d');
  const cw = canvas.width, ch = canvas.height;
  const scale = Math.min(cw / BASE_W, ch / BASE_H);
  const offX = (cw - BASE_W * scale) / 2;
  const offY = (ch - BASE_H * scale) / 2;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);
  ctx.save();
  ctx.translate(offX, offY);
  ctx.scale(scale, scale);
  ctx.beginPath(); ctx.rect(0, 0, BASE_W, BASE_H); ctx.clip();

  drawSubmarineInterior(ctx, BASE_W, BASE_H, state.frame);
  drawHubObjectsAll(ctx, state.frame, state.nearZone, BASE_H);

  // Player
  const px = state.playerX, py = FLOOR_Y - 30;
  drawDiver(ctx, px, py, state.playerDir === -1, false, false, state.frame);

  // Interaction prompt above nearby object
  if (state.nearZone) {
    const z = INTERACT_ZONES.find(z => z.id === state.nearZone);
    if (z) {
      const promptX = z.floorX - 44;
      const promptY = FLOOR_Y - 80;
      ctx.fillStyle = z.color;
      ctx.font = `7px 'Press Start 2P'`;
      ctx.fillText(z.label, promptX, promptY);
      if (state.frame % 20 < 10) ctx.fillText('▼', promptX + 36, promptY + 14);
    }
  }

  // HUD bar
  ctx.fillStyle = 'rgba(1,8,20,0.92)';
  ctx.fillRect(0, BASE_H - 46, BASE_W, 46);
  ctx.fillStyle = '#162840';
  ctx.fillRect(0, BASE_H - 48, BASE_W, 2);
  ctx.fillStyle = '#00E8D8';
  ctx.font = `6px 'Press Start 2P'`;
  ctx.fillText('REEFSIDE SUBMARINE BASE  ·  ARROWS/AD: WALK  ·  E: INTERACT  ·  C: CATALOG  ·  S: SETTINGS', 16, BASE_H - 28);
  ctx.fillStyle = '#334455';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText(`GUARDIAN: ${state.selectedGuardian.toUpperCase()}  ·  OUTFIT: ${OUTFITS[state.selectedOutfit].name}  ·  LEVEL: ${state.selectedLevel + 1}/${getLevelCount()}`, 16, BASE_H - 12);

  ctx.restore();
}

// ── DRAW ALL HUB CANVAS OBJECTS ───────────────────────────────────────────────
function drawHubObjectsAll(ctx, frame, nearZone, H) {
  drawCloset(ctx, frame, nearZone, H);
  drawBriefingPoster(ctx, frame, nearZone, H);
  drawNavRobot(ctx, frame, nearZone, H);
  drawCatalogCase(ctx, frame, nearZone, H);
  drawWaterHatch(ctx, frame, nearZone, H);
}

function drawCloset(ctx, frame, nearZone, H) {
  const glow = nearZone === 'closet';
  ctx.fillStyle = glow ? '#4A3418' : '#2A200E';
  ctx.fillRect(90, H - 320, 120, 170);
  ctx.fillStyle = '#3A2A14';
  ctx.fillRect(90, H - 320, 58, 170);
  ctx.strokeStyle = glow ? '#F8B800' : '#445566';
  ctx.lineWidth = 3;
  ctx.strokeRect(90, H - 322, 120, 172);
  ctx.fillStyle = '#667788'; ctx.fillRect(94, H - 300, 8, 10); ctx.fillRect(94, H - 200, 8, 10);
  ctx.fillStyle = '#AABB88'; ctx.fillRect(140, H - 248, 6, 20);
  ctx.fillStyle = '#443322';
  ctx.fillRect(100, H - 310, 40, 80);
  ctx.fillRect(107, H - 235, 26, 40);
  if (glow) {
    ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#F8B800';
    ctx.fillRect(80, H - 340, 145, 210); ctx.restore();
  }
  ctx.fillStyle = glow ? '#F8B800' : '#556677';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText('EQUIPMENT', 93, H - 328);
}

function drawBriefingPoster(ctx, frame, nearZone, H) {
  const glow = nearZone === 'tutorial';
  ctx.fillStyle = glow ? '#3A1A5A' : '#1A0A30';
  ctx.fillRect(340, H - 300, 90, 130);
  ctx.strokeStyle = glow ? '#CC44FF' : '#334455';
  ctx.lineWidth = 2;
  ctx.strokeRect(340, H - 300, 90, 130);
  ctx.fillStyle = '#AA66FF';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText('MISSION', 350, H - 282);
  ctx.fillText('BRIEFING', 349, H - 272);
  ctx.fillStyle = '#8855CC';
  ['REEF HEALTH', 'GUARDIANS', 'ENEMIES', 'CLIMATE', 'WIN GOAL'].forEach((l, i) => {
    ctx.fillText(l, 348, H - 258 + i * 14);
  });
  if (glow) {
    ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#CC44FF';
    ctx.fillRect(330, H - 310, 110, 155); ctx.restore();
  }
  ctx.fillStyle = glow ? '#CC44FF' : '#445566';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText('BRIEFING', 337, H - 310);
}

function drawNavRobot(ctx, frame, nearZone, H) {
  const glow = nearZone === 'robot';
  ctx.fillStyle = glow ? '#1A3040' : '#111C28';
  ctx.fillRect(510, H - 280, 200, 130);
  ctx.strokeStyle = glow ? '#00E8D8' : '#2A3A50';
  ctx.lineWidth = 3;
  ctx.strokeRect(510, H - 280, 200, 130);
  ctx.fillStyle = '#001810';
  ctx.fillRect(520, H - 270, 180, 80);
  ctx.save(); ctx.globalAlpha = 0.6;
  ctx.strokeStyle = '#00AA00'; ctx.lineWidth = 1;
  [25, 40, 60, 75].forEach(r => { ctx.beginPath(); ctx.arc(610, H - 230, r, 0, Math.PI * 2); ctx.stroke(); });
  const sweepAngle = (frame * 0.04) % (Math.PI * 2);
  ctx.beginPath(); ctx.moveTo(610, H - 230);
  ctx.lineTo(610 + Math.cos(sweepAngle) * 75, H - 230 + Math.sin(sweepAngle) * 75);
  ctx.strokeStyle = '#00FF44'; ctx.lineWidth = 2; ctx.stroke();
  [[20,-10],[-30,20],[50,-30],[-15,40]].forEach(([dx,dy]) => {
    ctx.fillStyle = '#00FF44'; ctx.fillRect(610+dx-2, H-230+dy-2, 4, 4);
  });
  ctx.restore();
  ctx.fillStyle = '#4A5A6A'; ctx.fillRect(568, H - 348, 44, 72);
  ctx.fillStyle = '#5A6A7A'; ctx.fillRect(570, H - 346, 40, 40);
  ctx.fillStyle = '#4A5A6A'; ctx.fillRect(572, H - 388, 36, 42);
  ctx.fillStyle = '#5A6A7A'; ctx.fillRect(574, H - 386, 32, 35);
  const eyeColor = glow ? '#00FFFF' : '#0088AA';
  ctx.fillStyle = eyeColor; ctx.fillRect(577, H - 378, 10, 10); ctx.fillRect(593, H - 378, 10, 10);
  ctx.fillStyle = '#8899AA'; ctx.fillRect(587, H - 400, 6, 16);
  ctx.fillStyle = '#00FFFF'; ctx.fillRect(586, H - 404, 8, 8);
  ctx.fillStyle = '#3A4A5A';
  ctx.fillRect(542, H - 345, 28, 10); ctx.fillRect(610, H - 345, 28, 10);
  if (glow) { ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#00E8D8'; ctx.fillRect(500, H-420, 230, 290); ctx.restore(); }
  ctx.fillStyle = glow ? '#00E8D8' : '#445566';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText('NAVIGATOR-7', 517, H - 292);
}

function drawWaterHatch(ctx, frame, nearZone, H) {
  const glow = nearZone === 'hatch';
  ctx.fillStyle = glow ? '#1A2A1A' : '#101818';
  ctx.fillRect(980, H - 260, 180, 110);
  ctx.strokeStyle = glow ? '#66FF66' : '#334455';
  ctx.lineWidth = 3;
  ctx.strokeRect(980, H - 260, 180, 110);
  ctx.fillStyle = '#1A2828';
  ctx.beginPath(); ctx.arc(1070, H - 210, 60, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = glow ? '#66FF66' : '#445566'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(1070, H - 210, 60, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#223838';
  ctx.beginPath(); ctx.arc(1070, H - 210, 46, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.fillStyle = '#556677';
    ctx.fillRect(1070 + Math.cos(a) * 54 - 4, H - 210 + Math.sin(a) * 54 - 4, 8, 8);
  }
  ctx.strokeStyle = '#667788'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(1070, H - 210, 22, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(1070, H - 210);
    ctx.lineTo(1070 + Math.cos(a) * 22, H - 210 + Math.sin(a) * 22); ctx.stroke();
  }
  if (glow) {
    ctx.save(); ctx.globalAlpha = 0.25;
    const hg = ctx.createRadialGradient(1070, H - 210, 10, 1070, H - 210, 75);
    hg.addColorStop(0, '#44FF44'); hg.addColorStop(1, 'transparent');
    ctx.fillStyle = hg; ctx.fillRect(1000, H - 290, 150, 175); ctx.restore();
    ctx.fillStyle = '#44FF44'; ctx.font = `6px 'Press Start 2P'`;
    ctx.fillText('AIRLOCK', 1035, H - 211);
  }
  ctx.fillStyle = glow ? '#66FF66' : '#445566';
  ctx.font = `5px 'Press Start 2P'`;
  ctx.fillText('WATER HATCH', 990, H - 268);
}

// ── CLOSET PANEL ──────────────────────────────────────────────────────────────
function ClosetPanel({ guardian, outfit, onConfirm, onClose }) {
  const [selG, setSelG] = useState(guardian);
  const [selO, setSelO] = useState(outfit);
  return (
    <div className="hub-panel" data-testid="closet-panel">
      <div className="hub-panel-header">
        <div className="hub-header-left">
          <div className="hub-header-indicator" />
          <span>EQUIPMENT BAY</span>
        </div>
        <button className="hub-panel-close" onClick={onClose} data-testid="closet-close">X ESC</button>
      </div>
      <div className="hub-panel-subtitle">SELECT GUARDIAN ROLE · MISSION SUIT</div>

      <div className="hub-section-title">◈ GUARDIAN ROLE</div>
      <div className="guardian-grid-hub">
        {GUARDIANS.map(g => (
          <div key={g.id} data-testid={`guardian-option-${g.id}`}
            className={`guardian-card-hub ${selG === g.id ? 'hub-card-selected' : ''}`}
            style={{ '--gc': g.color }} onClick={() => setSelG(g.id)}>
            <div className="guardian-card-hub-name" style={{ color: g.color }}>{g.name}</div>
            <div className="guardian-card-hub-ability">{g.ability}</div>
            {selG === g.id && <div className="hub-selected-badge">● ACTIVE</div>}
          </div>
        ))}
      </div>

      <div className="hub-section-title">◈ MISSION SUIT</div>
      <div className="outfit-row">
        {OUTFITS.map((o, i) => (
          <div key={i} data-testid={`outfit-option-${i}`}
            className={`outfit-card ${selO === i ? 'outfit-selected' : ''}`}
            style={{ '--oc': o.color }} onClick={() => setSelO(i)}>
            <div className="outfit-swatch" style={{ background: o.color, border: `2px solid ${o.accent}` }} />
            <div className="outfit-name" style={{ color: o.color }}>{o.name}</div>
            <div className="outfit-bonus">{o.bonus}</div>
          </div>
        ))}
      </div>

      <button data-testid="closet-confirm-btn" className="hub-confirm-btn" onClick={() => onConfirm(selG, selO)}>
        ▶ CONFIRM LOADOUT
      </button>
    </div>
  );
}

// ── NAVIGATION PANEL ──────────────────────────────────────────────────────────
function NavigationPanel({ level, onConfirm, onClose }) {
  const [selL, setSelL] = useState(level);
  const count = getLevelCount();
  return (
    <div className="hub-panel hub-panel-nav" data-testid="navigation-panel">
      <div className="hub-panel-header">
        <div className="hub-header-left">
          <div className="hub-header-indicator" style={{background:'#00E8D8'}} />
          <span>NAVIGATOR-7 · MISSION SELECT</span>
        </div>
        <button className="hub-panel-close" onClick={onClose} data-testid="nav-close">X ESC</button>
      </div>
      <div className="hub-panel-subtitle">SELECT DESTINATION ZONE</div>

      <div className="level-path">
        {Array.from({ length: count }, (_, i) => {
          const cfg = getLevelConfig(i);
          return (
            <div key={i} data-testid={`level-option-${i}`}
              className={`level-node ${selL === i ? 'level-node-selected' : ''} ${cfg.theme === 'boss' ? 'level-node-boss' : ''}`}
              onClick={() => setSelL(i)}>
              <div className="level-node-num" style={{color: cfg.theme === 'boss' ? '#FF4400' : '#00E8D8'}}>{i + 1}</div>
              <div className="level-node-name">{cfg.name}</div>
              <div className="level-node-diff">{cfg.diff}</div>
            </div>
          );
        })}
      </div>

      {selL !== null && (
        <div className="level-detail">
          <div className="level-detail-name">{getLevelConfig(selL).name}</div>
          <div className="level-detail-sub">{getLevelConfig(selL).subtitle}</div>
          {getLevelConfig(selL).theme === 'boss' && (
            <div className="level-detail-warn">WARNING: FINAL MISSION - NO RETURN</div>
          )}
        </div>
      )}

      <button data-testid="nav-confirm-btn" className="hub-confirm-btn" onClick={() => selL !== null && onConfirm(selL)}>
        ▶ SET COURSE
      </button>
    </div>
  );
}

// ── TUTORIAL PANEL ────────────────────────────────────────────────────────────
const TUTORIAL_PAGES = [
  { title: 'YOUR MISSION', accent: '#00E8D8', content: ['Welcome, Guardian. The Great Barrier Reef','is in danger. Your mission:','','Protect 30% of reef zones by the year 2030.','','Three or more zones must stay above 60%','health when 2030 arrives, or the reef','will be lost forever.'] },
  { title: 'SWIMMING', accent: '#44AAFF', content: ['ARROWS or WASD to swim.','','Press UP or SPACE to swim upward.','Release to let natural current carry you.','','Swim to the WATER SURFACE (top of screen)','to automatically refill your oxygen.','','Reach the right side of each level to advance.'] },
  { title: 'REEF ZONES', accent: '#66CC44', content: ['Each level has 10 reef zones.','','VIBRANT CORAL = Healthy (above 60%)','PALE CORAL    = Damaged (30-60%)','WHITE/GREY    = Bleached (below 30%)','','Swim through a zone to restore its health.','Defeat enemies for a big health boost.','Collect pearls for bonus restoration.'] },
  { title: 'GUARDIAN ABILITY', accent: '#CC44FF', content: ['Press E to use your Guardian ability.','(30 second cooldown)','','SCIENTIST  : THERMAL SCAN','  Reveals pearls + doubles restoration','','RANGER     : REEF RESILIENCE','  Zone cannot degrade for 15 seconds','','FISHER     : BALANCE WAVE','  Stuns all enemies on screen','','ADVOCATE   : PUBLIC CAMPAIGN','  Instantly +15% Support Meter'] },
  { title: 'ENEMIES', accent: '#FF6644', content: ['SHARK      : Bounces you back. HP: 3','DOLPHIN    : Launches you upward.','JELLYFISH  : Sinusoidal swimmer. HP: 1','BLOOPER    : Chases you. HP: 1','CRAB       : Walks on floor. HP: 1','SEAHORSE   : Collectible bonus. HP: 1','FISHING NET: Entangles. Stomp to clear.','','Stomp enemies from above to defeat them.','Kill chains multiply your score!'] },
  { title: 'CLIMATE EVENTS', accent: '#FF8844', content: ['Random climate events will damage zones!','','HEATWAVE  : Zones lose health rapidly.','  Frequency increases near 2030!','','CYCLONE   : Strong currents push you.','  Debris rains from above.','','ADVOCATE ability can neutralise','the current active climate event.'] },
];

function TutorialPanel({ onClose }) {
  const [page, setPage] = useState(0);
  const total = TUTORIAL_PAGES.length;
  const p = TUTORIAL_PAGES[page];
  return (
    <div className="hub-panel hub-panel-tutorial" data-testid="tutorial-panel">
      <div className="hub-panel-header">
        <div className="hub-header-left">
          <div className="hub-header-indicator" style={{background:'#CC44FF'}} />
          <span>MISSION BRIEFING - {page + 1}/{total}</span>
        </div>
        <button className="hub-panel-close" onClick={onClose} data-testid="tutorial-close">X ESC</button>
      </div>
      <div className="tutorial-title" style={{ color: p.accent }}>{p.title}</div>
      <div className="tutorial-content">
        {p.content.map((line, i) => (
          <div key={i} className="tutorial-line" style={line.startsWith(' ') ? { color: '#889999', marginLeft: '8px' } : {}}>{line || '\u00A0'}</div>
        ))}
      </div>
      <div className="tutorial-nav">
        <button data-testid="tutorial-prev-btn" className="hub-nav-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← PREV</button>
        <div className="tutorial-dots">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`tutorial-dot ${i === page ? 'dot-active' : ''}`} onClick={() => setPage(i)} />
          ))}
        </div>
        {page < total - 1
          ? <button data-testid="tutorial-next-btn" className="hub-nav-btn hub-nav-primary" onClick={() => setPage(p => p + 1)}>NEXT →</button>
          : <button data-testid="tutorial-done-btn" className="hub-nav-btn hub-nav-primary" onClick={onClose}>DIVE READY!</button>
        }
      </div>
    </div>
  );
}

// ── CATALOG PANEL ─────────────────────────────────────────────────────────────
function TooltipTerm({ term }) {
  const [show, setShow] = useState(false);
  const def = GLOSSARY[term];
  if (!def) return <span className="catalog-term">{term}</span>;
  return (
    <span className="catalog-term catalog-term-tip"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onClick={() => setShow(s => !s)}>
      {term}
      {show && <span className="catalog-tooltip" role="tooltip">{def}</span>}
    </span>
  );
}

function CatalogPanel({ onClose }) {
  const [selected, setSelected] = useState(null);
  const sp = selected !== null ? SPECIES[selected] : null;

  return (
    <div className="hub-panel hub-panel-catalog" data-testid="catalog-panel">
      <div className="hub-panel-header">
        <div className="hub-header-left">
          <div className="hub-header-indicator" style={{background:'#66DDAA'}} />
          <span>BIODIVERSITY CATALOG · SPECIES LOG</span>
        </div>
        <button className="hub-panel-close" onClick={onClose} data-testid="catalog-close">X ESC</button>
      </div>
      <div className="hub-panel-subtitle">HOVER TERMS FOR DEFINITIONS · CLICK SPECIES FOR FULL RECORD</div>

      <div className="catalog-layout">
        <div className="catalog-list">
          {SPECIES.map((s, i) => (
            <div key={s.id} data-testid={`species-card-${s.id}`}
              className={`catalog-card ${selected === i ? 'catalog-card-selected' : ''}`}
              style={{ '--sc': s.color }}
              onClick={() => setSelected(i === selected ? null : i)}>
              <div className="catalog-card-dot" style={{ background: s.color }} />
              <div className="catalog-card-body">
                <div className="catalog-card-name" style={{ color: s.color }}>{s.name}</div>
                <div className="catalog-card-role">{s.role}</div>
              </div>
              <div className="catalog-card-arrow">{selected === i ? '▼' : '▶'}</div>
            </div>
          ))}
        </div>

        <div className="catalog-detail">
          {sp ? (
            <>
              <div className="catalog-detail-name" style={{ color: sp.color }}>{sp.name}</div>
              <div className="catalog-detail-sci">// {sp.scientific}</div>
              <div className="catalog-detail-role">{sp.role.toUpperCase()}</div>
              <div className="catalog-separator" />
              <div className="catalog-detail-desc">{sp.desc}</div>
              <div className="catalog-separator" />
              <div className="catalog-detail-row"><span className="catalog-label">THREAT</span><span className="catalog-detail-threat">{sp.threat}</span></div>
              <div className="catalog-detail-row"><span className="catalog-label">FIELD NOTE</span><span className="catalog-detail-fact">{sp.fact}</span></div>
              {sp.terms.length > 0 && (
                <div className="catalog-detail-row">
                  <span className="catalog-label">GLOSSARY</span>
                  <span className="catalog-terms-list">
                    {sp.terms.map((t, i) => <React.Fragment key={t}>{i > 0 && <span style={{color:'#334455'}}> · </span>}<TooltipTerm term={t} /></React.Fragment>)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="catalog-empty">
              <div className="catalog-empty-icon">◈</div>
              <div className="catalog-empty-text">SELECT A SPECIES TO VIEW FULL FIELD RECORD</div>
              <div className="catalog-empty-sub">Hover glossary terms for scientific definitions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PANEL ─────────────────────────────────────────────────────────────
const KEY_ACTIONS = [
  { key: 'left',    label: 'SWIM LEFT',      fixed: 'ArrowLeft' },
  { key: 'right',   label: 'SWIM RIGHT',     fixed: 'ArrowRight' },
  { key: 'up',      label: 'SWIM UP',        fixed: 'ArrowUp / Space' },
  { key: 'ability', label: 'GUARDIAN ABILITY', fixed: null },
  { key: 'pause',   label: 'PAUSE',          fixed: 'Escape' },
  { key: 'sound',   label: 'TOGGLE SOUND',   fixed: null },
];

const COLORBLIND_MODES = [
  { id: 'none',          label: 'NORMAL',       desc: 'Default colour palette' },
  { id: 'deuteranopia',  label: 'DEUTERANOPIA',  desc: 'Green-blind friendly (orange/blue shift)' },
  { id: 'protanopia',    label: 'PROTANOPIA',    desc: 'Red-blind friendly (yellow/blue shift)' },
  { id: 'tritanopia',    label: 'HIGH CONTRAST', desc: 'Maximum contrast for all conditions' },
];

function SettingsPanel({ onClose, onSettingsChange }) {
  const [settings, setLocalSettings] = useState(() => getSettings());
  const [awaitingKey, setAwaitingKey] = useState(null);

  // Capture remapped key
  useEffect(() => {
    if (!awaitingKey) return;
    const handler = e => {
      e.preventDefault();
      const forbidden = ['Escape', 'F5', 'F12', 'Tab'];
      if (forbidden.includes(e.code)) { setAwaitingKey(null); return; }
      const updated = setSettings({ keyMap: { [awaitingKey]: e.code } });
      setLocalSettings({ ...updated });
      onSettingsChange && onSettingsChange(updated);
      setAwaitingKey(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [awaitingKey, onSettingsChange]);

  const handleColorblind = (mode) => {
    const updated = setSettings({ colorblind: mode });
    setLocalSettings({ ...updated });
    onSettingsChange && onSettingsChange(updated);
  };

  const handleReset = () => {
    const updated = resetSettings();
    setLocalSettings({ ...updated });
    onSettingsChange && onSettingsChange(updated);
    setAwaitingKey(null);
  };

  return (
    <div className="hub-panel hub-panel-settings" data-testid="settings-panel">
      <div className="hub-panel-header">
        <div className="hub-header-left">
          <div className="hub-header-indicator" style={{background:'#F8B800'}} />
          <span>SYSTEM SETTINGS</span>
        </div>
        <button className="hub-panel-close" onClick={onClose} data-testid="settings-close">X ESC</button>
      </div>
      <div className="hub-panel-subtitle">KEY BINDINGS · DISPLAY OPTIONS</div>

      <div className="settings-layout">
        <div className="settings-section">
          <div className="hub-section-title">◈ KEY BINDINGS</div>
          <div className="settings-note">Arrow keys are always active as fallback. Click a binding to remap.</div>
          <div className="keybind-list">
            {KEY_ACTIONS.map(a => (
              <div key={a.key} className="keybind-row" data-testid={`keybind-${a.key}`}>
                <div className="keybind-action">{a.label}</div>
                <div className="keybind-keys">
                  {a.fixed && <span className="keybind-tag keybind-fixed">{a.fixed}</span>}
                  <button
                    data-testid={`remap-${a.key}`}
                    className={`keybind-tag keybind-custom ${awaitingKey === a.key ? 'keybind-awaiting' : ''}`}
                    onClick={() => setAwaitingKey(awaitingKey === a.key ? null : a.key)}>
                    {awaitingKey === a.key ? '[ PRESS KEY ]' : keyCodeLabel(settings.keyMap[a.key])}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="hub-section-title">◈ COLORBLIND MODE</div>
          <div className="colorblind-grid">
            {COLORBLIND_MODES.map(m => (
              <button
                key={m.id}
                data-testid={`cb-mode-${m.id}`}
                className={`cb-option ${settings.colorblind === m.id ? 'cb-active' : ''}`}
                onClick={() => handleColorblind(m.id)}>
                <div className="cb-label">{m.label}</div>
                <div className="cb-desc">{m.desc}</div>
                {settings.colorblind === m.id && <div className="cb-check">OK ACTIVE</div>}
              </button>
            ))}
          </div>

          <button data-testid="settings-reset-btn" className="hub-reset-btn" onClick={handleReset}>
            ↺ RESET TO DEFAULTS
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN HUB COMPONENT ────────────────────────────────────────────────────────
export default function SubmarineHub({ guardian, outfit, level, onStartGame, onSettingsChange }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    playerX: 200, playerDir: 1, frame: 0,
    nearZone: null,
    selectedGuardian: guardian || 'scientist',
    selectedOutfit: outfit ?? 0,
    selectedLevel: level ?? 0,
  });
  const keysRef   = useRef({});
  const [panel, setPanel] = useState(null);

  // ── KEYBOARD (FIXED: added keyup handler to prevent stuck keys) ────────────
  useEffect(() => {
    const down = e => {
      keysRef.current[e.code] = true;

      // Prevent browser scroll for game keys
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (panel) {
        if (e.code === 'Escape') setPanel(null);
        return;
      }

      const s = stateRef.current;
      if (e.code === 'KeyE' && s.nearZone) {
        if (s.nearZone === 'hatch') {
          onStartGame({ guardian: s.selectedGuardian, outfit: s.selectedOutfit, level: s.selectedLevel });
        } else {
          setPanel(s.nearZone);
        }
      }
      if (e.code === 'Escape') setPanel(null);
      if (e.code === 'KeyC' && !panel) setPanel('catalog');
      if (e.code === 'KeyS' && !panel) setPanel('settings');
    };

    // FIX: Clear keys on keyup to prevent stuck movement
    const up = e => { delete keysRef.current[e.code]; };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [panel, onStartGame]);

  // ── GAME LOOP ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    let raf;
    const loop = () => {
      const s = stateRef.current;
      const keys = keysRef.current;
      s.frame++;

      if (!panel) {
        if (keys['ArrowLeft']  || keys['KeyA']) { s.playerX = Math.max(50, s.playerX - PLAYER_SPEED); s.playerDir = -1; }
        if (keys['ArrowRight'] || keys['KeyD']) { s.playerX = Math.min(1150, s.playerX + PLAYER_SPEED); s.playerDir = 1; }
        const near = INTERACT_ZONES.find(z => Math.abs(s.playerX - z.floorX) < z.w / 2 + 20);
        s.nearZone = near ? near.id : null;
      }

      renderHub(canvas, s);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [panel]);

  const handleSettingsChange = useCallback((updated) => {
    onSettingsChange && onSettingsChange(updated);
  }, [onSettingsChange]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} className="reefside-canvas" data-testid="hub-canvas" />

      {panel && (
        <div className="hub-overlay">
          {panel === 'closet' && (
            <ClosetPanel
              guardian={stateRef.current.selectedGuardian}
              outfit={stateRef.current.selectedOutfit}
              onConfirm={(g, o) => { stateRef.current.selectedGuardian = g; stateRef.current.selectedOutfit = o; setPanel(null); }}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'robot' && (
            <NavigationPanel
              level={stateRef.current.selectedLevel}
              onConfirm={(l) => { stateRef.current.selectedLevel = l; setPanel(null); }}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'tutorial' && <TutorialPanel onClose={() => setPanel(null)} />}
          {panel === 'catalog' && <CatalogPanel onClose={() => setPanel(null)} />}
          {panel === 'settings' && <SettingsPanel onClose={() => setPanel(null)} onSettingsChange={handleSettingsChange} />}
        </div>
      )}
    </div>
  );
}
