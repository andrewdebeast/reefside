// UnderwaterGame.jsx — REEFSIDE Orchestrator
import React, { useState, useCallback } from 'react';
import SubmarineHub from './SubmarineHub';
import GameCanvas from './GameCanvas';
import GameEndScreen from './GameEndScreen';
import { getSettings } from '../utils/settings';

const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${4 + i * 5.2}%`,
  delay: `${i * 0.55}s`,
  dur: `${4 + (i % 5) * 0.8}s`,
  size: 7 + (i % 4) * 5,
}));

const GUARDIAN_LABELS = {
  scientist: 'MARINE SCIENTIST',
  ranger:    'INDIGENOUS RANGER',
  fisher:    'SUSTAINABLE FISHER',
  advocate:  'CLIMATE ADVOCATE',
};

// ── HOW TO PLAY MODAL ─────────────────────────────────────────────────────────
function HowToPlay({ onClose }) {
  React.useEffect(() => {
    const handler = e => { if (e.code === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div className="htp-overlay" onClick={onClose} data-testid="htp-overlay">
      <div className="htp-modal" onClick={e => e.stopPropagation()}>
        <div className="htp-title">HOW TO PLAY</div>

        <div className="htp-section">
          <div className="htp-section-title">CONTROLS</div>
          <div className="htp-row"><span className="htp-key">ARROWS / WASD</span><span className="htp-desc">Swim through the reef</span></div>
          <div className="htp-row"><span className="htp-key">SPACE / W</span><span className="htp-desc">Swim upward</span></div>
          <div className="htp-row"><span className="htp-key">E</span><span className="htp-desc">Activate your Guardian ability</span></div>
          <div className="htp-row"><span className="htp-key">P</span><span className="htp-desc">Pause game</span></div>
          <div className="htp-row"><span className="htp-key">M</span><span className="htp-desc">Toggle sound</span></div>
        </div>

        <div className="htp-section">
          <div className="htp-section-title">REEF ZONES</div>
          <div className="htp-desc" style={{lineHeight:'2'}}>
            The reef has 10 zones. Each zone has a health % shown at the top of the screen.<br/><br/>
            VIBRANT CORAL = Healthy zone &nbsp; | &nbsp; WHITE/GREY = Bleached zone<br/><br/>
            Defeat enemies in a zone to restore its health. Climate events damage all zones.
          </div>
        </div>

        <div className="htp-section">
          <div className="htp-section-title">GUARDIAN ABILITIES</div>
          <div className="htp-row"><span className="htp-key" style={{background:'#00E8D8'}}>SCIENTIST</span><span className="htp-desc">SCAN: Reveals hidden pearls + boosts restoration for 10s</span></div>
          <div className="htp-row"><span className="htp-key" style={{background:'#66AA44',color:'#fff'}}>RANGER</span><span className="htp-desc">RESILIENCE: Halts zone damage + triples restoration for 15s</span></div>
          <div className="htp-row"><span className="htp-key" style={{background:'#F8B800',color:'#020C1A'}}>FISHER</span><span className="htp-desc">BALANCE: Stuns all enemies on screen for 8s</span></div>
          <div className="htp-row"><span className="htp-key" style={{background:'#CC44FF',color:'#fff'}}>ADVOCATE</span><span className="htp-desc">CAMPAIGN: +15% Support Meter instantly</span></div>
        </div>

        <div className="htp-goal">
          MISSION: Protect 30% of the reef (3+ zones above 60% health) by the year 2030
        </div>

        <button className="htp-close" onClick={onClose} data-testid="htp-close-btn">
          GOT IT - BACK TO TITLE
        </button>
      </div>
    </div>
  );
}

// ── TITLE SCREEN ──────────────────────────────────────────────────────────────
function TitleScreen({ onStart, onHowTo }) {
  const [blink, setBlink] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 700);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const handler = e => {
      if (e.code === 'Space') { e.preventDefault(); onStart(); }
      if (e.code === 'KeyH') onHowTo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onStart, onHowTo]);

  return (
    <div data-testid="title-screen" className="title-screen">
      <div className="title-ocean-bg" />

      {BUBBLES.map((b, i) => (
        <div key={i} className="title-bubble" style={{
          left: b.left,
          animationDuration: b.dur,
          animationDelay: b.delay,
          width: `${b.size}px`,
          height: `${b.size}px`,
        }} />
      ))}

      <div className="rf-logo-area">
        <div className="rf-logo-badge">MARINE CONSERVATION SIMULATOR</div>
        <div className="rf-logo" data-testid="reefside-logo">REEFSIDE</div>
        <div className="rf-tagline">PROTECT THE GREAT BARRIER REEF · 30×30 BY 2030</div>
        <div className="rf-sdg-badge">UN SDG 14: LIFE BELOW WATER</div>
      </div>

      <div className="title-menu">
        <button
          data-testid="begin-mission-btn"
          className="title-btn title-btn-primary"
          onClick={onStart}
        >
          BEGIN MISSION
        </button>
        <button
          data-testid="how-to-play-btn"
          className="title-btn title-btn-secondary"
          onClick={onHowTo}
        >
          HOW TO PLAY
        </button>
      </div>

      {blink && (
        <div className="title-press-key" data-testid="press-space-text">
          PRESS SPACE TO START
        </div>
      )}

      <div className="title-controls">
        <span>ARROWS/WASD: SWIM</span>
        <span className="sep">|</span>
        <span>E: GUARDIAN ABILITY</span>
        <span className="sep">|</span>
        <span>P: PAUSE</span>
        <span className="sep">|</span>
        <span>H: HOW TO PLAY</span>
      </div>
    </div>
  );
}

// ── PAUSE OVERLAY ─────────────────────────────────────────────────────────────
function PauseOverlay({ guardian, onResume }) {
  return (
    <div data-testid="pause-screen" className="pause-overlay">
      <div className="pause-title">PAUSED</div>
      <div className="pause-controls">
        <div>GUARDIAN: {GUARDIAN_LABELS[guardian] || guardian.toUpperCase()}</div>
        <div style={{height:'8px'}} />
        <div>ARROWS / WASD - SWIM</div>
        <div>SPACE / W - SWIM UP</div>
        <div>E - GUARDIAN ABILITY</div>
        <div>P - PAUSE/RESUME</div>
        <div>M - TOGGLE SOUND</div>
        <div style={{height:'8px'}} />
        <div>DEFEAT ENEMIES → RESTORE ZONE HEALTH</div>
        <div>COLLECT PEARLS → +SCORE +SUPPORT</div>
        <div>PROTECT 3+ ZONES → WIN!</div>
      </div>
      <button
        data-testid="resume-btn"
        className="pause-resume-btn"
        onClick={onResume}
      >
        RESUME [P]
      </button>
    </div>
  );
}

// ── MAIN ORCHESTRATOR ─────────────────────────────────────────────���───────────
export default function UnderwaterGame() {
  const [screen, setScreen]         = useState('title');  // title | hub | game | end
  const [guardian, setGuardian]     = useState('scientist');
  const [outfit, setOutfit]         = useState(0);
  const [levelIdx, setLevelIdx]     = useState(0);
  const [gameStats, setGameStats]   = useState(null);
  const [showHowTo, setShowHowTo]   = useState(false);
  const [paused, setPaused]         = useState(false);
  const [gameKey, setGameKey]       = useState(0);
  const [colorblind, setColorblind] = useState(() => getSettings().colorblind);

  const handleSettingsChange = useCallback((updated) => {
    setColorblind(updated.colorblind || 'none');
  }, []);

  React.useEffect(() => {
    if (screen !== 'game') return;
    const handler = e => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen]);

  const handleGameEnd = (stats) => {
    setGameStats(stats);
    setScreen('end');
    setPaused(false);
  };

  const handleRestart = () => {
    setGameKey(k => k + 1);
    setScreen('hub');
    setPaused(false);
  };

  const handleHubStart = ({ guardian: g, outfit: o, level: l }) => {
    setGuardian(g);
    setOutfit(o);
    setLevelIdx(l);
    setGameKey(k => k + 1);
    setScreen('game');
    setPaused(false);
  };

  return (
    <div className="game-wrapper">
      {/* TITLE */}
      {screen === 'title' && (
        <>
          <TitleScreen
            onStart={() => setScreen('hub')}
            onHowTo={() => setShowHowTo(true)}
          />
          {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        </>
      )}

      {/* SUBMARINE HUB */}
      {screen === 'hub' && (
        <SubmarineHub
          guardian={guardian}
          outfit={outfit}
          level={levelIdx}
          onStartGame={handleHubStart}
          onSettingsChange={handleSettingsChange}
        />
      )}

      {/* GAME */}
      {screen === 'game' && (
        <>
          <GameCanvas
            key={gameKey}
            guardian={guardian}
            outfit={outfit}
            levelIdx={levelIdx}
            paused={paused}
            colorblind={colorblind}
            onGameEnd={handleGameEnd}
          />
          <div className="crt-overlay" />
          {paused && (
            <PauseOverlay guardian={guardian} onResume={() => setPaused(false)} />
          )}
        </>
      )}

      {/* END SCREEN */}
      {screen === 'end' && gameStats && (
        <GameEndScreen
          won={gameStats.won}
          stats={gameStats}
          guardian={guardian}
          onRestart={handleRestart}
          onTitle={() => setScreen('title')}
        />
      )}
    </div>
  );
}
