// js/api.js
// Simple wrapper to fetch a random quote from quotable.io
const API_URL = 'https://api.quotable.io/random';

/**
 * fetchRandomQuote
 * returns: { content: string, author: string, id: string }
 */
export async function fetchRandomQuote() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Quote API returned ${res.status}`);
  }
  const data = await res.json();
  // quotable returns { _id, content, author, ... }
  return {
    id: data._id || String(Date.now()),
    content: data.content,
    author: data.author || 'Unknown'
  };
}
