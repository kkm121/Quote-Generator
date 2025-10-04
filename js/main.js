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
  if (!newBtn) return;
  newBtn.disabled = is;
  newBtn.textContent = is ? '⏳ Loading…' : '✨ New Quote';
}

/**
 * Fetch a quote from the API and show it (with reveal).
 * Also auto-save the fetched quote to the history (localStorage-backed).
 */
async function loadAndShow() {
  setLoading(true);
  try {
    const q = await fetchRandomQuote();
    showSetupThenReveal(q);
    // Auto-save fetched quotes to localStorage-backed history
    try {
      saveCurrentToHistory();
    } catch (e) {
      // non-fatal; keep app usable
      console.error('Auto-save to history failed', e);
    }
  } catch (e) {
    const setupEl = document.getElementById('quoteSetup');
    if (setupEl) setupEl.textContent = 'Could not load quote. Please try again.';
    console.error(e);
  } finally {
    setLoading(false);
  }
}

/* Event wiring */
if (newBtn) newBtn.addEventListener('click', loadAndShow);

if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    saveCurrentToHistory();
    // Quick UI feedback
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = '#10b981';
    saveBtn.style.color = 'white';
    setTimeout(() => {
      saveBtn.textContent = '💾 Save to History';
      saveBtn.style.background = '';
      saveBtn.style.color = '';
    }, 1200);
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all saved quotes? This cannot be undone.')) {
      clearHistoryUI();
    }
  });
}

if (copyBtn) {
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
}

if (darkBtn) darkBtn.addEventListener('click', toggleDark);

/* Initial boot */
applyDarkFromStorage();
renderHistory();
loadAndShow();
