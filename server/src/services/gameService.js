import { randomUUID } from 'node:crypto';
import {
  BASE_POINTS,
  BONUS_PER_SECOND,
  OPTIONS_PER_ROUND,
  ROUNDS_PER_GAME,
  ROUND_SECONDS,
} from '../config.js';
import { httpError } from '../utils/httpError.js';

const sessions = new Map();
const SESSION_TTL_MS = 60 * 60 * 1000;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function removeExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

export function createSession(category, tracks) {
  removeExpiredSessions();

  if (tracks.length < ROUNDS_PER_GAME + OPTIONS_PER_ROUND - 1) {
    throw httpError(502, 'Nu sunt suficiente melodii disponibile');
  }

  const pool = shuffle(tracks);
  const correctTracks = pool.slice(0, ROUNDS_PER_GAME);

  const rounds = correctTracks.map((track) => {
    const distractors = shuffle(tracks.filter((t) => t.id !== track.id)).slice(
      0,
      OPTIONS_PER_ROUND - 1
    );
    const options = shuffle([track, ...distractors]).map(({ id, title, artist }) => ({
      id,
      title,
      artist,
    }));

    return {
      correctId: track.id,
      previewUrl: track.previewUrl,
      options,
      answered: false,
    };
  });

  const session = {
    id: randomUUID(),
    category,
    rounds,
    totalScore: 0,
    createdAt: Date.now(),
  };

  sessions.set(session.id, session);
  return session;
}

export function toPublicSession(session) {
  return {
    sessionId: session.id,
    category: session.category,
    totalRounds: session.rounds.length,
    roundSeconds: ROUND_SECONDS,
    rounds: session.rounds.map((round, roundIndex) => ({
      roundIndex,
      previewUrl: round.previewUrl,
      options: round.options,
    })),
  };
}

export function submitAnswer({ sessionId, roundIndex, selectedId, remainingSeconds }) {
  removeExpiredSessions();

  const session = sessions.get(sessionId);
  if (!session) {
    throw httpError(404, 'Sesiune inexistenta sau expirata');
  }

  if (
    !Number.isInteger(roundIndex) ||
    roundIndex < 0 ||
    roundIndex >= session.rounds.length
  ) {
    throw httpError(400, 'Runda invalida');
  }

  const round = session.rounds[roundIndex];
  if (round.answered) {
    throw httpError(409, 'Runda a fost deja raspunsa');
  }

  round.answered = true;

  const correct = Number(selectedId) === round.correctId;
  const seconds = Math.min(
    Math.max(Math.floor(Number(remainingSeconds) || 0), 0),
    ROUND_SECONDS
  );
  const roundPoints = correct ? BASE_POINTS + seconds * BONUS_PER_SECOND : 0;

  session.totalScore += roundPoints;

  return {
    correct,
    correctId: round.correctId,
    roundPoints,
    totalScore: session.totalScore,
  };
}
