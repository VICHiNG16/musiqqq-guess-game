import { Router } from 'express';
import { CATEGORIES } from '../config.js';
import { getTracksByCategory } from '../services/deezerService.js';
import {
  createSession,
  submitAnswer,
  toPublicSession,
} from '../services/gameService.js';

const router = Router();

router.post('/start', async (req, res, next) => {
  try {
    const category = req.body?.category;
    if (typeof category !== 'string' || !Object.hasOwn(CATEGORIES, category)) {
      return res.status(400).json({
        error: 'Categorie invalida',
        categories: Object.keys(CATEGORIES),
      });
    }

    const tracks = await getTracksByCategory(category);
    const session = createSession(category, tracks);

    return res.status(201).json(toPublicSession(session));
  } catch (err) {
    return next(err);
  }
});

router.post('/answer', (req, res, next) => {
  try {
    const { sessionId, roundIndex, selectedId, remainingSeconds } = req.body ?? {};

    if (
      typeof sessionId !== 'string' ||
      sessionId.trim().length === 0 ||
      !Number.isInteger(roundIndex) ||
      selectedId === undefined ||
      selectedId === null ||
      selectedId === ''
    ) {
      return res.status(400).json({ error: 'Date invalide pentru raspuns' });
    }

    const result = submitAnswer({
      sessionId,
      roundIndex,
      selectedId,
      remainingSeconds,
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;
