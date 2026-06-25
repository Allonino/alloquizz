/* config.js — AlloQuizz shared config & utilities */

const AQ_URL = 'https://tsneytqibltnjarajcll.supabase.co';
const AQ_KEY = 'sb_publishable_yxIJa12tOnd1UqEkdo7p_Q_7SwjwZH1';
const AQ_DELETE_PIN = '1234';

// Supabase client (disponible globalement après import de supabase-js)
const aq_db = supabase.createClient(AQ_URL, AQ_KEY);

// ── TOAST ────────────────────────────────────────
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

// ── BROADCAST (spectateur) ───────────────────────
// Chaque jeu envoie son état via ce canal + localStorage
function aqBroadcast(game, state) {
  const key = 'aq_' + game;
  try { localStorage.setItem(key, JSON.stringify(state)); } catch(e) {}
  try {
    const bc = new BroadcastChannel(key);
    bc.postMessage(state);
    bc.close();
  } catch(e) {}
}

// Écoute + polling pour le spectateur
function aqListen(game, callback) {
  const key = 'aq_' + game;
  // BroadcastChannel temps réel
  try {
    const bc = new BroadcastChannel(key);
    bc.onmessage = e => callback(e.data);
  } catch(e) {}
  // Polling localStorage (fallback cross-onglet)
  let lastRaw = null;
  setInterval(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && raw !== lastRaw) {
        lastRaw = raw;
        callback(JSON.parse(raw));
      }
    } catch(e) {}
  }, 500);
  // Init immédiat
  try {
    const raw = localStorage.getItem(key);
    if (raw) { lastRaw = raw; callback(JSON.parse(raw)); }
  } catch(e) {}
}

// ── SCORE ANIMATION ──────────────────────────────
function aqBumpScore(el, newVal, prevVal) {
  if (newVal === prevVal) return;
  el.textContent = newVal;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// ── TIMER CLASS ──────────────────────────────────
class AQTimer {
  constructor({ onTick, onEnd, displayEl }) {
    this.remaining = 60;
    this.duration  = 60;
    this.running   = false;
    this._interval = null;
    this.onTick    = onTick || (() => {});
    this.onEnd     = onEnd  || (() => {});
    this.displayEl = displayEl || null;
  }
  setDuration(s) {
    this.duration = s;
    this.remaining = s;
    this._render();
  }
  start() {
    if (this.running) return;
    this.running = true;
    this._interval = setInterval(() => {
      this.remaining = Math.max(0, this.remaining - 1);
      this._render();
      this.onTick(this.remaining);
      if (this.remaining <= 0) { this.pause(); this.onEnd(); }
    }, 1000);
  }
  pause() {
    this.running = false;
    clearInterval(this._interval);
  }
  reset() {
    this.pause();
    this.remaining = this.duration;
    this._render();
  }
  _render() {
    if (!this.displayEl) return;
    this.displayEl.textContent = this.remaining;
    const cls = this.remaining > 20 ? 'ok' : this.remaining > 10 ? 'warn' : 'urgent';
    this.displayEl.className = this.displayEl.className.replace(/\b(ok|warn|urgent)\b/g, '').trim() + ' ' + cls;
  }
}

// ── CONFIRM DELETE ───────────────────────────────
async function aqConfirmDelete(label) {
  return confirm(`Supprimer "${label}" ?`);
}

// ── ESCAPE HTML ──────────────────────────────────
function aqEsc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── OPEN SPECTATOR ───────────────────────────────
function aqOpenSpectator(game) {
  window.open(`spectateur.html?game=${game}`, '_blank');
}

// ── GAME ACCENT COLOR ────────────────────────────
const AQ_COLORS = {
  grille: '#fb923c', panel: '#f87171', podium: '#f472b6',
  mot: '#c084fc', jp: '#2dd4bf', global: '#7c6fff'
};
