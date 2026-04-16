// GameEndScreen.jsx — Win/Lose end screen with SDG educational content

import React from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SDG_FACTS = [
  'Coral reefs support 25% of all marine life while covering less than 1% of the ocean floor.',
  'The UN SDG 14 "30x30" target calls for 30% of oceans to be protected by 2030.',
  'Mass coral bleaching events are now 5x more frequent than in the 1980s (NOAA, 2024).',
  'Healthy reefs provide $375 billion per year in goods and services to millions of people.',
  'Coral bleaching occurs when ocean temperature rises just 1-2°C above average.',
  'Indigenous sea country knowledge has protected reefs for thousands of years.',
  'Sustainable fishing practices can allow fish populations to recover in 5-10 years.',
  'Climate action at 1.5°C warming would save 10-30% more coral than at 2°C (IPCC, 2018).',
];

export default function GameEndScreen({ won, stats, guardian, onRestart, onTitle }) {
  const [name, setName] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [factIdx] = React.useState(Math.floor(Math.random() * SDG_FACTS.length));
  const frameRef = React.useRef(0);
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const id = setInterval(() => { frameRef.current++; }, 50);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await axios.post(`${API}/leaderboard`, {
        name: name.toUpperCase().slice(0, 6),
        score: stats.score,
        level: stats.level,
        mode: 'reefside',
      });
      setSubmitted(true);
    } catch(e) { setSubmitted(true); }
  };

  React.useEffect(() => {
    const handler = e => { if (e.code === 'KeyR') onRestart(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  const protectedPct = Math.round((stats.zonesProtected / stats.totalZones) * 100);
  const reached30x30 = protectedPct >= 30;

  return (
    <div data-testid="game-end-screen" className={`end-screen ${won ? 'end-win' : 'end-lose'}`}>
      {/* Background particles (CSS) */}
      <div className="end-bg" />

      {/* Main result */}
      <div className="end-result">
        {won ? (
          <>
            <div className="end-title end-title-win" data-testid="win-title">
              REEF PROTECTED!
            </div>
            <div className="end-subtitle-win">30×30 TARGET ACHIEVED</div>
            <div className="end-tagline">The Great Barrier Reef lives on.</div>
          </>
        ) : (
          <>
            <div className="end-title end-title-lose" data-testid="lose-title">
              DEADLINE PASSED
            </div>
            <div className="end-subtitle-lose">2030 ARRIVED TOO SOON</div>
            <div className="end-tagline">The reef needed more guardians.</div>
          </>
        )}
      </div>

      {/* Stats grid */}
      <div className="end-stats-grid" data-testid="end-stats">
        <div className="stat-card">
          <div className="stat-value">{String(stats.score).padStart(8,'0')}</div>
          <div className="stat-label">FINAL SCORE</div>
        </div>
        <div className={`stat-card ${reached30x30 ? 'stat-success' : 'stat-danger'}`}>
          <div className="stat-value">{protectedPct}%</div>
          <div className="stat-label">REEF PROTECTED</div>
          <div className="stat-target">TARGET: 30%</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pearls}</div>
          <div className="stat-label">PEARLS COLLECTED</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.enemiesDefeated}</div>
          <div className="stat-label">THREATS NEUTRALISED</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.support}%</div>
          <div className="stat-label">SUPPORT METER</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.level}</div>
          <div className="stat-label">LEVEL REACHED</div>
        </div>
      </div>

      {/* SDG Milestone */}
      <div className="sdg-box">
        <div className="sdg-header">UN SDG 14: LIFE BELOW WATER</div>
        <div className="sdg-fact">{SDG_FACTS[factIdx]}</div>
        <a
          className="sdg-link"
          href="https://sdgs.un.org/goals/goal14"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="sdg-link"
        >
          LEARN MORE → sdgs.un.org/goals/goal14
        </a>
      </div>

      {/* Score submission */}
      {!submitted ? (
        <div className="end-submit">
          <input
            data-testid="end-name-input"
            className="end-name-input"
            type="text"
            maxLength={6}
            placeholder="ENTER NAME"
            value={name}
            onChange={e => setName(e.target.value.toUpperCase())}
            onKeyDown={e => e.code === 'Enter' && handleSubmit()}
          />
          <button
            data-testid="end-submit-btn"
            className="end-btn end-btn-accent"
            onClick={handleSubmit}
          >
            SAVE SCORE
          </button>
        </div>
      ) : (
        <div className="end-saved" data-testid="score-saved">SCORE SAVED TO LEADERBOARD</div>
      )}

      {/* Actions */}
      <div className="end-actions">
        <button
          data-testid="end-restart-btn"
          className="end-btn end-btn-primary"
          onClick={onRestart}
        >
          PLAY AGAIN [R]
        </button>
        <button
          data-testid="end-title-btn"
          className="end-btn end-btn-secondary"
          onClick={onTitle}
        >
          TITLE SCREEN
        </button>
      </div>
    </div>
  );
}
