const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      'Serverul nu raspunde. Verifica daca backend-ul ruleaza pe portul 3001.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Eroare de comunicare cu serverul');
  }

  return data;
}

export function startGame(category) {
  return request('/api/game/start', {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
}

export function submitAnswer({ sessionId, roundIndex, selectedId, remainingSeconds }) {
  return request('/api/game/answer', {
    method: 'POST',
    body: JSON.stringify({ sessionId, roundIndex, selectedId, remainingSeconds }),
  });
}

export function getLeaderboard() {
  return request('/api/leaderboard');
}

export function saveScore({ nickname, category, score }) {
  return request('/api/leaderboard', {
    method: 'POST',
    body: JSON.stringify({ nickname, category, score }),
  });
}
