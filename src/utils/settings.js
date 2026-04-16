// settings.js — Game settings with localStorage persistence

const STORAGE_KEY = 'reefside_settings';

const DEFAULTS = {
  keyMap: {
    left:    'KeyA',
    right:   'KeyD',
    up:      'KeyW',
    ability: 'KeyE',
    pause:   'KeyP',
    sound:   'KeyM',
  },
  colorblind: 'none',  // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
  soundEnabled: false,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, keyMap: { ...DEFAULTS.keyMap } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      keyMap: { ...DEFAULTS.keyMap, ...(parsed.keyMap || {}) },
    };
  } catch {
    return { ...DEFAULTS, keyMap: { ...DEFAULTS.keyMap } };
  }
}

function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

let _cache = null;

export function getSettings() {
  if (!_cache) _cache = load();
  return _cache;
}

export function setSettings(partial) {
  _cache = { ...getSettings(), ...partial };
  if (partial.keyMap) _cache.keyMap = { ...getSettings().keyMap, ...partial.keyMap };
  save(_cache);
  return _cache;
}

export function resetSettings() {
  _cache = { ...DEFAULTS, keyMap: { ...DEFAULTS.keyMap } };
  save(_cache);
  return _cache;
}

export function getKeyMap() {
  return getSettings().keyMap;
}

// Human-readable key names
export function keyCodeLabel(code) {
  const map = {
    Space: 'SPACE', Enter: 'ENTER', Escape: 'ESC',
    ShiftLeft: 'L-SHIFT', ShiftRight: 'R-SHIFT',
    ControlLeft: 'L-CTRL', ControlRight: 'R-CTRL',
    AltLeft: 'L-ALT', AltRight: 'R-ALT',
    Tab: 'TAB',
    ArrowLeft: '← LEFT', ArrowRight: '→ RIGHT',
    ArrowUp: '↑ UP', ArrowDown: '↓ DOWN',
  };
  if (map[code]) return map[code];
  if (code.startsWith('Key'))    return code.slice(3);
  if (code.startsWith('Digit'))  return code.slice(5);
  if (code.startsWith('Numpad')) return 'NP' + code.slice(6);
  if (code.startsWith('F'))      return code;
  return code;
}
