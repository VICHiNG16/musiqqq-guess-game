import { useState } from 'react';
import { startGame } from './api.js';
import StartScreen from './StartScreen.jsx';
import GameScreen from './GameScreen.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('start');
  const [player, setPlayer] = useState({ nickname: '', category: 'pop' });
  const [session, setSession] = useState(null);
  const [result, setResult] = useState({ totalScore: 0, correctCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart(nickname, category) {
    setLoading(true);
    setError('');
    try {
      const nextSession = await startGame(category);
      setPlayer({ nickname, category });
      setSession(nextSession);
      setScreen('game');
    } catch (err) {
      setError(err.message);
      setScreen('start');
    } finally {
      setLoading(false);
    }
  }

  function handleFinish(finalResult) {
    setResult(finalResult);
    setScreen('results');
  }

  function handlePlayAgain() {
    handleStart(player.nickname, player.category);
  }

  function handleBackToStart() {
    setScreen('start');
    setSession(null);
    setError('');
  }

  return (
    <div className="app">
      <div className="container">
        {screen === 'start' && (
          <StartScreen
            initialNickname={player.nickname}
            initialCategory={player.category}
            loading={loading}
            error={error}
            onStart={handleStart}
          />
        )}

        {screen === 'game' && session && (
          <GameScreen
            key={session.sessionId}
            session={session}
            onFinish={handleFinish}
            onQuit={handleBackToStart}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            nickname={player.nickname}
            category={player.category}
            totalScore={result.totalScore}
            correctCount={result.correctCount}
            totalRounds={session?.totalRounds ?? 10}
            loading={loading}
            onPlayAgain={handlePlayAgain}
            onBackToStart={handleBackToStart}
          />
        )}
      </div>
    </div>
  );
}
