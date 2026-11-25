import { Router } from 'express';
import {
  BASE_POINTS,
  BONUS_PER_SECOND,
  CATEGORIES,
  ROUNDS_PER_GAME,
  ROUND_SECONDS,
} from '../config.js';
import { addScore, getTopScores } from '../db.js';

const router = Router();
const MAX_SCORE = ROUNDS_PER_GAME * (BASE_POINTS + ROUND_SECONDS * BONUS_PER_SECOND);

router.get('/', (req, res) => {
  res.json(getTopScores(10));
});

router.post('/', (req, res) => {
  const nickname =
    typeof req.body?.nickname === 'string' ? req.body.nickname.trim() : '';
  const category = req.body?.category;
  const score = req.body?.score;

  if (nickname.length < 1 || nickname.length > 20) {
    return res.status(400).json({ error: 'Nickname invalid (1-20 caractere)' });
  }

  if (typeof category !== 'string' || !Object.hasOwn(CATEGORIES, category)) {
    return res.status(400).json({
      error: 'Categorie invalida',
      categories: Object.keys(CATEGORIES),
    });
  }

  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return res.status(400).json({ error: `Scor invalid (0-${MAX_SCORE})` });
  }

  const created = addScore({ nickname, category, score });
  return res.status(201).json(created);
});

export default router;
