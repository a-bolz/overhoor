import type { Question, Track } from './questions';

const WRONG_ANSWERS_KEY = 'overhoor_wrong_answers';
const TRACK_KEY = 'overhoor_track';

export interface WrongAnswer {
  question: Question;
  repeatAfter: number; // Questions to wait before showing again
}

export function getWrongAnswers(): WrongAnswer[] {
  try {
    const stored = localStorage.getItem(WRONG_ANSWERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWrongAnswers(answers: WrongAnswer[]): void {
  localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(answers));
}

export function addWrongAnswer(question: Question): void {
  const answers = getWrongAnswers();
  // Don't add duplicates (same a, b, operator)
  const exists = answers.some(
    (wa) =>
      wa.question.a === question.a &&
      wa.question.b === question.b &&
      wa.question.operator === question.operator
  );
  if (!exists) {
    // Repeat after 3-7 questions (semi-random)
    const repeatAfter = 3 + Math.floor(Math.random() * 5);
    answers.push({ question, repeatAfter });
    saveWrongAnswers(answers);
  }
}

export function decrementWrongAnswers(): Question | null {
  const answers = getWrongAnswers();
  if (answers.length === 0) return null;

  // Decrement all counters
  for (const answer of answers) {
    answer.repeatAfter--;
  }

  // Find one that's ready to show
  const readyIndex = answers.findIndex((wa) => wa.repeatAfter <= 0);
  let questionToRepeat: Question | null = null;

  if (readyIndex !== -1) {
    questionToRepeat = answers[readyIndex].question;
    // Reset to show again later if still wrong
    answers[readyIndex].repeatAfter = 3 + Math.floor(Math.random() * 5);
  }

  saveWrongAnswers(answers);
  return questionToRepeat;
}

export function removeWrongAnswer(question: Question): void {
  const answers = getWrongAnswers();
  const filtered = answers.filter(
    (wa) =>
      !(
        wa.question.a === question.a &&
        wa.question.b === question.b &&
        wa.question.operator === question.operator
      )
  );
  saveWrongAnswers(filtered);
}

export function getSavedTrack(): Track {
  try {
    const stored = localStorage.getItem(TRACK_KEY);
    if (stored) {
      const track = parseInt(stored, 10) as Track;
      if ([5, 10, 20, 30, 50, 100].includes(track)) {
        return track;
      }
    }
  } catch {
    // Ignore
  }
  return 10; // Default track
}

export function saveTrack(track: Track): void {
  localStorage.setItem(TRACK_KEY, track.toString());
}

// Timer settings
const TIMER_KEY = 'overhoor_timer';

export type TimerSetting = number | 'off'; // number = seconds (1-30), 'off' = no timer

export function getTimerSetting(): TimerSetting {
  try {
    const stored = localStorage.getItem(TIMER_KEY);
    if (stored === 'off') return 'off';
    if (stored) {
      const seconds = parseInt(stored, 10);
      if (seconds >= 1 && seconds <= 30) return seconds;
    }
  } catch {
    // Ignore
  }
  return 'off'; // Default: no timer
}

export function saveTimerSetting(setting: TimerSetting): void {
  localStorage.setItem(TIMER_KEY, setting.toString());
}
