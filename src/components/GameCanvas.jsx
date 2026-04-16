// GameCanvas.jsx — REEFSIDE Full Game Engine (v2)
import React, { useRef, useEffect, useCallback } from 'react';
import {
  drawDiver, drawBlooper, drawJellyfish, drawBubble, drawParticle,
  drawSeaweed, drawPearl, drawOxygenTank, drawGuardianPower,
  drawShark, drawDolphin, drawCrownOfThorns, drawSubmarine,
  drawReefFish, drawCoralFormation, drawCoralBlock,
  drawCrab, drawSeahorse, drawWhale, drawWhaleStomachBg, drawNet,
  drawTreasureChest, drawPorthole, drawIceStalactite,
  drawLavaCrack, drawShipHullExterior, drawShipCeiling,
  drawRockyCeiling, drawIceCeiling,
} from '../utils/sprites';
import { getLevelConfig, getLevelCount } from '../utils/levels';
import {
  toggleAudio, isAudioEnabled, updateAmbience,
  playPearl, playDeath, playPowerUp, playBubble,
  playBloom, playWarning, playDolphinBounce,
  playCampaign, playHeatwave, playLevelClear,
  playHit, playNetEntangle,
} from '../utils/audio';
import { getKeyMap } from '../utils/settings';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const BASE_W = 1200, BASE_H = 700;
const HUD_TOP = 60, HUD_BOT = 50;
const FLOOR_Y = 600, CEIL_Y = HUD_TOP + 22;
const GRAVITY = 0.18;   // Stronger gravity (Mario feel)
const MAX_FALL = 4.5;
const SWIM_UP = 0.52;
const MAX_SWIM_UP = -5.8;
const H_ACCEL = 0.45;
const MAX_H = 4.2;
const H_FRICTION = 0.88;
const ZONE_W = 1200, NUM_ZONES = 10;
const FRAMES_PER_YEAR = 3000;
const ABILITY_COOLDOWN = 1800;
const PROTECTED_THRESHOLD = 60;
const WIN_ZONES = 3;
const MAX_LIVES = 3;
const KILL_CHAIN_WINDOW = 120;

const GUARDIAN_COLORS = { scientist:'#00E8D8', ranger:'#66AA44', fisher:'#F8B800', advocate:'#CC44FF' };
const GUARDIAN_ABILITY = { scientist:'THERMAL SCAN', ranger:'REEF RESILIENCE', fisher:'BALANCE WAVE', advocate:'PUBLIC CAMPAIGN' };

const OUTFIT_COLORS = ['#E45C10','#1A2A66','#F8D800']; // standard, wetsuit, hazmat

const VIGNETTE_MEMORIES = {
  scientist: ['Dr. Kalani mapped these corals as a student...','The thermal data tells a story no chart can capture.','Three degrees warmer. But today it recovers.'],
  ranger:    ['Elder Yawuru\'s songs spoke of this place...','My grandmother fished these waters every morning tide.','The sea remembers what we have forgotten.'],
  fisher:    ['Three generations fished these waters wisely.','A balanced catch today means fish tomorrow.','The ocean gives back what we protect.'],
  advocate:  ['Every petition signature was worth this moment.','Policy and ocean, finally aligned.','Thirty percent. A number that means everything.'],
};

const LEVEL_THEME_COLORS = {
  reef:      { bg0: '#020D22', bg1: '#041830', floorC: '#1A4A2A', floorC2: '#FF6B35' },
  deep:      { bg0: '#010815', bg1: '#020E20', floorC: '#0D2A3A', floorC2: '#3388AA' },
  night:     { bg0: '#000308', bg1: '#010510', floorC: '#0A1418', floorC2: '#0044AA' },
  shipwreck: { bg0: '#061210', bg1: '#0A1C18', floorC: '#1C3028', floorC2: '#885522' },
  volcanic:  { bg0: '#120802', bg1: '#1A0E04', floorC: '#2A1408', floorC2: '#FF4400' },
  arctic:    { bg0: '#040E1A', bg1: '#0A1A28', floorC: '#182838', floorC2: '#AADDFF' },
  boss:      { bg0: '#000508', bg1: '#000C14', floorC: '#080E14', floorC2: '#224466' },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function aabb(a, b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function getZoneIdx(x) { return Math.max(0, Math.min(NUM_ZONES-1, Math.floor(x/ZONE_W))); }
function lerp(a, b, t) { return a + (b-a) * Math.max(0, Math.min(1, t)); }
function lerpHex(h, v, b) {
  const t = Math.min(1, Math.max(0, h/100));
  const vh = parseInt(v.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const vr=(vh>>16)&0xff, vg=(vh>>8)&0xff, vb=vh&0xff;
  const br=(bh>>16)&0xff, bg=(bh>>8)&0xff, bb=bh&0xff;
  return `rgb(${Math.round(br+(vr-br)*t)},${Math.round(bg+(vg-bg)*t)},${Math.round(bb+(vb-bb)*t)})`;
}
function zoneColors(health) {
  const h = Math.max(0, Math.min(100, health));
  return {
    c1: lerpHex(h,'#FF6B35','#C0B8AC'), c2: lerpHex(h,'#FF9B21','#CEC8C0'),
    c3: lerpHex(h,'#FFE066','#DAD4CC'), algae: lerpHex(h,'#2DB64E','#607060'),
    floor: lerpHex(h,'#1A4A2A','#2C2E2A'),
  };
}
function makeParticles(x, y, color, count=8) {
  return Array.from({length:count}, () => ({
    x, y, vx:(Math.random()-0.5)*5, vy:(Math.random()-0.5)*5,
    color, size:3+Math.random()*5, alpha:1, life:1,
  }));
}
function makeBloom(x, y) {
  const cols = ['#FF6B35','#FFE066','#66BB6A','#00E8D8','#FF9B21','#4CAF50','#FFFFFF'];
  return Array.from({length:28}, (_,i) => ({
    x, y,
    vx: Math.cos(i/28*Math.PI*2)*(3+Math.random()*6),
    vy: Math.sin(i/28*Math.PI*2)*(3+Math.random()*6),
    color: cols[i%cols.length], size:5+Math.random()*8, alpha:1, life:1,
  }));
}

// ── GAME STATE FACTORY ────────────────────────────────────────────────────────
function createGame(guardian, outfit=0, levelIdx=0) {
  const cfg = getLevelConfig(levelIdx);
  const levelData = cfg.data;
  const LEVEL_W = (levelData.obstacles.length > 0 || levelData.collectibles.length > 0) ? levelData.width : 12000;

  return {
    guardian, outfit, levelIdx, levelConfig: cfg,
    phase: 'submarine',
    frame: 0, gameFrame: 0,
    score: 0, support: 5, pearls: 0, enemiesDefeated: 0,
    year: 2025,
    lives: MAX_LIVES,
    killChain: 0, killChainTimer: 0, killChainMultiplier: 1,
    audioEnabled: isAudioEnabled(),
    zones: Array.from({length: NUM_ZONES}, () => {
      const health = (cfg.data.startHealth || 70) + Math.random()*15;
      return { health: Math.min(100, health), restored: health >= 80, bloomTimer: 0 };
    }),
    player: {
      x: 100, y: 450, vx: 0, vy: 0, w: 24, h: 30, dir: 1,
      oxygen: 100, abilityReady: true, abilityCooldown: 0,
      abilityActive: false, abilityTimer: 0,
      hitTimer: 0, invincible: false, invincibleTimer: 0, dead: false,
    },
    camera: { x: 0 },
    levelData, levelW: LEVEL_W,
    obstacles: levelData.obstacles.map(o => ({...o})),
    collectibles: levelData.collectibles.map(c => ({...c, collected: false})),
    enemies: levelData.enemies.map(e => ({...e, dead:false, timer:0, active:false, stunTimer:0, bounceTimer:0})),
    powerups: levelData.powerups.map(p => ({...p})),
    bubbles: Array.from({length:28}, () => ({
      x: Math.random()*LEVEL_W, y: FLOOR_Y-Math.random()*(FLOOR_Y-CEIL_Y),
      vy:-(0.3+Math.random()*0.5), size:2+Math.random()*5,
    })),
    particles: [], scorePopups: [],
    climateEvent: null, climateNextAt: FRAMES_PER_YEAR,
    vignette: null,
    subX: BASE_W+200, subState:'enter', subTimer:0,
    ended: false, won: false, levelComplete: false,
    abilityEffect: null,
    keys: {}, prevKeys: {},
    tutorialTimer: 240,
    // Whale boss state
    whale: null, // set when boss level starts
    whalePhase: 'waiting', // waiting | chasing | swallowing
    whaleTimer: 0,
    // Whale stomach
    stomachLines: [], stomachTimer: 0, stomachDone: false,
  };
}

// ── SUBMARINE ENTRY ───────────────────────────────────────────────────────────
function updateSubmarine(gs) {
  gs.subTimer++;
  if (gs.subState==='enter') {
    gs.subX = lerp(BASE_W+200, 400, Math.min(1, gs.subTimer/90));
    if (gs.subTimer>=100) { gs.subState='open'; gs.subTimer=0; }
  } else if (gs.subState==='open') {
    if (gs.subTimer>=40) { gs.subState='exit'; gs.subTimer=0; }
  } else if (gs.subState==='exit') {
    gs.player.x = gs.subX + 30;
    gs.player.y = lerp(130, FLOOR_Y-gs.player.h, Math.min(1, gs.subTimer/50));
    if (gs.subTimer>=60) { gs.phase='playing'; gs.subState='done'; }
  }
}

// ── PLAYER PHYSICS ────────────────────────────────────────────────────────────
function updatePlayer(gs) {
  const {player:p, keys, obstacles, camera} = gs;
  if (p.dead || p.hitTimer>100) return;

  const km = getKeyMap();
  const left  = keys['ArrowLeft']  || keys[km.left];
  const right = keys['ArrowRight'] || keys[km.right];
  const up    = keys['ArrowUp']    || keys['Space'] || keys[km.up];

  if (left)  { p.vx -= H_ACCEL; p.dir=-1; }
  if (right) { p.vx += H_ACCEL; p.dir=1; }
  if (up) {
    p.vy -= SWIM_UP;
    // Swim bubble SFX every 22 frames
    if (gs.frame % 22 === 0) playBubble && playBubble();
  }

  // Outfit bonus: hazmat resists cyclone
  const cyclonePush = (gs.climateEvent?.type==='cyclone' && gs.outfit!==2) ? 0.22 : 0.12;
  if (gs.climateEvent?.type==='cyclone') p.vx -= cyclonePush;

  p.vy += GRAVITY;
  p.vx *= H_FRICTION;
  p.vy = Math.max(MAX_SWIM_UP, Math.min(MAX_FALL, p.vy));
  p.vx = Math.max(-MAX_H, Math.min(MAX_H, p.vx));

  // Move X
  p.x = Math.max(0, Math.min(gs.levelW-p.w, p.x+p.vx));
  for (const o of obstacles) {
    if (aabb(p,o)) {
      if (p.vx>0) { p.x=o.x-p.w; p.vx=0; }
      else if (p.vx<0) { p.x=o.x+o.w; p.vx=0; }
    }
  }

  // Move Y
  p.y += p.vy;
  if (p.y+p.h > FLOOR_Y) { p.y=FLOOR_Y-p.h; p.vy=0; }
  if (p.y < CEIL_Y) {
    p.y=CEIL_Y; p.vy=0;
    // Oxygen refill at surface
    const oxyRate = gs.outfit===1 ? 1.2 : 0.8; // wetsuit bonus
    if (p.oxygen<100) p.oxygen = Math.min(100, p.oxygen+oxyRate);
  }
  for (const o of obstacles) {
    if (aabb(p,o)) {
      if (p.vy>0) { p.y=o.y-p.h; p.vy=0; }
      else if (p.vy<0) { p.y=o.y+o.h; p.vy=0; }
    }
  }

  // Camera
  gs.camera.x = Math.max(0, Math.min(gs.levelW-BASE_W, p.x-BASE_W*0.35));

  // Ability (use mapped key)
  const abilityKey = getKeyMap().ability;
  if ((keys[abilityKey] || keys['KeyE']) && !(gs.prevKeys[abilityKey] || gs.prevKeys['KeyE']) && p.abilityReady) activateAbility(gs);

  // Sound toggle
  const soundKey = getKeyMap().sound;
  if ((keys[soundKey] || keys['KeyM']) && !(gs.prevKeys[soundKey] || gs.prevKeys['KeyM'])) gs.audioEnabled = toggleAudio();

  // Timers
  if (p.hitTimer>0) p.hitTimer--;
  if (p.invincibleTimer>0) { p.invincibleTimer--; if (p.invincibleTimer===0) p.invincible=false; }
  if (p.abilityActive) { p.abilityTimer--; if (p.abilityTimer<=0) p.abilityActive=false; }
  if (p.abilityCooldown>0) { p.abilityCooldown--; if (p.abilityCooldown===0) p.abilityReady=true; }

  // Oxygen drain (outfit 1 = wetsuit: more efficient)
  const drainRate = gs.outfit===1 ? 0.0030 : 0.0045;
  if (p.oxygen>0) p.oxygen -= drainRate;

  // Kill chain timer
  if (gs.killChainTimer>0) {
    gs.killChainTimer--;
    if (gs.killChainTimer===0) { gs.killChain=0; gs.killChainMultiplier=1; }
  }

  gs.prevKeys = {...keys};
}

// ── GUARDIAN ABILITY ──────────────────────────────────────────────────────────
function activateAbility(gs) {
  const {guardian, player:p, zones, enemies} = gs;
  p.abilityReady=false; p.abilityActive=true; p.abilityCooldown=ABILITY_COOLDOWN;
  if (guardian==='scientist') {
    p.abilityTimer=600;
    gs.abilityEffect = {type:'scan', x:p.x+p.w/2, y:p.y+p.h/2, timer:600, radius:0};
    gs.collectibles.forEach(c => { if(!c.collected) c.revealed=true; });
  } else if (guardian==='ranger') {
    p.abilityTimer=900;
    gs.abilityEffect = {type:'resilience', timer:900};
  } else if (guardian==='fisher') {
    p.abilityTimer=480;
    enemies.forEach(e => { if(!e.dead && e.active) e.stunTimer=480; });
    gs.abilityEffect = {type:'balance', x:p.x+p.w/2, y:p.y+p.h/2, timer:60, radius:0};
    gs.particles.push(...makeParticles(p.x, p.y, '#F8B800', 16));
  } else if (guardian==='advocate') {
    p.abilityTimer=60;
    gs.support = Math.min(100, gs.support+15);
    gs.score += 500;
    gs.abilityEffect = {type:'campaign', timer:120};
    gs.climateEvent = null;
    gs.particles.push(...makeParticles(p.x, p.y, '#CC44FF', 20));
    gs.scorePopups.push({x:p.x, y:p.y-30, text:'+15% SUPPORT!', t:120, color:'#CC44FF'});
    playCampaign && playCampaign();
  }
}

// ── ENEMY AI ──────────────────────────────────────────────────────────────────
function updateEnemies(gs) {
  const {enemies, player:p, camera} = gs;
  const sl=camera.x-100, sr=camera.x+BASE_W+100;

  for (const e of enemies) {
    if (e.dead) continue;
    if (!e.active && e.x>sl && e.x<sr) e.active=true;
    if (!e.active) continue;
    e.timer++;
    if (e.stunTimer>0) { e.stunTimer--; continue; }

    if (e.type==='shark') {
      if (!e.vx) e.vx=-1.8;
      e.x+=e.vx;
      if (e.x<sl-200||e.x>sr+200) e.x=e.vx<0?sr+100:sl-100;
    } else if (e.type==='dolphin') {
      e.y+=Math.sin(e.timer*0.05)*1.5;
      e.y=Math.max(CEIL_Y, Math.min(FLOOR_Y-40, e.y));
      e.x+=0.3;
      if (e.x>gs.levelW) e.x=camera.x+BASE_W-100;
    } else if (e.type==='jellyfish') {
      e.y+=Math.sin(e.timer*0.04)*1.2;
      e.y=Math.max(CEIL_Y, Math.min(FLOOR_Y-40, e.y));
    } else if (e.type==='blooper') {
      const dx=p.x-e.x, dy=p.y-e.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if (dist<300&&dist>1) {
        const spd=e.timer%80<40?1.2:0.2;
        e.x+=dx/dist*spd; e.y+=dy/dist*spd;
      }
      e.y=Math.max(CEIL_Y, Math.min(FLOOR_Y-40, e.y));
    } else if (e.type==='crown') {
      const dx=p.x-e.x;
      if (Math.abs(dx)>2) e.x+=dx>0?0.5:-0.5;
      e.y=Math.max(CEIL_Y, Math.min(FLOOR_Y-35, e.y));
      if (e.timer%60===0) gs.zones[getZoneIdx(e.x)].health=Math.max(0, gs.zones[getZoneIdx(e.x)].health-1.5);
    } else if (e.type==='crab') {
      // Walk on floor, reverse at level edges or obstacles
      e.y = FLOOR_Y - 22;
      e.x += e.vx;
      if (e.x<sl-100 || e.x>sr+100) e.vx*=-1;
      for (const o of gs.obstacles) {
        if (e.x<o.x+o.w && e.x+20>o.x && e.y<o.y+o.h && e.y+22>o.y) e.vx*=-1;
      }
    } else if (e.type==='seahorse') {
      e.y+=e.vy || -0.4;
      e.y=Math.max(CEIL_Y, Math.min(FLOOR_Y-40, e.y));
      if (e.y<=CEIL_Y||e.y>=FLOOR_Y-40) e.vy=(e.vy||0)*-1;
      e.x+=Math.sin(e.timer*0.03)*0.5;
    } else if (e.type==='net') {
      // Fishing net: stationary, gentle vertical drift with buoy
      e.y = (e.baseY||CEIL_Y+60) + Math.sin(e.timer*0.03)*6;
    }
  }
}

// ── WHALE BOSS ────────────────────────────────────────────────────────────────
function updateWhaleBoss(gs) {
  if (!gs.levelConfig.data.isBossLevel) return;
  gs.whaleTimer++;

  // Spawn whale after 8 seconds
  if (!gs.whale && gs.whaleTimer===480) {
    gs.whale = { x: gs.levelW+200, y: CEIL_Y+80, speed: 0.4, mouthOpen: false, mouthTimer: 0 };
    playWarning && playWarning();
    gs.scorePopups.push({x:BASE_W/2, y:250, text:'THE WHALE APPROACHES!', t:180, color:'#FF4400'});
  }

  if (!gs.whale) return;
  const w = gs.whale;

  // Move whale left
  w.speed = Math.min(1.8, w.speed + 0.0003);
  w.x -= w.speed;
  w.y += Math.sin(gs.whaleTimer*0.02)*0.8;
  w.y = Math.max(CEIL_Y+30, Math.min(FLOOR_Y-130, w.y));

  // Mouth open cycle
  w.mouthTimer++;
  if (w.mouthTimer%200<60) {
    w.mouthOpen=true;
  } else {
    w.mouthOpen=false;
  }

  // Swallow trigger: whale mouth overlaps player
  const px=gs.player.x-gs.camera.x, py=gs.player.y;
  const wScreenX = w.x-gs.camera.x;
  const mouthBox = { x: wScreenX+200, y: w.y+45, w: 70, h: 35 };
  const playerBox = { x: px, y: py, w: gs.player.w, h: gs.player.h };

  // Auto-swallow after 50 seconds (boss scripted ending)
  if (w.mouthOpen && aabb(playerBox, mouthBox)) {
    gs.whalePhase='swallowing';
  }
  if (gs.whaleTimer>=3000 && gs.whalePhase!=='swallowing') {
    gs.whalePhase='swallowing';
  }

  if (gs.whalePhase==='swallowing') {
    // Screen fade then whale stomach
    if (gs.whaleTimer<3060 || !gs._swallowStarted) {
      gs._swallowStarted=true;
      gs._swallowTimer = (gs._swallowTimer||0)+1;
      if (gs._swallowTimer>90) gs.phase='whalestomach';
    }
  }
}

// ── WHALE STOMACH ─────────────────────────────────────────────────────────────
const STOMACH_LINES = [
  '...You are inside the ancient whale.',
  'Around you: fragments of the reef.',
  'Coral. Fish bones. A child\'s sandal.',
  '',
  'The whale has carried these memories for years.',
  '',
  'It was not hunting you.',
  '',
  'It was trying to show you something.',
  '',
  'The reef lives inside every creature.',
  '',
  '*** MISSION COMPLETE ***',
  '',
  'Now protect it in the real world.',
];

function updateWhaleStomach(gs) {
  gs.stomachTimer++;
  const lineIdx = Math.floor(gs.stomachTimer/90);
  gs.stomachLines = STOMACH_LINES.slice(0, Math.min(lineIdx, STOMACH_LINES.length));
  if (lineIdx >= STOMACH_LINES.length + 5 && !gs.stomachDone) {
    gs.stomachDone = true;
    gs.ended = true;
    gs.won = true;
    gs.levelComplete = true;
  }
}

// ── ZONE HEALTH ───────────────────────────────────────────────────────────────
function updateZones(gs) {
  if (gs.frame%60!==0) return;
  const {zones, player:p, guardian, climateEvent} = gs;
  const pz = getZoneIdx(p.x);
  for (let i=0; i<NUM_ZONES; i++) {
    const z = zones[i];
    let deg = 0.3;
    if (climateEvent?.type==='heatwave') deg += (gs.outfit===2 ? 0.5 : 1.0); // hazmat reduces heat damage
    if (climateEvent?.type==='cyclone')  deg += 0.6;
    if (guardian==='ranger' && p.abilityActive && i===pz) deg=0;
    z.health = Math.max(0, z.health-deg);
    z.bloomTimer = Math.max(0, z.bloomTimer-1);

    // Player restoration
    if (i===pz && !p.dead) {
      let rate = 0.4;
      if (guardian==='ranger' && p.abilityActive) rate=1.2;
      if (guardian==='scientist' && p.abilityActive) rate=0.8;
      const prevHealth = z.health;
      z.health = Math.min(100, z.health+rate);
      // Vignette trigger: zone crosses from <60 to >65
      if (prevHealth<60 && z.health>=65 && !z.vignetteShown) {
        z.vignetteShown=true;
        const mems = VIGNETTE_MEMORIES[guardian];
        const text = mems[Math.floor(Math.random()*mems.length)];
        gs.vignette = { text, timer: 240 };
      }
    }

    if (z.health>=80 && !z.restored) {
      z.restored=true; z.bloomTimer=180;
      const cx=i*ZONE_W+ZONE_W/2;
      const cy=FLOOR_Y-80;
      gs.particles.push(...makeBloom(cx, cy));
      gs.score += 1000;
      gs.support = Math.min(100, gs.support+5);
      gs.scorePopups.push({x:p.x, y:p.y-40, text:'BLOOM! +1000', t:120, color:'#00E8D8'});
      playBloom && playBloom();
    }
  }
}

// ── CLIMATE EVENTS ────────────────────────────────────────────────────────────
function updateClimate(gs) {
  if (!gs.climateEvent) {
    if (gs.gameFrame>=gs.climateNextAt) {
      const type=['heatwave','cyclone','heatwave'][Math.floor(Math.random()*3)];
      const late=gs.year>=2028;
      gs.climateEvent={type, timer:late?900:600, intensity:late?1.5:1.0};
      const next=late?1200+Math.floor(Math.random()*600):2400+Math.floor(Math.random()*1200);
      gs.climateNextAt=gs.gameFrame+next;
      playWarning && playWarning();
      if (type==='heatwave') playHeatwave && playHeatwave();
    }
  } else {
    gs.climateEvent.timer--;
    if (gs.climateEvent.timer<=0) gs.climateEvent=null;
  }
}

// ── COLLISIONS ────────────────────────────────────────────────────────────────
function checkCollisions(gs) {
  const {player:p, enemies, collectibles, powerups, zones} = gs;
  if (p.dead || p.hitTimer>0) return;

  // Collectibles
  for (const c of collectibles) {
    if (c.collected) continue;
    if (aabb(p, {x:c.x,y:c.y,w:21,h:21})) {
      c.collected=true;
      const mult = gs.killChainMultiplier;
      gs.score += Math.floor(200*mult);
      gs.pearls++;
      gs.support = Math.min(100, gs.support+0.5);
      zones[getZoneIdx(c.x)].health = Math.min(100, zones[getZoneIdx(c.x)].health+1.5);
      gs.particles.push(...makeParticles(c.x, c.y, '#E8E0D4', 6));
      gs.scorePopups.push({x:c.x, y:c.y-20, text:mult>1?`+${Math.floor(200*mult)} x${mult.toFixed(1)}!`:'+200', t:80, color:'#E8E0D4'});
      playPearl && playPearl();
    }
  }

  // Power-ups
  for (const pu of powerups) {
    if (!pu.active) continue;
    if (aabb(p, {x:pu.x,y:pu.y,w:30,h:33})) {
      pu.active=false;
      if (pu.type==='oxygen') {
        p.oxygen=100;
        gs.scorePopups.push({x:pu.x, y:pu.y-20, text:'O2 REFILL!', t:100, color:'#44AAFF'});
        playPowerUp && playPowerUp();
      } else if (pu.type==='guardian_power') {
        p.invincible=true; p.invincibleTimer=600;
        p.abilityReady=true; p.abilityCooldown=0;
        gs.score+=500;
        gs.particles.push(...makeParticles(pu.x, pu.y, GUARDIAN_COLORS[gs.guardian], 14));
        gs.scorePopups.push({x:pu.x, y:pu.y-20, text:'GUARDIAN POWER!', t:100, color:GUARDIAN_COLORS[gs.guardian]});
        playPowerUp && playPowerUp();
      }
    }
  }

  // Enemies
  for (const e of enemies) {
    if (e.dead) continue;
    const ew=e.type==='shark'?60:e.type==='dolphin'?48:e.type==='crab'?30:e.type==='net'?50:30;
    const eh=e.type==='shark'?27:e.type==='dolphin'?30:e.type==='crab'?22:e.type==='net'?68:30;
    if (!aabb(p,{x:e.x,y:e.y,w:ew,h:eh})) continue;

    if (p.invincible) { killEnemy(gs,e); continue; }
    if (e.type==='dolphin') {
      p.vy=-8; gs.scorePopups.push({x:e.x,y:e.y-20,text:'BOUNCE!',t:60,color:'#5599CC'});
      playDolphinBounce && playDolphinBounce(); continue;
    }
    if (e.stunTimer>0 && gs.guardian==='fisher') { killEnemy(gs,e); continue; }

    // Net: entangle player — slow them down, apply damage, can be stomped
    if (e.type==='net') {
      if (p.vy>1 && p.y+p.h<e.y+eh/2+10) {
        killEnemy(gs,e); p.vy=-4;
        gs.scorePopups.push({x:e.x,y:e.y-20,text:'NET CLEARED! +200',t:80,color:'#66DDAA'});
        gs.score+=200;
      } else if (!e._entangleTimer || e._entangleTimer<=0) {
        e._entangleTimer=40;
        p.vx*=0.3; p.vy*=0.3;
        p.hitTimer=60; p.oxygen=Math.max(0, p.oxygen-8);
        gs.particles.push(...makeParticles(p.x, p.y,'#AA8822',6));
        gs.scorePopups.push({x:e.x,y:e.y-20,text:'ENTANGLED!',t:60,color:'#AA8822'});
        playNetEntangle && playNetEntangle();
      } else {
        e._entangleTimer--;
      }
      continue;
    }

    // Stomp check: player falling onto enemy from above
    if (p.vy>1 && p.y+p.h<e.y+eh/2+10 && e.type!=='shark' && e.type!=='crown') {
      killEnemy(gs,e); p.vy=-4; continue;
    }

    if (e.type==='shark') {
      p.vx=p.x<e.x+ew/2?-5:5; p.vy=-3; p.hitTimer=90;
      zones[getZoneIdx(e.x)].health=Math.max(0,zones[getZoneIdx(e.x)].health-3);
      gs.scorePopups.push({x:e.x,y:e.y-20,text:'SHARK!',t:60,color:'#FF4444'});
      gs.particles.push(...makeParticles(p.x, p.y,'#FF4444',8));
      playHit && playHit();
    } else if (e.type==='seahorse') {
      // Seahorse gives points when collected (swim into it)
      killEnemy(gs,e);
      gs.score+=500; gs.support=Math.min(100,gs.support+3);
      gs.scorePopups.push({x:e.x,y:e.y-20,text:'SEAHORSE! +500',t:100,color:'#F8A800'});
    } else {
      p.hitTimer=gs.outfit===2?60:90; // armor reduces hitTimer
      p.oxygen=Math.max(0, p.oxygen-10);
      gs.particles.push(...makeParticles(p.x, p.y,'#FF6600',8));
      playHit && playHit();
      // Death: lose a life
      if (p.hitTimer>=90 && p.oxygen<=0) {
        gs.lives--;
        if (gs.lives<=0) { gs.ended=true; gs.won=false; }
        else { p.x=100; p.y=400; p.vx=0; p.vy=0; gs.camera.x=0; p.oxygen=100; p.hitTimer=0; }
        playDeath && playDeath();
      }
    }
  }

  // Level complete: reach exit
  const exitBox = {x:gs.levelData.exitX, y:gs.levelData.exitY-30, w:60, h:80};
  if (aabb(p, exitBox) && !gs.levelComplete) {
    gs.levelComplete=true;
    gs.ended=true; gs.won=true;
    gs.score += 2000;
    gs.particles.push(...makeBloom(p.x, p.y));
    playLevelClear && playLevelClear();
  }
}

function killEnemy(gs, e) {
  e.dead=true;
  gs.enemiesDefeated++;
  gs.killChain++;
  gs.killChainTimer=KILL_CHAIN_WINDOW;
  gs.killChainMultiplier=Math.min(4, 1+gs.killChain*0.25);
  const pts=Math.floor(300*gs.killChainMultiplier);
  gs.score+=pts;
  gs.support=Math.min(100, gs.support+2);
  zones_boost(gs, e.x, 5);
  gs.particles.push(...makeParticles(e.x, e.y,'#FF9900',10));
  const chainTxt=gs.killChain>1?` x${gs.killChainMultiplier.toFixed(1)}!`:'';
  gs.scorePopups.push({x:e.x, y:e.y-20, text:`+${pts}${chainTxt}`, t:80, color:'#F8B800'});
}
function zones_boost(gs, x, amount) {
  const zi=getZoneIdx(x);
  gs.zones[zi].health=Math.min(100, gs.zones[zi].health+amount);
}

// ── MAIN UPDATE ───────────────────────────────────────────────────────────────
function updateGame(gs) {
  gs.frame++;
  if (gs.ended) return;

  if (gs.phase==='submarine') { updateSubmarine(gs); return; }

  if (gs.phase==='whalestomach') { updateWhaleStomach(gs); return; }

  if (gs.phase!=='playing') return;
  gs.gameFrame++;
  const ny=2025+Math.floor(gs.gameFrame/FRAMES_PER_YEAR);
  if (ny!==gs.year) gs.year=ny;

  updatePlayer(gs);
  updateEnemies(gs);
  updateWhaleBoss(gs);
  if (gs.frame%60===0) updateZones(gs);
  updateClimate(gs);
  checkCollisions(gs);

  // Bubbles
  for (const b of gs.bubbles) {
    b.y+=b.vy;
    if (b.y<CEIL_Y) { b.y=FLOOR_Y; b.x=gs.camera.x+Math.random()*BASE_W; }
  }

  // Particles
  for (const pt of gs.particles) {
    pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=0.05;
    pt.life-=0.02; pt.alpha=pt.life; pt.vx*=0.96;
  }
  gs.particles=gs.particles.filter(p=>p.life>0);
  for (const sp of gs.scorePopups) { sp.y-=0.8; sp.t--; }
  gs.scorePopups=gs.scorePopups.filter(s=>s.t>0);

  if (gs.abilityEffect) {
    gs.abilityEffect.timer--;
    if (gs.abilityEffect.type==='scan') gs.abilityEffect.radius=Math.min(350, gs.abilityEffect.radius+8);
    if (gs.abilityEffect.timer<=0) gs.abilityEffect=null;
  }

  if (gs.gameFrame%90===0) updateAmbience && updateAmbience(gs.zones.reduce((a,z)=>a+z.health,0)/NUM_ZONES);
  if (gs.tutorialTimer>0) gs.tutorialTimer--;
  if (gs.vignette) { gs.vignette.timer--; if (gs.vignette.timer<=0) gs.vignette=null; }

  // Year-based win/loss check (non-boss levels)
  if (gs.year>=2030 && !gs.ended && !gs.levelConfig.data.isBossLevel) {
    const prot=gs.zones.filter(z=>z.health>PROTECTED_THRESHOLD).length;
    gs.won=prot>=WIN_ZONES; gs.ended=true;
  }
}

// ── ZONE SECTION MAPPING ──────────────────────────────────────────────────────
// Maps (theme, zone index, total zones) -> section name for immersive environments
function getZoneSection(theme, zi, nz) {
  switch (theme) {
    case 'shipwreck':
      if (zi <= 1) return 'wreck_approach';
      if (zi === 2) return 'wreck_outside';
      if (zi === 3) return 'wreck_entrance';
      if (zi <= 6) return 'wreck_interior';
      return 'wreck_hold';
    case 'volcanic':
      if (zi <= 1) return 'volcanic_open';
      if (zi <= 3) return 'volcanic_approach';
      if (zi === 4) return 'volcanic_entrance';
      if (zi <= 7) return 'volcanic_tube';
      return 'volcanic_chamber';
    case 'arctic':
      if (zi <= 2) return 'arctic_surface';
      if (zi <= 5) return 'arctic_cave';
      if (zi <= 8) return 'arctic_glacier';
      return 'arctic_spring';
    case 'deep':
      if (zi <= 2) return 'deep_twilight';
      if (zi <= 5) return 'deep_midnight';
      return 'deep_trench';
    case 'night':
      if (zi <= 3) return 'night_moonlit';
      return 'night_biolum';
    default: return null;
  }
}

// ── DRAW BACKGROUND ───────────────────────────────────────────────────────────
function drawBackground(ctx, gs) {
  const theme = gs.levelConfig?.theme || 'reef';
  const tc = LEVEL_THEME_COLORS[theme] || LEVEL_THEME_COLORS.reef;
  const grad = ctx.createLinearGradient(0, 0, 0, BASE_H);
  grad.addColorStop(0, tc.bg0);
  grad.addColorStop(1, tc.bg1);
  ctx.fillStyle=grad; ctx.fillRect(0,0,BASE_W,BASE_H);

  // Volcanic: lava glow from bottom
  if (theme==='volcanic') {
    ctx.save(); ctx.globalAlpha=0.18;
    const vg=ctx.createLinearGradient(0,FLOOR_Y,0,BASE_H);
    vg.addColorStop(0,'#FF4400'); vg.addColorStop(1,'#FF8800');
    ctx.fillStyle=vg; ctx.fillRect(0,FLOOR_Y,BASE_W,BASE_H-FLOOR_Y);
    ctx.restore();
  }

  // Arctic: ice shimmer
  if (theme==='arctic') {
    ctx.save(); ctx.globalAlpha=0.06;
    for (let i=0;i<5;i++) {
      const ix=(i*240+gs.frame*0.2)%(BASE_W+200)-100;
      ctx.fillStyle='#AADDFF'; ctx.fillRect(ix,HUD_TOP,80,BASE_H-HUD_TOP);
    }
    ctx.restore();
  }

  // God rays (health/theme dependent)
  const avgH=gs.zones.reduce((a,z)=>a+z.health,0)/NUM_ZONES;
  const rayAlpha=theme==='night'?0.005:theme==='volcanic'?0.02:(avgH>50?0.04:0.015);
  ctx.save(); ctx.globalAlpha=rayAlpha;
  for (let i=0;i<5;i++) {
    const rx=((i*280+gs.frame*0.3)%(BASE_W+200))-100;
    const rw=60+i*20;
    const rg=ctx.createLinearGradient(rx,HUD_TOP,rx+rw,BASE_H);
    rg.addColorStop(0,'rgba(0,200,180,0.8)'); rg.addColorStop(1,'rgba(0,100,140,0)');
    ctx.fillStyle=rg;
    ctx.beginPath(); ctx.moveTo(rx,HUD_TOP); ctx.lineTo(rx+rw,HUD_TOP);
    ctx.lineTo(rx+rw*2,BASE_H); ctx.lineTo(rx-rw*0.5,BASE_H); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Shipwreck: debris in background
  if (theme==='shipwreck') {
    ctx.save(); ctx.globalAlpha=0.3;
    ctx.fillStyle='#334433';
    [200,500,900,1100].forEach((sx,i) => {
      const sy=200+i*50;
      ctx.fillRect(sx-gs.camera.x*0.3%BASE_W, sy, 80+i*30, 12);
      ctx.fillRect(sx-gs.camera.x*0.3%BASE_W+30, sy-40, 12, 50);
    });
    ctx.restore();
  }
}

// ── DRAW ZONE FLOORS ──────────────────────────────────────────────────────────
function drawZoneFloors(ctx, gs) {
  const camX=gs.camera.x;
  const theme=gs.levelConfig?.theme||'reef';
  const tc=LEVEL_THEME_COLORS[theme]||LEVEL_THEME_COLORS.reef;

  for (let zi=0;zi<NUM_ZONES;zi++) {
    const zx=zi*ZONE_W-camX;
    if (zx>BASE_W+50||zx+ZONE_W<-50) continue;
    const health=gs.zones[zi].health;
    const bloomT=gs.zones[zi].bloomTimer;

    // Theme floor
    let floorBase = tc.floorC;
    if (theme==='volcanic') floorBase=health>50?'#2A1408':'#1A0C04';
    if (theme==='arctic')   floorBase=health>50?'#182838':'#101C28';
    ctx.fillStyle=floorBase;
    ctx.fillRect(zx, FLOOR_Y, ZONE_W, BASE_H-FLOOR_Y);

    // Bloom glow
    if (bloomT>0) {
      ctx.save(); ctx.globalAlpha=(bloomT/180)*0.3;
      const bg=ctx.createRadialGradient(zx+ZONE_W/2,FLOOR_Y,0,zx+ZONE_W/2,FLOOR_Y,400);
      bg.addColorStop(0,'#00E8D8'); bg.addColorStop(1,'transparent');
      ctx.fillStyle=bg; ctx.fillRect(zx,FLOOR_Y-300,ZONE_W,300); ctx.restore();
    }

    if (theme==='reef'||theme==='deep'||theme==='night') {
      const cols=zoneColors(health);
      if (health>30) {
        const swCount=Math.floor(health/14);
        for (let si=0;si<swCount;si++) {
          const sx=zx+60+si*(ZONE_W/swCount);
          drawSeaweed(ctx,sx,FLOOR_Y,40+(si%3)*20,gs.frame,cols.algae);
        }
      }
      for (let ci=0;ci<6;ci++) {
        const cx=zx+80+ci*(ZONE_W/6);
        drawCoralFormation(ctx,cx,FLOOR_Y-20,cols.c1,cols.c2,ci%3,gs.frame);
      }
    } else if (theme==='volcanic') {
      // Lava cracks in floor
      ctx.save(); ctx.globalAlpha=0.6;
      ctx.fillStyle='#FF3300';
      for (let vi=0;vi<4;vi++) {
        const vx=zx+100+vi*280;
        ctx.fillRect(vx, FLOOR_Y+2, 40, 6);
        if (health<50) { ctx.globalAlpha=0.8; ctx.fillRect(vx, FLOOR_Y, 40, 12); }
      }
      ctx.restore();
    } else if (theme==='shipwreck') {
      // Rusty floor
      ctx.fillStyle='#3A2010';
      ctx.fillRect(zx, FLOOR_Y, ZONE_W, 20);
      ctx.fillStyle='#553020';
      for (let ri=0;ri<8;ri++) ctx.fillRect(zx+ri*150, FLOOR_Y, 80, 6);
    } else if (theme==='arctic') {
      // Ice formation
      ctx.save(); ctx.globalAlpha=0.7;
      ctx.fillStyle='#88CCEE';
      for (let ii=0;ii<5;ii++) {
        const ix=zx+60+ii*230;
        const ih=30+ii%3*20;
        ctx.fillRect(ix, FLOOR_Y-ih, 50, ih);
        ctx.fillStyle='#AADDFF'; ctx.fillRect(ix+5, FLOOR_Y-ih, 20, ih-8); ctx.fillStyle='#88CCEE';
      }
      ctx.restore();
    }

    // Ambient fish
    if (health>50 && theme!=='night') {
      const fCount=Math.min(4,Math.floor(health/25));
      for (let fi=0;fi<fCount;fi++) {
        const fx=zx+100+fi*(ZONE_W/fCount)+Math.sin(gs.frame*0.02+fi*1.5)*40;
        const fy=FLOOR_Y-60-fi*20;
        drawReefFish(ctx,fx,fy,zoneColors(health).algae,Math.sin(gs.frame*0.01+fi)>0,gs.frame+fi*10);
      }
    }

    // Bioluminescent sparkles in healthy zones
    if (health>70) {
      for (let bi=0;bi<4;bi++) {
        const bx=zx+150+bi*250+Math.sin(gs.frame*0.03+bi)*30;
        const by=FLOOR_Y-30-bi*15;
        const alpha=Math.abs(Math.sin(gs.frame*0.04+bi*1.2))*0.7;
        ctx.save(); ctx.globalAlpha=alpha;
        ctx.fillStyle=theme==='night'?'#88FF44':'#00FFE0';
        ctx.fillRect(bx,by,3,3); ctx.restore();
      }
    }
  }
}

// ── DRAW OBSTACLES ─────────────────────────────────────────────────────────────
function drawObstacles(ctx, gs) {
  const camX=gs.camera.x;
  const theme=gs.levelConfig?.theme||'reef';
  for (const o of gs.obstacles) {
    if (o.x-camX>BASE_W||o.x-camX+o.w<0) continue;
    const health=gs.zones[o.zone??getZoneIdx(o.x)]?.health??80;
    if (theme==='shipwreck') {
      ctx.fillStyle='#3A2010'; ctx.fillRect(o.x-camX,o.y,o.w,o.h);
      ctx.fillStyle='#553020'; ctx.fillRect(o.x-camX+2,o.y+2,o.w-4,6);
    } else if (theme==='arctic') {
      ctx.fillStyle='#2A4A60'; ctx.fillRect(o.x-camX,o.y,o.w,o.h);
      ctx.fillStyle='#88CCEE'; ctx.fillRect(o.x-camX+2,o.y,o.w-4,8);
    } else {
      drawCoralBlock(ctx, o.x-camX, o.y, o.w, o.h, health);
    }
  }
}

// ── DRAW ENEMIES ──────────────────────────────────────────────────────────────
function drawEnemies(ctx, gs) {
  const camX=gs.camera.x;
  for (const e of gs.enemies) {
    if (e.dead||!e.active) continue;
    const ex=e.x-camX, ey=e.y;
    if (ex>BASE_W+100||ex<-100) continue;
    const stunned=e.stunTimer>0;
    if (e.type==='shark')    drawShark(ctx,ex,ey,e.vx<0,gs.frame,stunned);
    else if (e.type==='dolphin')  drawDolphin(ctx,ex,ey,gs.frame);
    else if (e.type==='jellyfish') drawJellyfish(ctx,ex,ey,gs.frame);
    else if (e.type==='blooper')   drawBlooper(ctx,ex,ey,gs.frame);
    else if (e.type==='crown')     drawCrownOfThorns(ctx,ex,ey,gs.frame);
    else if (e.type==='crab')      drawCrab(ctx,ex,ey,e.vx>0?1:-1,gs.frame,stunned);
    else if (e.type==='seahorse')  drawSeahorse(ctx,ex,ey,gs.frame);
    else if (e.type==='net')       drawNet(ctx,ex,ey,gs.frame);
    if (stunned) {
      ctx.fillStyle='#FFFF00'; ctx.font=`9px 'Press Start 2P'`;
      ctx.fillText('*', ex+12, ey-4);
    }
  }
  // Whale boss
  if (gs.whale) {
    const wx=gs.whale.x-gs.camera.x;
    if (wx<BASE_W+400) drawWhale(ctx,wx,gs.whale.y,gs.frame,gs.whale.mouthOpen);
  }
}

// ── DRAW COLLECTIBLES ─────────────────────────────────────────────────────────
function drawCollectibles(ctx, gs) {
  const camX=gs.camera.x;
  for (const c of gs.collectibles) {
    if (c.collected) continue;
    const cx=c.x-camX;
    if (cx>BASE_W||cx<-30) continue;
    if (c.revealed&&gs.abilityEffect?.type==='scan') {
      ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#00E8D8';
      ctx.fillRect(cx-4,c.y-4,29,29); ctx.restore();
    }
    drawPearl(ctx,cx,c.y,c.frame+gs.frame);
  }
  for (const pu of gs.powerups) {
    if (!pu.active) continue;
    const px=pu.x-camX;
    if (px>BASE_W||px<-50) continue;
    if (pu.type==='oxygen') drawOxygenTank(ctx,px,pu.y,gs.frame);
    else drawGuardianPower(ctx,px,pu.y,gs.frame);
  }
  // Level exit portal
  const ex=gs.levelData.exitX-gs.camera.x;
  if (Math.abs(ex)<BASE_W) {
    const ey=gs.levelData.exitY;
    const pulseR=30+Math.sin(gs.frame*0.05)*8;
    ctx.save();
    ctx.globalAlpha=0.6;
    const pg=ctx.createRadialGradient(ex+30,ey,5,ex+30,ey,pulseR);
    pg.addColorStop(0,'#00E8D8'); pg.addColorStop(1,'transparent');
    ctx.fillStyle=pg; ctx.fillRect(ex,ey-pulseR,60,pulseR*2);
    ctx.restore();
    ctx.fillStyle='#00E8D8'; ctx.font=`6px 'Press Start 2P'`; ctx.fillText('EXIT',ex+10,ey-35);
  }
}

// ── DRAW PLAYER ───────────────────────────────────────────────────────────────
function drawPlayerSprite(ctx, gs) {
  if (gs.phase==='submarine') return;
  const {player:p, camera} = gs;
  const px=p.x-camera.x, py=p.y;
  const facingLeft=p.dir===-1;

  // Scan ring
  if (gs.abilityEffect?.type==='scan') {
    ctx.save(); ctx.globalAlpha=0.25; ctx.strokeStyle=GUARDIAN_COLORS[gs.guardian]; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(px+p.w/2,py+p.h/2,gs.abilityEffect.radius*0.6,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }
  // Ranger aura
  if (gs.abilityEffect?.type==='resilience') {
    ctx.save(); ctx.globalAlpha=0.18;
    const ag=ctx.createRadialGradient(px+p.w/2,py+p.h/2,0,px+p.w/2,py+p.h/2,60);
    ag.addColorStop(0,'#66AA44'); ag.addColorStop(1,'transparent');
    ctx.fillStyle=ag; ctx.fillRect(px-40,py-40,p.w+80,p.h+80); ctx.restore();
  }

  drawDiver(ctx, px, py, facingLeft, false, p.invincible||p.hitTimer>0, gs.frame);

  // Flashlight cone in dark zones / night theme
  const zoneHealth=gs.zones[getZoneIdx(p.x)]?.health??80;
  const needLight=gs.levelConfig?.theme==='night'||(zoneHealth<40);
  if (needLight) {
    ctx.save();
    const lightX=facingLeft?px:px+p.w, lightY=py+p.h/2;
    const lightDir=facingLeft?Math.PI:0;
    const cone=ctx.createRadialGradient(lightX,lightY,0,lightX,lightY,180);
    cone.addColorStop(0,'rgba(255,255,200,0.18)');
    cone.addColorStop(0.5,'rgba(255,255,200,0.06)');
    cone.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=cone;
    ctx.beginPath(); ctx.moveTo(lightX,lightY);
    ctx.arc(lightX,lightY,180,lightDir-0.55,lightDir+0.55); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// ── DRAW PARTICLES ────────────────────────────────────────────────────────────
function drawParticlesAll(ctx, gs) {
  for (const pt of gs.particles) drawParticle(ctx, pt);
  for (const sp of gs.scorePopups) {
    ctx.save(); ctx.globalAlpha=Math.min(1,sp.t/40);
    ctx.fillStyle=sp.color; ctx.font=`6px 'Press Start 2P'`;
    ctx.fillText(sp.text, sp.x-gs.camera.x, sp.y); ctx.restore();
  }
  for (const b of gs.bubbles) {
    const bx=b.x-gs.camera.x;
    if (bx>-10&&bx<BASE_W+10) drawBubble(ctx,bx,b.y,b.size);
  }
}

// ── DRAW NIGHT DARKNESS ───────────────────────────────────────────────────────
function drawNightDarkness(ctx, gs) {
  if (gs.levelConfig?.theme!=='night') return;
  const p=gs.player, px=p.x-gs.camera.x+p.w/2, py=p.y+p.h/2;
  ctx.save();
  ctx.fillStyle='rgba(0,0,5,0.91)';
  ctx.fillRect(0,HUD_TOP,BASE_W,FLOOR_Y-HUD_TOP);
  // Flashlight
  const ld=p.dir===1?0:Math.PI;
  const fc=ctx.createRadialGradient(px+(p.dir*15),py,5,px+(p.dir*15),py,190);
  fc.addColorStop(0,'rgba(255,255,220,0.22)');
  fc.addColorStop(0.5,'rgba(200,200,180,0.06)');
  fc.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=fc; ctx.fillRect(0,HUD_TOP,BASE_W,FLOOR_Y-HUD_TOP);
  // Bioluminescent enemy glow
  for (const e of gs.enemies) {
    if (e.dead||!e.active) continue;
    const ex2=e.x-gs.camera.x;
    if (ex2<-60||ex2>BASE_W+60) continue;
    const eg=ctx.createRadialGradient(ex2+15,e.y+15,0,ex2+15,e.y+15,45);
    eg.addColorStop(0,'rgba(0,255,180,0.14)'); eg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=eg; ctx.fillRect(ex2-30,e.y-30,90,90);
  }
  ctx.restore();
}

// ── DRAW CLIMATE EFFECT ───────────────────────────────────────────────────────
function drawClimateEffect(ctx, gs) {
  if (!gs.climateEvent) return;
  const {type,timer}=gs.climateEvent;
  const alpha=Math.min(0.25,timer/200*0.25);
  ctx.save();
  if (type==='heatwave') {
    const hwg=ctx.createRadialGradient(BASE_W/2,BASE_H,10,BASE_W/2,0,BASE_H);
    hwg.addColorStop(0,`rgba(255,80,0,${alpha})`); hwg.addColorStop(1,`rgba(255,40,0,${alpha*0.3})`);
    ctx.fillStyle=hwg; ctx.fillRect(0,0,BASE_W,BASE_H);
    ctx.globalAlpha=0.4; ctx.fillStyle='#FF6600';
    for (let i=0;i<8;i++) {
      const tx=(i*160+gs.frame*2)%BASE_W;
      const ty=FLOOR_Y-(gs.frame*1.5+i*40)%(FLOOR_Y-HUD_TOP);
      ctx.fillRect(tx,ty,3,3);
    }
  } else if (type==='cyclone') {
    ctx.fillStyle=`rgba(100,120,180,${alpha*0.8})`; ctx.fillRect(0,0,BASE_W,BASE_H);
    ctx.globalAlpha=0.5; ctx.fillStyle='#8899BB';
    for (let i=0;i<10;i++) {
      const dx=((i*120+gs.frame*4)%(BASE_W+200))-200;
      const dy=HUD_TOP+(i*60)%(BASE_H-HUD_TOP-60);
      ctx.fillRect(dx,dy,6,4);
    }
  }
  ctx.restore();
  if (timer>500) {
    ctx.save(); ctx.globalAlpha=Math.abs(Math.sin(gs.frame*0.1))*0.9+0.1;
    ctx.fillStyle=type==='heatwave'?'#FF6600':'#6688CC'; ctx.font=`9px 'Press Start 2P'`;
    ctx.fillText(type==='heatwave'?'THERMAL EVENT!':'CYCLONE!',BASE_W/2-70,HUD_TOP+30); ctx.restore();
  }
}

// ── DRAW WHALE STOMACH ────────────────────────────────────────────────────────
function drawWhaleStomach(ctx, gs) {
  drawWhaleStomachBg(ctx, BASE_W, BASE_H, gs.stomachTimer);
  // Floor platform
  ctx.fillStyle='#3A2A14';
  ctx.fillRect(BASE_W/2-120, FLOOR_Y-20, 240, 20);
  // Player
  const px=BASE_W/2-12, py=FLOOR_Y-50;
  drawDiver(ctx,px,py,false,false,false,gs.stomachTimer);
  // Text lines
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(BASE_W/2-320, 80, 640, 380);
  ctx.strokeStyle='rgba(200,160,80,0.3)'; ctx.lineWidth=2;
  ctx.strokeRect(BASE_W/2-320, 80, 640, 380);
  gs.stomachLines.forEach((line,i) => {
    const alpha=Math.min(1,(gs.stomachTimer-i*90)/60);
    if (alpha<=0) return;
    ctx.save(); ctx.globalAlpha=alpha;
    if (line.includes('MISSION COMPLETE') || line.includes('***')) {
      ctx.fillStyle='#FFEE00'; ctx.font=`10px 'Press Start 2P'`;
      ctx.fillText(line, BASE_W/2-ctx.measureText(line).width/2, 120+i*22);
    } else {
      ctx.fillStyle = line==='' ? 'transparent' : '#E8D0A0';
      ctx.font=`7px 'Press Start 2P'`;
      ctx.fillText(line, BASE_W/2-Math.min(280,ctx.measureText(line).width/2), 120+i*22);
    }
    ctx.restore();
  });
}

// ── DRAW SUBMARINE ENTRY ──────────────────────────────────────────────────────
function drawSubmarineEntry(ctx, gs) {
  if (gs.subState==='done') return;
  const subY=BASE_H/2-100;
  const hatchOpen=gs.subState==='open'||gs.subState==='exit';
  drawSubmarine(ctx,gs.subX-gs.camera.x,subY,hatchOpen,gs.frame);
  if (gs.subState==='exit') drawDiver(ctx,gs.subX-gs.camera.x+30,gs.player.y,false,false,false,gs.frame);
}

// ── DRAW HUD ──────────────────────────────────────────────────────────────────
function drawHUD(ctx, gs) {
  // Backgrounds
  ctx.fillStyle='rgba(1,8,20,0.90)'; ctx.fillRect(0,0,BASE_W,HUD_TOP);
  ctx.fillStyle='rgba(1,8,20,0.87)'; ctx.fillRect(0,BASE_H-HUD_BOT,BASE_W,HUD_BOT);
  ctx.fillStyle='#1A3344'; ctx.fillRect(0,HUD_TOP-2,BASE_W,2);
  ctx.fillStyle='#1A3344'; ctx.fillRect(0,BASE_H-HUD_BOT,BASE_W,2);

  // Level name
  const lName=gs.levelConfig?.name||'LEVEL';
  ctx.fillStyle='#00E8D8'; ctx.font=`6px 'Press Start 2P'`; ctx.fillText(lName,10,13);

  // Year
  ctx.fillStyle=gs.year>=2029?'#FF6600':'#FFFFFF';
  ctx.font=`14px 'Press Start 2P'`; ctx.fillText(`${gs.year}`,10,44);
  const yp=(gs.gameFrame%FRAMES_PER_YEAR)/FRAMES_PER_YEAR;
  ctx.fillStyle='#223344'; ctx.fillRect(80,33,120,8);
  ctx.fillStyle=gs.year>=2029?'#FF4400':'#00E8D8'; ctx.fillRect(80,33,120*yp,8);

  // Lives (diver icons)
  for (let li=0;li<gs.lives;li++) {
    ctx.fillStyle='#00E8D8';
    ctx.fillRect(80+li*16, 45, 10, 12);
    ctx.fillStyle='#F8D870';
    ctx.fillRect(82+li*16, 42, 6, 6);
  }

  // Zone minimap
  const mmX=BASE_W/2-(NUM_ZONES*24)/2;
  ctx.fillStyle='#334455'; ctx.font=`6px 'Press Start 2P'`; ctx.fillText('REEF ZONES',mmX,14);
  const cz=getZoneIdx(gs.player.x);
  for (let i=0;i<NUM_ZONES;i++) {
    const h=gs.zones[i].health;
    const col=h>70?'#00CC55':h>50?'#88CC00':h>30?'#FFAA00':'#FF2200';
    const mx=mmX+i*24;
    if (i===cz) { ctx.fillStyle='#FFFFFF'; ctx.fillRect(mx-1,16,22,16); }
    ctx.fillStyle='#001020'; ctx.fillRect(mx,17,20,14);
    ctx.fillStyle=col; ctx.fillRect(mx,17,Math.round(h/100*20),14);
    if (gs.zones[i].bloomTimer>0) {
      ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='#00E8D8';
      ctx.fillRect(mx,17,20,14); ctx.restore();
    }
  }
  const prot=gs.zones.filter(z=>z.health>PROTECTED_THRESHOLD).length;
  ctx.fillStyle=prot>=WIN_ZONES?'#00CC55':'#FF6600'; ctx.font=`6px 'Press Start 2P'`;
  ctx.fillText(`${prot}/${NUM_ZONES} PROTECTED`,mmX,47);

  // Score, pearls
  ctx.fillStyle='#FFFFFF'; ctx.font=`8px 'Press Start 2P'`;
  ctx.fillText(String(gs.score).padStart(8,'0'),BASE_W-210,22);
  ctx.fillStyle='#E8E0D4'; ctx.font=`6px 'Press Start 2P'`;
  ctx.fillText(`PEARLS:${gs.pearls}`,BASE_W-180,36);

  // Support meter
  ctx.fillStyle='#AABBCC'; ctx.font=`5px 'Press Start 2P'`; ctx.fillText(`SUPPORT ${Math.floor(gs.support)}%`,BASE_W-180,47);
  ctx.fillStyle='#223344'; ctx.fillRect(BASE_W-180,49,170,8);
  ctx.fillStyle=gs.support>70?'#00CC55':gs.support>40?'#44AAFF':'#FF6600';
  ctx.fillRect(BASE_W-180,49,170*(gs.support/100),8);

  // Kill chain
  if (gs.killChain>1) {
    ctx.save(); ctx.globalAlpha=Math.min(1,gs.killChainTimer/30);
    ctx.fillStyle='#FF9900'; ctx.font=`9px 'Press Start 2P'`;
    ctx.fillText(`x${gs.killChainMultiplier.toFixed(1)} CHAIN!`,BASE_W/2+150,44);
    ctx.restore();
  }

  // Bottom HUD
  const bY=BASE_H-HUD_BOT;
  const gc=GUARDIAN_COLORS[gs.guardian];
  ctx.fillStyle=gc; ctx.fillRect(10,bY+8,40,34);
  ctx.fillStyle='#020C1A'; ctx.font=`5px 'Press Start 2P'`;
  ctx.fillText(gs.guardian[0].toUpperCase(),24,bY+30);
  ctx.fillStyle=gc; ctx.font=`6px 'Press Start 2P'`;
  ctx.fillText(GUARDIAN_ABILITY[gs.guardian],58,bY+16);
  const cdf=gs.player.abilityReady?1:1-gs.player.abilityCooldown/ABILITY_COOLDOWN;
  ctx.fillStyle='#223344'; ctx.fillRect(58,bY+20,200,8);
  ctx.fillStyle=gs.player.abilityReady?gc:'#335566'; ctx.fillRect(58,bY+20,200*cdf,8);
  ctx.fillStyle=gs.player.abilityReady?gc:'#446677'; ctx.font=`5px 'Press Start 2P'`;
  ctx.fillText(gs.player.abilityReady?'[E] READY!':`[E] ${Math.ceil(gs.player.abilityCooldown/60)}s`,58,bY+38);

  // Oxygen
  const oX=BASE_W-250;
  ctx.fillStyle='#AABBCC'; ctx.font=`6px 'Press Start 2P'`; ctx.fillText('O2',oX,bY+16);
  ctx.fillStyle='#223344'; ctx.fillRect(oX+24,bY+8,200,10);
  const oC=gs.player.oxygen>60?'#44AAFF':gs.player.oxygen>25?'#FFAA00':'#FF3300';
  ctx.fillStyle=oC; ctx.fillRect(oX+24,bY+8,200*(gs.player.oxygen/100),10);
  ctx.fillStyle='#FFFFFF'; ctx.font=`5px 'Press Start 2P'`;
  ctx.fillText(`${Math.floor(gs.player.oxygen)}%`,oX+230,bY+18);

  // Tutorial tip
  if (gs.tutorialTimer>0) {
    const alpha=Math.min(1,gs.tutorialTimer/60);
    ctx.save(); ctx.globalAlpha=alpha*0.9;
    ctx.fillStyle='rgba(0,10,25,0.92)';
    ctx.fillRect(BASE_W/2-260,BASE_H/2-14,520,46);
    ctx.strokeStyle='#00E8D8'; ctx.lineWidth=1;
    ctx.strokeRect(BASE_W/2-260,BASE_H/2-14,520,46);
    ctx.fillStyle='#00E8D8'; ctx.font=`5px 'Press Start 2P'`;
    ctx.fillText('ARROWS/WASD: SWIM · SPACE: SWIM UP · E: ABILITY · P: PAUSE · M: SOUND',BASE_W/2-250,BASE_H/2+8);
    ctx.restore();
  }

  // Boss level swallow warning
  if (gs.levelConfig?.data.isBossLevel&&gs.whale) {
    const pct=Math.min(1,gs.whaleTimer/3000);
    ctx.fillStyle='#FF2200'; ctx.font=`7px 'Press Start 2P'`;
    ctx.fillText('WHALE APPROACHING!',BASE_W/2-120,HUD_TOP+20);
    ctx.fillStyle='#331100'; ctx.fillRect(BASE_W/2-120,HUD_TOP+26,240,6);
    ctx.fillStyle='#FF4400'; ctx.fillRect(BASE_W/2-120,HUD_TOP+26,240*pct,6);
  }
}

// ── VIGNETTE OVERLAY ──────────────────────────────────────────────────────────
function drawVignette(ctx, gs) {
  if (!gs.vignette) return;
  const alpha = Math.min(1, gs.vignette.timer<60 ? gs.vignette.timer/60 : 1);
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  // Sepia overlay
  ctx.fillStyle = 'rgba(30,20,10,0.82)';
  ctx.fillRect(0, 0, BASE_W, BASE_H);
  // Text box
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(200,160,80,0.4)'; ctx.lineWidth = 2;
  ctx.strokeRect(BASE_W/2-300, BASE_H/2-50, 600, 100);
  ctx.fillStyle = '#C8A060'; ctx.font=`6px 'Press Start 2P'`;
  ctx.fillText('TIDE OF MEMORIES', BASE_W/2-90, BASE_H/2-30);
  ctx.fillStyle = '#E8D0A0'; ctx.font=`7px 'Press Start 2P'`;
  const lines = gs.vignette.text.match(/.{1,50}/g) || [gs.vignette.text];
  lines.forEach((l, i) => ctx.fillText(l, BASE_W/2-Math.min(250,ctx.measureText(l).width/2), BASE_H/2-5+i*20));
  ctx.restore();
}

// ── SWALLOW FLASH ─────────────────────────────────────────────────────────────
function drawSwallowTransition(ctx, gs) {
  if (gs.whalePhase!=='swallowing'||!gs._swallowTimer) return;
  const t=gs._swallowTimer/90;
  ctx.save();
  ctx.globalAlpha=Math.min(1,t);
  ctx.fillStyle='#000010';
  ctx.fillRect(0,0,BASE_W,BASE_H);
  ctx.restore();
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
function renderFrame(canvas, gs) {
  const ctx = canvas.getContext('2d');
  const cw=canvas.width, ch=canvas.height;
  const scale=Math.min(cw/BASE_W, ch/BASE_H);
  const offX=(cw-BASE_W*scale)/2, offY=(ch-BASE_H*scale)/2;
  ctx.fillStyle='#010810'; ctx.fillRect(0,0,cw,ch);
  ctx.save();
  ctx.translate(offX,offY); ctx.scale(scale,scale);
  ctx.beginPath(); ctx.rect(0,0,BASE_W,BASE_H); ctx.clip();

  if (gs.phase==='whalestomach') {
    drawWhaleStomach(ctx, gs);
    drawHUD(ctx, gs);
    ctx.restore(); return;
  }

  drawBackground(ctx, gs);
  drawZoneFloors(ctx, gs);
  drawSectionEnvironment(ctx, gs);
  drawObstacles(ctx, gs);
  drawParticlesAll(ctx, gs);
  drawEnemies(ctx, gs);
  drawCollectibles(ctx, gs);
  drawPlayerSprite(ctx, gs);
  drawNightDarkness(ctx, gs);
  drawClimateEffect(ctx, gs);
  drawSubmarineEntry(ctx, gs);
  drawSwallowTransition(ctx, gs);
  drawVignette(ctx, gs);
  drawHUD(ctx, gs);
  ctx.restore();
}

// ── REACT COMPONENT ───────────────────────────────────────────────────────────
export default function GameCanvas({ guardian, outfit=0, levelIdx=0, paused, colorblind='none', onGameEnd }) {
  const canvasRef = useRef(null);
  const gsRef     = useRef(null);
  const animRef   = useRef(null);
  const pausedRef = useRef(paused);
  const endCalledRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const buildStats = useCallback((gs) => {
    const prot=gs.zones.filter(z=>z.health>PROTECTED_THRESHOLD).length;
    return {
      won: gs.won, levelComplete: gs.levelComplete, levelIdx,
      score: gs.score, zonesProtected: prot, totalZones: NUM_ZONES,
      pearls: gs.pearls, enemiesDefeated: gs.enemiesDefeated,
      support: Math.floor(gs.support), level: gs.year, lives: gs.lives,
    };
  }, [levelIdx]);

  // Keyboard
  useEffect(() => {
    const keys = {};
    const down = e => {
      keys[e.code]=true;
      if (gsRef.current) gsRef.current.keys=keys;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    };
    const up = e => { delete keys[e.code]; if (gsRef.current) gsRef.current.keys=keys; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    endCalledRef.current = false;
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    gsRef.current = createGame(guardian, outfit, levelIdx);

    const loop = () => {
      if (!gsRef.current) return;
      if (!pausedRef.current) updateGame(gsRef.current);
      renderFrame(canvas, gsRef.current);
      if (gsRef.current.ended && !endCalledRef.current) {
        endCalledRef.current=true;
        setTimeout(() => onGameEnd(buildStats(gsRef.current)), 1000);
        return;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [guardian, outfit, levelIdx, buildStats, onGameEnd]);

  // Mobile D-pad key injection
  const injectKey = useCallback((code, pressed) => {
    if (!gsRef.current) return;
    if (pressed) gsRef.current.keys[code]=true;
    else delete gsRef.current.keys[code];
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className={`reefside-canvas cb-${colorblind}`} data-testid="game-canvas" />
      <div className="dpad-container" data-testid="dpad-container">
        <div className="dpad-cross">
          <button className="dpad-btn dpad-up"
            onPointerDown={()=>injectKey('ArrowUp',true)} onPointerUp={()=>injectKey('ArrowUp',false)} onPointerLeave={()=>injectKey('ArrowUp',false)}>▲</button>
          <div className="dpad-mid-row">
            <button className="dpad-btn dpad-left"
              onPointerDown={()=>injectKey('ArrowLeft',true)} onPointerUp={()=>injectKey('ArrowLeft',false)} onPointerLeave={()=>injectKey('ArrowLeft',false)}>◀</button>
            <div className="dpad-center" />
            <button className="dpad-btn dpad-right"
              onPointerDown={()=>injectKey('ArrowRight',true)} onPointerUp={()=>injectKey('ArrowRight',false)} onPointerLeave={()=>injectKey('ArrowRight',false)}>▶</button>
          </div>
          <button className="dpad-btn dpad-down"
            onPointerDown={()=>injectKey('ArrowDown',true)} onPointerUp={()=>injectKey('ArrowDown',false)} onPointerLeave={()=>injectKey('ArrowDown',false)}>▼</button>
        </div>
        <div className="dpad-actions">
          <button className="dpad-btn dpad-action-a"
            onPointerDown={()=>injectKey('Space',true)} onPointerUp={()=>injectKey('Space',false)} onPointerLeave={()=>injectKey('Space',false)}>↑</button>
          <button className="dpad-btn dpad-action-b"
            onPointerDown={()=>injectKey('KeyE',true)} onPointerUp={()=>injectKey('KeyE',false)} onPointerLeave={()=>injectKey('KeyE',false)}>E</button>
        </div>
      </div>
    </>
  );
}
