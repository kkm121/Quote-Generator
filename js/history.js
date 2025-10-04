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
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('History storage contained unexpected data; resetting.');
      return [];
    }

    return parsed.reduce((acc, item) => {
      const normalized = normalizeHistoryItem(item);
      if (normalized) acc.push(normalized);
      return acc;
    }, []);
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

function normalizeHistoryItem(item) {
  if (!item || typeof item !== 'object') return null;
  if (typeof item.content !== 'string' || !item.content.trim()) return null;

  return {
    id: typeof item.id === 'string' && item.id ? item.id : createHistoryId(),
    content: item.content,
    author: typeof item.author === 'string' && item.author ? item.author : 'Unknown',
    savedAt: normalizeTimestamp(item.savedAt)
  };
}

function normalizeTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Date.now();
}

function createHistoryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
