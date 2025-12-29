import { useSwipe } from '../hooks/useSwipe';
import { type Question, questionToString } from '../utils/questions';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  showAnswer: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  disabled: boolean;
  timeRemaining: number | null;
  totalTime: number | null;
}

export function QuestionCard({
  question,
  showAnswer,
  onCorrect,
  onWrong,
  disabled,
  timeRemaining,
  totalTime,
}: QuestionCardProps) {
  const [{ offsetX, isDragging }, handlers] = useSwipe({
    onSwipeRight: () => !disabled && onCorrect(),
    onSwipeLeft: () => !disabled && onWrong(),
    threshold: 80,
  });

  const swipeDirection =
    offsetX > 50 ? 'right' : offsetX < -50 ? 'left' : 'none';

  // Calculate progress percentage
  const progressPercent =
    timeRemaining !== null && totalTime !== null
      ? (timeRemaining / totalTime) * 100
      : null;

  // Determine if timer is running low (< 25%)
  const timerLow = progressPercent !== null && progressPercent < 25;

  return (
    <div
      className={`question-card ${isDragging ? 'dragging' : ''} ${showAnswer ? 'show-answer' : ''} swipe-${swipeDirection}`}
      style={{
        transform: `translateX(${offsetX}px) rotate(${offsetX * 0.05}deg)`,
      }}
      {...(disabled ? {} : handlers)}
    >
      <div className="question-text">
        {questionToString(question)} = ?
      </div>
      {showAnswer && (
        <div className="answer-text">
          = {question.answer}
        </div>
      )}
      <div className="swipe-hints">
        <span className="hint hint-left">Wrong</span>
        <span className="hint hint-right">Correct</span>
      </div>

      {/* Timer Progress Bar */}
      {progressPercent !== null && !showAnswer && (
        <div className="timer-bar-container">
          <div
            className={`timer-bar ${timerLow ? 'timer-low' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
