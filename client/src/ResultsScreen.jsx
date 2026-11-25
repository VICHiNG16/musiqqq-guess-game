import { useEffect, useRef, useState } from 'react';
import { getLeaderboard, saveScore } from './api.js';
import { getCategoryLabel } from './constants.js';

export function LeaderboardTable({ rows, highlightId }) {
  return (
    <div className="leaderboard">
      <table className="leaderboard__table">
        <thead>
          <tr>
            <th scope="col" className="leaderboard__rank">
              #
            </th>
            <th scope="col">Jucator</th>
            <th scope="col">Categorie</th>
            <th scope="col" className="leaderboard__score">
              Scor
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="leaderboard__empty">
                Niciun scor salvat inca
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id}
                className={row.id === highlightId ? 'row--highlight' : undefined}
              >
                <td className="tabular-nums text-muted">{index + 1}</td>
                <td className="label-md">{row.nickname}</td>
                <td className="text-muted">{getCategoryLabel(row.category)}</td>
                <td className="leaderboard__score label-md tabular-nums">{row.score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultsScreen({
  nickname,
  category,
  totalScore,
  correctCount,
  totalRounds,
  loading,
  onPlayAgain,
  onBackToStart,
}) {
  const [rows, setRows] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const [status, setStatus] = useState('saving');
  const [error, setError] = useState('');
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    async function persistAndLoad() {
      setStatus('saving');
      setError('');
      try {
        const created = await saveScore({
          nickname,
          category,
          score: totalScore,
        });
        setSavedId(created.id);
        const data = await getLeaderboard();
        setRows(data);
        setStatus('ready');
      } catch (err) {
        setError(err.message);
        setStatus('error');
        try {
          const data = await getLeaderboard();
          setRows(data);
        } catch {
          setRows([]);
        }
      }
    }

    persistAndLoad();
  }, [nickname, category, totalScore]);

  return (
    <>
      <article className="card stack-lg">
        <header className="stack-xs">
          <h1 className="headline-md">Joc incheiat</h1>
          <p className="body-sm text-muted tabular-nums">
            {correctCount} / {totalRounds} piese ghicite
          </p>
        </header>

        <p className="headline-lg text-primary tabular-nums">{totalScore} puncte</p>

        {status === 'saving' && (
          <p className="body-sm text-muted">Se salveaza scorul in clasament...</p>
        )}

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <footer className="actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={loading}
            onClick={onPlayAgain}
          >
            {loading ? 'Se incarca...' : 'Joaca din nou'}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={loading}
            onClick={onBackToStart}
          >
            Inapoi la start
          </button>
        </footer>
      </article>

      <section className="stack-md" aria-labelledby="results-leaderboard-title">
        <h2 id="results-leaderboard-title" className="title-md">
          Clasament
        </h2>
        <LeaderboardTable rows={rows} highlightId={savedId} />
      </section>
    </>
  );
}
