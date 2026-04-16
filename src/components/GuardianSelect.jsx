// GuardianSelect.jsx — Guardian role selection screen

import React, { useState } from 'react';

const GUARDIANS = [
  {
    id: 'scientist',
    name: 'MARINE SCIENTIST',
    emoji: '[SCI]',
    tagline: 'THERMAL MAPPING',
    desc: 'Analyze reef health, reveal hidden pearls, scan for danger zones',
    ability: 'SCAN: Reveals hidden items and marks danger zones for 10s',
    color: '#00E8D8',
    suitColor: '#2244AA',
    portrait: drawScientist,
  },
  {
    id: 'ranger',
    name: 'INDIGENOUS RANGER',
    emoji: '[RNG]',
    tagline: 'REEF RESILIENCE',
    desc: 'Apply ancient knowledge to slow reef damage and restore zones',
    ability: 'RESILIENCE: Halts zone health loss in nearby area for 15s',
    color: '#66AA44',
    suitColor: '#446622',
    portrait: drawRanger,
  },
  {
    id: 'fisher',
    name: 'SUSTAINABLE FISHER',
    emoji: '[FSH]',
    tagline: 'QUOTA BALANCE',
    desc: 'Manage marine life balance, slow enemy spawns, auto-collect nearby pearls',
    ability: 'BALANCE: Stuns all fish enemies on screen for 8s',
    color: '#F8B800',
    suitColor: '#AA6600',
    portrait: drawFisher,
  },
  {
    id: 'advocate',
    name: 'CLIMATE ADVOCATE',
    emoji: '[ADV]',
    tagline: 'PUBLIC CAMPAIGN',
    desc: 'Rally community support to unlock policies that reduce climate events',
    ability: 'CAMPAIGN: +15% Support Meter, reduces climate event frequency',
    color: '#CC44FF',
    suitColor: '#660099',
    portrait: drawAdvocate,
  },
];

// ── Portrait drawing functions (pixel art via data URI canvas) ────────────────
function drawScientist(canvas) {
  const ctx = canvas.getContext('2d');
  const p = 3; // pixel scale
  ctx.imageSmoothingEnabled = false;
  const r = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x*p, y*p, w*p, h*p); };

  // Hair (black)
  r('#111111', 2, 0, 8, 4);
  r('#000000', 1, 1, 10, 3);
  r('#2244AA', 6, 2, 2, 2); // blue hair clip
  // Face
  r('#FDDBB4', 2, 3, 8, 5);
  r('#FDDBB4', 1, 4, 1, 3);
  r('#FDDBB4', 10, 4, 1, 3);
  // Eyes
  r('#000000', 3, 5, 2, 1);
  r('#000000', 7, 5, 2, 1);
  r('#FFFFFF', 3, 5, 1, 1);
  r('#FFFFFF', 7, 5, 1, 1);
  // Nose
  r('#E0A090', 5, 6, 2, 1);
  // Mouth / teal mask
  r('#00AACC', 2, 7, 8, 2);
  r('#0099BB', 3, 7, 6, 1);
  // White lab coat
  r('#FFFFFF', 1, 9, 10, 8);
  r('#EEEEEE', 1, 10, 2, 6);
  r('#EEEEEE', 9, 10, 2, 6);
  r('#DDDDDD', 5, 9, 2, 1); // collar
  // Dark inside
  r('#333333', 5, 9, 2, 4);
  // Brown pants
  r('#885533', 2, 17, 3, 4);
  r('#885533', 7, 17, 3, 4);
  // Dark boots
  r('#222222', 2, 21, 3, 3);
  r('#222222', 7, 21, 3, 3);
}

function drawRanger(canvas) {
  const ctx = canvas.getContext('2d');
  const p = 3;
  ctx.imageSmoothingEnabled = false;
  const r = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x*p, y*p, w*p, h*p); };

  // Hair
  r('#331100', 2, 0, 8, 4);
  r('#220000', 1, 1, 10, 3);
  // Traditional headband
  r('#FF6600', 1, 3, 10, 2);
  r('#FF8800', 2, 3, 8, 1);
  r('#FFAA00', 4, 3, 4, 1);
  // Face
  r('#CC8855', 2, 4, 8, 5);
  r('#CC8855', 1, 5, 1, 3);
  r('#CC8855', 10, 5, 1, 3);
  // Eyes
  r('#221100', 3, 5, 2, 1);
  r('#221100', 7, 5, 2, 1);
  r('#FFFFFF', 3, 5, 1, 1);
  r('#FFFFFF', 7, 5, 1, 1);
  // Smile
  r('#AA6633', 4, 7, 4, 1);
  // Earth-tone vest
  r('#664422', 1, 9, 10, 8);
  r('#885533', 2, 9, 8, 6);
  r('#AA7744', 3, 10, 6, 4);
  // Pants
  r('#442211', 2, 17, 3, 4);
  r('#442211', 7, 17, 3, 4);
  // Boots
  r('#221100', 2, 21, 3, 3);
  r('#221100', 7, 21, 3, 3);
  // Nature staff
  r('#885533', 11, 6, 1, 14);
  r('#00A800', 10, 5, 3, 2);
}

function drawFisher(canvas) {
  const ctx = canvas.getContext('2d');
  const p = 3;
  ctx.imageSmoothingEnabled = false;
  const r = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x*p, y*p, w*p, h*p); };

  // Captain hat (blue)
  r('#1A3A8A', 1, 0, 10, 4);
  r('#2244AA', 2, 0, 8, 3);
  r('#FFFFFF', 2, 3, 8, 1); // hat brim
  r('#F8B800', 5, 1, 2, 1); // hat badge
  // Orange hair
  r('#FF8800', 2, 3, 8, 2);
  r('#FF6600', 3, 4, 6, 1);
  // Face
  r('#FDDBB4', 2, 5, 8, 4);
  r('#FDDBB4', 1, 6, 1, 2);
  r('#FDDBB4', 10, 6, 1, 2);
  // Eyes
  r('#000000', 3, 6, 2, 1);
  r('#000000', 7, 6, 2, 1);
  r('#FFFFFF', 3, 6, 1, 1);
  r('#FFFFFF', 7, 6, 1, 1);
  // Smile
  r('#CC7755', 4, 8, 4, 1);
  // Orange fishing vest
  r('#FF6600', 1, 9, 10, 8);
  r('#FF8833', 2, 9, 8, 6);
  r('#FFAA55', 3, 10, 6, 4);
  r('#CC4400', 5, 9, 2, 8); // vest stripe
  // Pants
  r('#334466', 2, 17, 3, 4);
  r('#334466', 7, 17, 3, 4);
  // Boots
  r('#222222', 2, 21, 3, 3);
  r('#222222', 7, 21, 3, 3);
}

function drawAdvocate(canvas) {
  const ctx = canvas.getContext('2d');
  const p = 3;
  ctx.imageSmoothingEnabled = false;
  const r = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x*p, y*p, w*p, h*p); };

  // Purple hair
  r('#881199', 1, 0, 10, 5);
  r('#AA22BB', 2, 0, 8, 4);
  r('#CC44DD', 3, 1, 6, 2);
  // Face
  r('#FDDBB4', 2, 4, 8, 5);
  r('#FDDBB4', 1, 5, 1, 3);
  r('#FDDBB4', 10, 5, 1, 3);
  // Eyes
  r('#550066', 3, 5, 2, 1);
  r('#550066', 7, 5, 2, 1);
  r('#FFFFFF', 3, 5, 1, 1);
  r('#FFFFFF', 7, 5, 1, 1);
  // Smile
  r('#CC7755', 4, 7, 4, 1);
  // White/purple jacket
  r('#FFFFFF', 1, 9, 10, 8);
  r('#EEEEEE', 1, 9, 4, 8);
  r('#CC44DD', 5, 9, 6, 8);
  r('#AA22BB', 7, 9, 4, 8);
  // Pants
  r('#440055', 2, 17, 3, 4);
  r('#440055', 7, 17, 3, 4);
  // Boots
  r('#330044', 2, 21, 3, 3);
  r('#330044', 7, 21, 3, 3);
  // Megaphone
  r('#FF6600', 11, 10, 5, 3);
  r('#FF8833', 11, 10, 4, 2);
  r('#222222', 14, 9, 2, 5);
  r('#FFAA00', 15, 11, 3, 1);
}

// ── GUARDIAN CARD COMPONENT ───────────────────────────────────────────────────
function GuardianCard({ g, selected, claimed, onSelect }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.width = 36 * 3;
      ref.current.height = 24 * 3;
      g.portrait(ref.current);
    }
  }, [g]);

  return (
    <div
      data-testid={`guardian-card-${g.id}`}
      className={`guardian-card ${selected ? 'guardian-card-selected' : ''}`}
      style={{ '--card-color': g.color }}
      onClick={onSelect}
    >
      <div className="guardian-portrait">
        <canvas ref={ref} style={{ imageRendering: 'pixelated', width: '72px', height: '72px' }} />
      </div>
      <div className="guardian-info">
        <div className="guardian-name" style={{ color: g.color }}>{g.name}</div>
        <div className="guardian-tag">{g.tagline}</div>
        <div className="guardian-desc">{g.desc}</div>
        <div className="guardian-ability-box" style={{ borderColor: g.color }}>
          <span className="guardian-ability-label">ABILITY:</span>
          <span className="guardian-ability-text">{g.ability}</span>
        </div>
      </div>
      {selected && <div className="guardian-selected-badge">SELECTED</div>}
    </div>
  );
}

export default function GuardianSelect({ onSelect }) {
  const [selected, setSelected] = useState('scientist');

  return (
    <div data-testid="guardian-select" className="guardian-select">
      <div className="gs-header">
        <div className="gs-title">CHOOSE YOUR GUARDIAN</div>
        <div className="gs-subtitle">EACH ROLE BRINGS UNIQUE CONSERVATION POWERS</div>
      </div>

      <div className="guardian-grid">
        {GUARDIANS.map(g => (
          <GuardianCard
            key={g.id}
            g={g}
            selected={selected === g.id}
            onSelect={() => setSelected(g.id)}
          />
        ))}
      </div>

      <div className="gs-footer">
        <div className="gs-mission">
          MISSION: Protect 30% of the Great Barrier Reef by 2030 - UN SDG 14 Target
        </div>
        <button
          data-testid="dive-in-btn"
          className="gs-dive-btn"
          onClick={() => onSelect(selected)}
        >
          DIVE IN →
        </button>
      </div>
    </div>
  );
}
