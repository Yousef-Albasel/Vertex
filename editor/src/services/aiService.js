// AI Service for Markdown Editor
const API_BASE = 'http://localhost:3001';

/**
 * Get AI suggestions for content
 * @param {string} content - Full document content
 * @param {string|null} selection - Selected text (null for full document review)
 */
export async function getSuggestion(content, selection = null) {
  const response = await fetch(`${API_BASE}/api/ai/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, selection })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI request failed');
  }

  return response.json();
}

/**
 * Rewrite content with AI using custom instructions
 * @param {string} content - Content to rewrite
 * @param {string} instructions - Instructions for rewriting
 */
export async function rewriteContent(content, instructions = '') {
  const response = await fetch(`${API_BASE}/api/ai/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, instructions })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI request failed');
  }

  return response.json();
}

/**
 * Check if AI is enabled on the server
 */
export async function checkAIStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    return data.aiEnabled === true;
  } catch {
    return false;
  }
}
