// js/main.js
// app bootstrap: wire up events and start the first fetch

import { fetchRandomQuote } from './api.js';
import { renderHistory, showSetupThenReveal, saveCurrentToHistory, clearHistoryUI, copyCurrentToClipboard, applyDarkFromStorage, toggleDark } from './ui.js';

const newBtn = document.getElementById('newQuote');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearHist');
const copyBtn = document.getElementById('copyBtn');
const darkBtn = document.getElementById('darkToggle');

function setLoading(is) {
  newBtn.disabled = is;
  newBtn.textContent = is ? '⏳ Loading…' : '✨ New Quote';
  if (is) {
    document.getElementById('quoteSetup').textContent = 'Fetching an inspiring quote...';
    document.getElementById('quoteFull').classList.remove('visible');
    document.getElementById('author').textContent = '';
  }
}

async function loadAndShow() {
  setLoading(true);
  try {
    const q = await fetchRandomQuote();
    showSetupThenReveal(q);
  } catch (e) {
    document.getElementById('quoteSetup').textContent = 'Could not load quote. Please try again.';
    console.error(e);
  } finally {
    setLoading(false);
  }
}

/* Event wiring */
newBtn.addEventListener('click', loadAndShow);

saveBtn.addEventListener('click', () => {
  saveCurrentToHistory();
  saveBtn.textContent = '✓ Saved!';
  saveBtn.style.background = '#10b981';
  saveBtn.style.color = 'white';
  setTimeout(() => {
    saveBtn.textContent = '💾 Save to History';
    saveBtn.style.background = '';
    saveBtn.style.color = '';
  }, 1200);
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all saved quotes? This cannot be undone.')) {
    clearHistoryUI();
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await copyCurrentToClipboard();
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => copyBtn.textContent = '📋 Copy', 1500);
  } catch (err) {
    alert('Unable to copy to clipboard. Please try again.');
    console.error(err);
  }
});

darkBtn.addEventListener('click', toggleDark);

/* Initial boot */
applyDarkFromStorage();
renderHistory();
loadAndShow();
