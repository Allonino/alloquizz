/* config.js — AlloQuizz shared utilities */

const AQ_URL = 'https://tsneytqibltnjarajcll.supabase.co';
const AQ_KEY = 'sb_publishable_yxIJa12tOnd1UqEkdo7p_Q_7SwjwZH1';
const AQ_DELETE_PIN = '1234';

// ── TOAST ──────────────────────────────────────────
let _toastTimer = null;
function aqToast(msg, type = '') {
  let el = document.getElementById('aq-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'aq-toast';
    document.body.appendChild(el);
  }
  clearTimeout(_toastTimer);
  el.textContent = msg;
  el.className = 'show' + (type ? ' ' + type : '');
  _toastTimer = setTimeout(() => el.className = '', 2600);
}

// ── BROADCAST ──────────────────────────────────────
function aqBroadcast(game, state) {
  try { localStorage.setItem('aq_' + game, JSON.stringify(state)); } catch(e) {}
  try {
    const bc = new BroadcastChannel('aq_' + game);
    bc.postMessage(state);
    bc.close();
  } catch(e) {}
}

function aqListen(game, callback) {
  const key = 'aq_' + game;
  try {
    const bc = new BroadcastChannel(key);
    bc.onmessage = e => callback(e.data);
  } catch(e) {}
  let lastRaw = null;
  setInterval(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && raw !== lastRaw) { lastRaw = raw; callback(JSON.parse(raw)); }
    } catch(e) {}
  }, 500);
  try {
    const raw = localStorage.getItem(key);
    if (raw) { lastRaw = raw; callback(JSON.parse(raw)); }
  } catch(e) {}
}

// ── UTILS ──────────────────────────────────────────
function aqEsc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function aqOpenSpectator(game) {
  window.open('spectateur-' + game + '.html', '_blank');
}

const AQ_COLORS = {
  grille: '#fb923c', panel: '#f87171', podium: '#f472b6',
  mot: '#c084fc', jp: '#2dd4bf', global: '#7c6fff'
};
