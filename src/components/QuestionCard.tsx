import { useSwipe } from '../hooks/useSwipe';
import { type Question, questionToString } from '../utils/questions';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  showAnswer: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  disabled: boolean;
}

export function QuestionCard({
  question,
  showAnswer,
  onCorrect,
  onWrong,
  disabled,
}: QuestionCardProps) {
  const [{ offsetX, isDragging }, handlers] = useSwipe({
    onSwipeRight: () => !disabled && onCorrect(),
    onSwipeLeft: () => !disabled && onWrong(),
    threshold: 80,
  });

  const swipeDirection =
    offsetX > 50 ? 'right' : offsetX < -50 ? 'left' : 'none';

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
    </div>
  );
}
