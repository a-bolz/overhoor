import { useState, useCallback, useEffect } from 'react';
import { QuestionCard } from './components/QuestionCard';
import { TrackSelector } from './components/TrackSelector';
import { type Track, type Question, generateQuestion } from './utils/questions';
import {
  getSavedTrack,
  saveTrack,
  addWrongAnswer,
  decrementWrongAnswers,
  removeWrongAnswer,
} from './utils/storage';
import { playCorrectSound, playWrongSound, initAudio } from './utils/sounds';
import './App.css';

type Screen = 'menu' | 'practice';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [track, setTrack] = useState<Track>(getSavedTrack);
  const [question, setQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isRepeatedQuestion, setIsRepeatedQuestion] = useState(false);

  const getNextQuestion = useCallback(() => {
    // Check if we should show a repeated wrong answer
    const repeated = decrementWrongAnswers();
    if (repeated) {
      setQuestion(repeated);
      setIsRepeatedQuestion(true);
    } else {
      setQuestion(generateQuestion(track));
      setIsRepeatedQuestion(false);
    }
    setShowAnswer(false);
  }, [track]);

  const handleStart = useCallback(() => {
    initAudio();
    setScreen('practice');
    setStreak(0);
    getNextQuestion();
  }, [getNextQuestion]);

  const handleTrackSelect = useCallback((newTrack: Track) => {
    setTrack(newTrack);
    saveTrack(newTrack);
  }, []);

  const handleCorrect = useCallback(() => {
    if (!question) return;
    playCorrectSound();
    setStreak((s) => s + 1);

    // If this was a repeated question and answered correctly, remove from wrong list
    if (isRepeatedQuestion) {
      removeWrongAnswer(question);
    }

    getNextQuestion();
  }, [question, isRepeatedQuestion, getNextQuestion]);

  const handleWrong = useCallback(() => {
    if (!question || showAnswer) return;
    playWrongSound();
    setStreak(0);

    // Save to wrong answers for spaced repetition
    addWrongAnswer(question);

    // Show the correct answer
    setShowAnswer(true);

    // Move to next question after delay
    setTimeout(() => {
      getNextQuestion();
    }, 1500);
  }, [question, showAnswer, getNextQuestion]);

  const handleBack = useCallback(() => {
    setScreen('menu');
    setQuestion(null);
  }, []);

  // Handle keyboard for desktop testing
  useEffect(() => {
    if (screen !== 'practice') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleCorrect();
      } else if (e.key === 'ArrowLeft') {
        handleWrong();
      } else if (e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleCorrect, handleWrong, handleBack]);

  if (screen === 'menu') {
    return (
      <TrackSelector
        currentTrack={track}
        onSelect={handleTrackSelect}
        onStart={handleStart}
      />
    );
  }

  return (
    <div className="practice-screen">
      <div className="practice-header">
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
        <div className="streak">
          <span className="streak-icon">🔥</span>
          <span className="streak-count">{streak}</span>
        </div>
        <div className="track-badge">≤ {track}</div>
      </div>

      {question && (
        <QuestionCard
          question={question}
          showAnswer={showAnswer}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          disabled={showAnswer}
        />
      )}
    </div>
  );
}

export default App;
