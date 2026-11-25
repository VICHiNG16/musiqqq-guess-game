import { useEffect, useRef, useState } from 'react';
import { submitAnswer } from './api.js';
import { FEEDBACK_MS } from './constants.js';

export default function GameScreen({ session, onFinish, onQuit }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(session.roundSeconds);
  const [phase, setPhase] = useState('playing');
  const [selectedId, setSelectedId] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioNotice, setAudioNotice] = useState('');
  const [volume, setVolume] = useState(75);
  const [error, setError] = useState('');

  const audioRef = useRef(null);
  const lockedRef = useRef(false);
  const timeoutRef = useRef(null);

  const round = session.rounds[roundIndex];
  const progressPercent = Math.round(((roundIndex + 1) / session.totalRounds) * 100);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    setAudioNotice('');
    audio.src = round.previewUrl;
    audio.currentTime = 0;
    audio.volume = volume / 100;
    audio.play().catch((err) => {
      if (err?.name === 'NotAllowedError') {
        setAudioNotice('blocked');
      }
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [round.previewUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, roundIndex]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      handleAnswer(null);
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleToggleAudio() {
    const audio = audioRef.current;
    if (!audio || phase !== 'playing') return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setAudioNotice('');
        })
        .catch((err) => {
          if (err?.name === 'NotAllowedError') {
            setAudioNotice('blocked');
          }
          setIsPlaying(false);
        });
    } else {
      audio.pause();
    }
  }

  async function handleAnswer(optionId) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setPhase('feedback');
    setSelectedId(optionId);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const res = await submitAnswer({
        sessionId: session.sessionId,
        roundIndex,
        selectedId: optionId ?? 0,
        remainingSeconds: optionId === null ? 0 : timeLeft,
      });

      setAnswer(res);
      setScore(res.totalScore);
      const nextCorrectCount = res.correct ? correctCount + 1 : correctCount;
      if (res.correct) {
        setCorrectCount(nextCorrectCount);
      }

      timeoutRef.current = setTimeout(() => {
        if (roundIndex + 1 >= session.totalRounds) {
          onFinish({ totalScore: res.totalScore, correctCount: nextCorrectCount });
        } else {
          setRoundIndex((prev) => prev + 1);
          setTimeLeft(session.roundSeconds);
          setPhase('playing');
          setSelectedId(null);
          setAnswer(null);
          lockedRef.current = false;
        }
      }, FEEDBACK_MS);
    } catch (err) {
      setError(err.message);
    }
  }

  function getOptionClass(optionId) {
    const classes = ['option'];
    if (phase !== 'feedback') return classes.join(' ');

    if (answer) {
      if (optionId === answer.correctId) {
        classes.push('option--correct');
      } else if (optionId === selectedId && !answer.correct) {
        classes.push('option--wrong');
      }
    } else if (optionId === selectedId) {
      classes.push('option--selected');
    }

    return classes.join(' ');
  }

  let feedbackContent = null;
  if (phase === 'feedback' && answer) {
    if (answer.correct) {
      feedbackContent = (
        <p className="feedback feedback--success">
          Corect! +{answer.roundPoints} puncte
        </p>
      );
    } else if (selectedId === null) {
      feedbackContent = <p className="feedback feedback--error">Timpul a expirat.</p>;
    } else {
      feedbackContent = (
        <p className="feedback feedback--error">
          Gresit. Raspunsul corect este marcat cu verde.
        </p>
      );
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => {
          setIsPlaying(true);
          setAudioNotice('');
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          if (audioRef.current?.getAttribute('src')) {
            setAudioNotice('error');
            setIsPlaying(false);
          }
        }}
      />

      <header className="stack-md">
        <div className="round-header">
          <span className="label-md tabular-nums">
            Runda {roundIndex + 1} / {session.totalRounds}
          </span>
          <span className="label-md tabular-nums">Scor: {score}</span>
          <span
            className={`label-md tabular-nums timer${
              timeLeft <= 5 ? ' timer--warning' : ''
            }`}
          >
            {timeLeft}s
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progres runda"
        >
          <div className="progress__fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <main className="stack-lg">
        <section className="audio-bar" aria-label="Control audio">
          <div className="audio-bar__left">
            <button
              type="button"
              className="icon-button"
              onClick={handleToggleAudio}
              disabled={phase !== 'playing'}
              aria-label={isPlaying ? 'Pauza fragment audio' : 'Reda fragment audio'}
            >
              {isPlaying ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="7 5 19 12 7 19 7 5" />
                </svg>
              )}
            </button>
            {audioNotice === 'blocked' ? (
              <span className="body-sm audio-notice">
                Apasa Play pentru a porni sunetul
              </span>
            ) : audioNotice === 'error' ? (
              <span className="body-sm feedback--error">
                Fragmentul audio nu a putut fi incarcat
              </span>
            ) : (
              <span className="body-sm text-muted">
                {isPlaying ? 'Se reda fragmentul audio...' : 'Redare oprita'}
              </span>
            )}
          </div>

          <div className="volume">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volum audio"
              className="volume__slider"
            />
          </div>
        </section>

        <section aria-label="Variante de raspuns">
          <div className="options-grid">
            {round.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={getOptionClass(option.id)}
                disabled={phase === 'feedback'}
                onClick={() => handleAnswer(option.id)}
              >
                <span className="label-lg option__title">{option.title}</span>
                <span className="body-sm option__artist">{option.artist}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="feedback-slot" aria-live="polite">
          {feedbackContent}
        </div>

        {error && (
          <div className="stack-md">
            <div className="alert alert--error" role="alert">
              {error}
            </div>
            <button type="button" className="btn btn--secondary" onClick={onQuit}>
              Inapoi la start
            </button>
          </div>
        )}
      </main>
    </>
  );
}
