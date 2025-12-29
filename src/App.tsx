import { useState, useCallback, useEffect, useRef } from 'react';
import { QuestionCard } from './components/QuestionCard';
import { TrackSelector } from './components/TrackSelector';
import { type Track, type Question, generateQuestion, getTrackLabel } from './utils/questions';
import {
  getSavedTrack,
  saveTrack,
  addWrongAnswer,
  decrementWrongAnswers,
  removeWrongAnswer,
  getTimerSetting,
  saveTimerSetting,
  type TimerSetting,
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

  // Timer state
  const [timerSetting, setTimerSetting] = useState<TimerSetting>(getTimerSetting);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Store values in refs for timer callback access
  const trackRef = useRef(track);
  const timerSettingRef = useRef(timerSetting);

  // Update refs in effects
  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useEffect(() => {
    timerSettingRef.current = timerSetting;
  }, [timerSetting]);

  // Clear all timer intervals
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Helper to get next question (uses ref to avoid stale closure)
  const getNextQuestionData = useCallback((): { question: Question; isRepeated: boolean } => {
    const repeated = decrementWrongAnswers();
    if (repeated) {
      return { question: repeated, isRepeated: true };
    }
    return { question: generateQuestion(trackRef.current), isRepeated: false };
  }, []);

  // Start the countdown timer - stored in ref for self-reference
  const startTimerRef = useRef<(q: Question) => void>(() => {});

  useEffect(() => {
    startTimerRef.current = (currentQuestion: Question) => {
      const setting = timerSettingRef.current;
      if (setting === 'off') {
        setTimeRemaining(null);
        return;
      }

      clearTimers();
      const startTime = Date.now();
      const duration = (setting as number) * 1000;

      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (duration - elapsed) / 1000);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearTimers();
          playWrongSound();
          setStreak(0);
          addWrongAnswer(currentQuestion);
          setShowAnswer(true);

          timerRef.current = window.setTimeout(() => {
            const { question: nextQuestion, isRepeated } = getNextQuestionData();
            setQuestion(nextQuestion);
            setIsRepeatedQuestion(isRepeated);
            setShowAnswer(false);
            startTimerRef.current?.(nextQuestion);
          }, 1000);
        }
      }, 100);
    };
  }, [clearTimers, getNextQuestionData]);

  const startTimer = useCallback((q: Question) => {
    startTimerRef.current?.(q);
  }, []);

  const handleStart = useCallback(() => {
    initAudio();
    setScreen('practice');
    setStreak(0);

    const { question: firstQuestion, isRepeated } = getNextQuestionData();
    setQuestion(firstQuestion);
    setIsRepeatedQuestion(isRepeated);
    setShowAnswer(false);

    setTimeout(() => {
      startTimer(firstQuestion);
    }, 0);
  }, [getNextQuestionData, startTimer]);

  const handleTrackSelect = useCallback((newTrack: Track) => {
    setTrack(newTrack);
    saveTrack(newTrack);
  }, []);

  const handleTimerSettingChange = useCallback((setting: TimerSetting) => {
    setTimerSetting(setting);
    saveTimerSetting(setting);
  }, []);

  const handleCorrect = useCallback(() => {
    if (!question) return;
    clearTimers();
    playCorrectSound();
    setStreak((s) => s + 1);

    if (isRepeatedQuestion) {
      removeWrongAnswer(question);
    }

    const { question: nextQuestion, isRepeated } = getNextQuestionData();
    setQuestion(nextQuestion);
    setIsRepeatedQuestion(isRepeated);
    setShowAnswer(false);
    startTimer(nextQuestion);
  }, [question, isRepeatedQuestion, clearTimers, getNextQuestionData, startTimer]);

  const handleWrong = useCallback(() => {
    if (!question || showAnswer) return;
    clearTimers();
    playWrongSound();
    setStreak(0);

    addWrongAnswer(question);
    setShowAnswer(true);

    timerRef.current = window.setTimeout(() => {
      const { question: nextQuestion, isRepeated } = getNextQuestionData();
      setQuestion(nextQuestion);
      setIsRepeatedQuestion(isRepeated);
      setShowAnswer(false);
      startTimer(nextQuestion);
    }, 1000);
  }, [question, showAnswer, clearTimers, getNextQuestionData, startTimer]);

  const handleBack = useCallback(() => {
    clearTimers();
    setScreen('menu');
    setQuestion(null);
    setTimeRemaining(null);
  }, [clearTimers]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

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
        timerSetting={timerSetting}
        onTimerChange={handleTimerSettingChange}
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
        <div className="track-badge">{getTrackLabel(track)}</div>
      </div>

      {question && (
        <QuestionCard
          question={question}
          showAnswer={showAnswer}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          disabled={showAnswer}
          timeRemaining={timeRemaining}
          totalTime={timerSetting === 'off' ? null : timerSetting}
        />
      )}
    </div>
  );
}

export default App;
