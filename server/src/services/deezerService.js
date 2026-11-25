import { CATEGORIES } from '../config.js';
import { httpError } from '../utils/httpError.js';

const DEEZER_API = 'https://api.deezer.com';
const REQUEST_TIMEOUT_MS = 8000;

export async function getTracksByCategory(category) {
  const genreId = CATEGORIES[category];
  let response;

  try {
    response = await fetch(`${DEEZER_API}/chart/${genreId}/tracks?limit=100`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      throw httpError(504, 'Deezer API raspunde prea greu. Incearca din nou.');
    }
    throw httpError(502, 'Deezer API indisponibil');
  }

  if (!response.ok) {
    throw httpError(502, 'Deezer API indisponibil');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw httpError(502, 'Raspuns invalid de la Deezer API');
  }

  if (!data || data.error || !Array.isArray(data.data)) {
    throw httpError(502, 'Deezer API a returnat o eroare');
  }

  const uniqueTracks = new Map();

  for (const track of data.data) {
    const hasValidPreview =
      typeof track?.preview === 'string' && track.preview.startsWith('http');

    if (!hasValidPreview || track.readable === false || !track.id) {
      continue;
    }

    if (!uniqueTracks.has(track.id)) {
      uniqueTracks.set(track.id, {
        id: track.id,
        title: track.title,
        artist: track.artist?.name ?? 'Necunoscut',
        previewUrl: track.preview,
      });
    }
  }

  return Array.from(uniqueTracks.values());
}
