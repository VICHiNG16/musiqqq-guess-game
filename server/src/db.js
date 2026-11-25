import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const dbPath = fileURLToPath(new URL('../leaderboard.db', import.meta.url));
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    category TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertScoreStmt = db.prepare(
  'INSERT INTO scores (nickname, category, score) VALUES (?, ?, ?)'
);
const getScoreByIdStmt = db.prepare(
  'SELECT id, nickname, category, score, created_at FROM scores WHERE id = ?'
);
const topScoresStmt = db.prepare(
  'SELECT id, nickname, category, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT ?'
);

export function addScore({ nickname, category, score }) {
  const result = insertScoreStmt.run(nickname, category, score);
  return getScoreByIdStmt.get(result.lastInsertRowid);
}

export function getTopScores(limit = 10) {
  return topScoresStmt.all(limit);
}
