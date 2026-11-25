import { useEffect, useState } from 'react';
import { getHealth } from './api.js';
import './App.css';

const STATUS_LABELS = {
  checking: 'Se verifică serverul...',
  ok: 'Server conectat',
  error: 'Server indisponibil',
};

export default function App() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;

    getHealth()
      .then((data) => {
        if (active) {
          setStatus(data?.status === 'ok' ? 'ok' : 'error');
        }
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app">
      <h1 className="app__title">Musiqqq the Guess Game</h1>
      <p className={`status status--${status}`}>{STATUS_LABELS[status]}</p>
    </main>
  );
}
