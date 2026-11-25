# Musiqqq the Guess Game

Joc web de tip quiz muzical cu 10 runde, fragmente audio MP3 din Deezer API si clasament SQLite.

## Cerinte

- Node.js 18+ (pentru `fetch` nativ)
- npm

## Rulare locala

Deschide doua terminale in folderul proiectului:

1. Server (port `3001`):

```bash
cd server
npm install
npm run dev
```

2. Client (port `5173`):

```bash
cd client
npm install
npm run dev
```

Deschide apoi `http://localhost:5173` in browser.

## Note

- Daca browserul blocheaza redarea automata pe prima runda, apasa butonul Play din bara audio.
- Deezer API este apelat exclusiv din serverul Express pentru a evita blocarea CORS din browser.
- Baza de date `server/leaderboard.db` este creata automat la pornirea serverului.
- Colectia Postman pentru testarea rutelor se afla in `server/postman/Musiqqq.postman_collection.json`.

## API

- `GET /api/health` — stare server
- `POST /api/game/start` — porneste o sesiune de 10 runde (`{ "category": "pop" | "rock" | "hiphop" | "hituri" }`)
- `POST /api/game/answer` — verifica raspunsul si calculeaza punctajul (`{ sessionId, roundIndex, selectedId, remainingSeconds }`)
- `POST /api/leaderboard` — salveaza un scor in SQLite (`{ nickname, category, score }`)
- `GET /api/leaderboard` — returneaza top 10 scoruri descrescator
