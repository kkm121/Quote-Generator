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
  const previewLen = opts.previewLen ?? 40;
  const revealDelay = opts.revealDelay ?? 1500;

  // 1) Show setup (author name or first part of quote)
  const preview = q.author && q.content.length > previewLen 
    ? `${q.author} once said...` 
    : (q.content.length > previewLen ? q.content.slice(0, previewLen) + '…' : q.content);
  
  setupEl.textContent = preview;
  setupEl.style.opacity = '0';
  setupEl.style.animation = 'none';
  
  // Trigger reflow for animation restart
  setupEl.offsetHeight;
  setupEl.style.animation = 'fadeInUp 0.6s ease forwards';

  authorEl.textContent = `— ${q.author || 'Unknown'}`;
  authorEl.style.opacity = '0';
  authorEl.style.animation = 'none';

  // 2) prepare full element (hidden)
  fullEl.classList.remove('visible');
  fullEl.textContent = q.content;
  currentQuote = q;

  // 3) reveal after a timeout (fade-in via CSS)
  setTimeout(() => {
    fullEl.classList.add('visible');
    authorEl.offsetHeight;
    authorEl.style.animation = 'slideIn 0.5s ease forwards 0.3s';
  }, revealDelay);
}

/* history rendering - click a history item to restore it */
export function renderHistory() {
  const arr = loadHistory();
  histList.innerHTML = '';
  if (!arr.length) {
    histList.innerHTML = '<div class="no-history">No saved quotes yet. Click "Save to History" to start collecting!</div>';
    return;
  }

  arr.forEach(item => {
    const node = document.createElement('div');
    node.className = 'history-item';
    node.innerHTML = `<strong>${escapeHtml(shorten(item.content, 100))}</strong>
                      <small>${escapeHtml(item.author || 'Unknown')} · ${new Date(item.savedAt).toLocaleString()}</small>`;
    node.addEventListener('click', () => {
      // restore the clicked history quote to current view
      showSetupThenReveal({ content: item.content, author: item.author }, { revealDelay: 800 });
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    histList.appendChild(node);
  });
}

/* UI controls used by main.js */
export function getCurrentQuote() { return currentQuote; }

export function saveCurrentToHistory() { 
  if (currentQuote) {
    pushHistory(currentQuote); 
    renderHistory(); 
  }
}

export function clearHistoryUI() { 
  clearHistoryStore(); 
  renderHistory(); 
}

/* small helpers */
function shorten(s, n) { return (s.length > n) ? s.slice(0,n) + '…' : s; }

function escapeHtml(str) { 
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  ); 
}

/* clipboard helper - return promise */
export async function copyCurrentToClipboard() {
  const q = getCurrentQuote();
  if (!q) throw new Error('No current quote to copy');
  const text = `"${q.content}" — ${q.author || 'Unknown'}`;
  await navigator.clipboard.writeText(text);
  
  // Show floating notification
  showCopyNotification();
}

function showCopyNotification() {
  let notification = document.getElementById('copyNotification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'copyNotification';
    notification.className = 'copy-notification';
    notification.textContent = '✓ Quote copied to clipboard!';
    document.body.appendChild(notification);
  }
  
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

/* dark theme toggle */
export function applyDarkFromStorage() {
  const d = localStorage.getItem('rq_dark_v2') === '1';
  document.documentElement.classList.toggle('dark', d);
  const btn = document.getElementById('darkToggle');
  if (btn) {
    btn.setAttribute('aria-pressed', d ? 'true' : 'false');
    btn.textContent = d ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

export function toggleDark() {
  const isNow = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', isNow);
  localStorage.setItem('rq_dark_v2', isNow ? '1' : '0');
  const btn = document.getElementById('darkToggle');
  if (btn) {
    btn.setAttribute('aria-pressed', isNow ? 'true' : 'false');
    btn.textContent = isNow ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}
