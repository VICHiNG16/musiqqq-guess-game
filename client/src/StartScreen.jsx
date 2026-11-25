import { useState } from 'react';
import { getLeaderboard } from './api.js';
import { CATEGORIES } from './constants.js';
import { LeaderboardTable } from './ResultsScreen.jsx';

export default function StartScreen({
  initialNickname,
  initialCategory,
  loading,
  error,
  onStart,
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [nicknameError, setNicknameError] = useState('');
  const [category, setCategory] = useState(initialCategory || 'pop');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [rows, setRows] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState('');

  async function handleToggleLeaderboard() {
    const nextOpen = !showLeaderboard;
    setShowLeaderboard(nextOpen);
    if (!nextOpen) return;

    setLbLoading(true);
    setLbError('');
    try {
      const data = await getLeaderboard();
      setRows(data);
    } catch (err) {
      setLbError(err.message);
    } finally {
      setLbLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError('Introdu un nume de jucator pentru a incepe.');
      return;
    }

    setNicknameError('');
    onStart(trimmed, category);
  }

  return (
    <>
      <header className="topbar">
        <span className="brand headline-md">Musiqqq</span>
        <button
          type="button"
          className="btn btn--tertiary"
          onClick={handleToggleLeaderboard}
        >
          {showLeaderboard ? 'Ascunde clasamentul' : 'Clasament'}
        </button>
      </header>

      <main className="stack">
        <article className="card stack-lg">
          <div className="stack-xs">
            <h1 className="headline-lg">Pregatire joc</h1>
            <p className="body-sm text-muted">
              Introdu numele si alege categoria pentru cele 10 runde.
            </p>
          </div>

          <form className="stack-lg" onSubmit={handleSubmit}>
            <label className="field">
              <span className="label-md">Nume jucator</span>
              <input
                type="text"
                className={`input${nicknameError ? ' input--error' : ''}`}
                placeholder="Introdu numele"
                maxLength={20}
                disabled={loading}
                value={nickname}
                aria-invalid={Boolean(nicknameError)}
                aria-describedby={nicknameError ? 'nickname-error' : undefined}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (nicknameError) {
                    setNicknameError('');
                  }
                }}
              />
              {nicknameError && (
                <span id="nickname-error" className="field-error">
                  {nicknameError}
                </span>
              )}
            </label>

            <div className="field">
              <span className="label-md">Categorie</span>
              <div
                className="category-grid"
                role="radiogroup"
                aria-label="Categorie"
              >
                {CATEGORIES.map((item) => {
                  const selected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={loading}
                      className={`category-option${
                        selected ? ' category-option--selected' : ''
                      }`}
                      onClick={() => setCategory(item.id)}
                    >
                      <span>{item.label}</span>
                      {selected && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="alert alert--error" role="alert">
                {error}
              </div>
            )}

            <div className="stack-xs">
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={loading}
              >
                {loading ? 'Se pregateste jocul...' : 'Incepe jocul'}
              </button>
              {loading && (
                <p className="body-sm text-muted loading-text" role="status">
                  Se incarca melodiile...
                </p>
              )}
            </div>
          </form>
        </article>

        {showLeaderboard && (
          <section className="stack-md" aria-labelledby="start-leaderboard-title">
            <h2 id="start-leaderboard-title" className="title-md">
              Clasament
            </h2>
            {lbLoading && <p className="body-sm text-muted">Se incarca clasamentul...</p>}
            {lbError && (
              <div className="alert alert--error" role="alert">
                {lbError}
              </div>
            )}
            {!lbLoading && !lbError && <LeaderboardTable rows={rows} />}
          </section>
        )}
      </main>
    </>
  );
}
