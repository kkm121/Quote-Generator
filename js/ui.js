// js/ui.js
// DOM helpers: rendering quote, handling reveal animation, wiring history UI

import { loadHistory, pushHistory, clearHistory as clearHistoryStore } from './history.js';

/* DOM references */
const setupEl = document.getElementById('quoteSetup');
const fullEl  = document.getElementById('quoteFull');
const authorEl = document.getElementById('author');
const histList = document.getElementById('historyList');

let currentQuote = null;

/**
 * showSetupThenReveal(q, opts)
 * - q: { content, author }
 * - opts: { previewLen, revealDelay }
 */
export function showSetupThenReveal(q, opts = {}) {
  const previewLen = opts.previewLen ?? 30;
  const revealDelay = opts.revealDelay ?? 1200;

  // 1) set setup and author immediately
  const preview = q.content.length > previewLen ? q.content.slice(0, previewLen) + '…' : q.content;
  setupEl.textContent = preview;
  authorEl.textContent = `— ${q.author || 'Unknown'}`;

  // 2) prepare full element (hidden)
  fullEl.classList.remove('visible');
  fullEl.textContent = q.content;
  currentQuote = q;

  // 3) reveal after a timeout (fade-in via CSS)
  setTimeout(() => {
    fullEl.classList.add('visible');
  }, revealDelay);
}

/* history rendering - click a history item to restore it */
export function renderHistory() {
  const arr = loadHistory();
  histList.innerHTML = '';
  if (!arr.length) {
    histList.innerHTML = '<div class="no-history">No saved quotes yet.</div>';
    return;
  }

  arr.forEach(item => {
    const node = document.createElement('div');
    node.className = 'history-item';
    node.innerHTML = `<strong>${escapeHtml(shorten(item.content, 120))}</strong>
                      <small>${escapeHtml(item.author || 'Unknown')} · ${new Date(item.savedAt).toLocaleString()}</small>`;
    node.addEventListener('click', () => {
      // restore the clicked history quote to current view
      showSetupThenReveal({ content: item.content, author: item.author }, { revealDelay: 200 });
    });
    histList.appendChild(node);
  });
}

/* UI controls used by main.js */
export function getCurrentQuote() { return currentQuote; }
export function saveCurrentToHistory() { if (currentQuote) pushHistory(currentQuote); renderHistory(); }
export function clearHistoryUI() { clearHistoryStore(); renderHistory(); }

/* small helpers */
function shorten(s, n) { return (s.length > n) ? s.slice(0,n) + '…' : s; }
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
); }
/* clipboard helper - return promise */
export async function copyCurrentToClipboard() {
  const q = getCurrentQuote();
  if (!q) throw new Error('No current quote to copy');
  const text = `${q.content} — ${q.author || ''}`;
  await navigator.clipboard.writeText(text);
}

/* dark theme toggle */
export function applyDarkFromStorage() {
  const d = localStorage.getItem('rq_dark_v2') === '1';
  document.documentElement.classList.toggle('dark', d);
  const btn = document.getElementById('darkToggle');
  if (btn) btn.setAttribute('aria-pressed', d ? 'true' : 'false');
}
export function toggleDark() {
  const isNow = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', isNow);
  localStorage.setItem('rq_dark_v2', isNow ? '1' : '0');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.setAttribute('aria-pressed', isNow ? 'true' : 'false');
}
