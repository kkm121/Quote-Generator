// js/history.js
// localStorage-backed history manager

const STORAGE_KEY = 'rq_history_v2';
const MAX_ITEMS = 50;

/**
 * loadHistory -> returns an array of saved quote objects (most-recent-first)
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

/**
 * saveHistory(array)
 */
export function saveHistory(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0, MAX_ITEMS)));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

/**
 * pushHistory(item) -> inserts item at front
 * item shape: { id, content, author }
 */
export function pushHistory(item) {
  const arr = loadHistory();
  // avoid exact duplicate at front
  if (arr.length && arr[0].content === item.content) return;
  arr.unshift({ ...item, savedAt: Date.now() });
  saveHistory(arr);
}

/**
 * clearHistory() -> remove all history
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
