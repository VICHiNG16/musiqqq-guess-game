# Musiqqq the Guess Game

## Rulare locală

Server:

```bash
cd server && npm install && npm run dev
```

Client:

```bash
cd client && npm install && npm run dev
```

## API

- `GET /api/health` — stare server
- `POST /api/game/start` — pornește o sesiune de 10 runde (`{ "category": "pop" | "rock" | "hiphop" | "hituri" }`)
- `POST /api/game/answer` — verifică răspunsul și calculează punctajul (`{ sessionId, roundIndex, selectedId, remainingSeconds }`)
- `POST /api/leaderboard` — salvează un scor în SQLite (`{ nickname, category, score }`)
- `GET /api/leaderboard` — returnează top 10 scoruri descrescător

Colecția Postman este disponibilă în `server/postman/Musiqqq.postman_collection.json`.
