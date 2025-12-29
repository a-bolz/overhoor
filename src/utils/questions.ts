export type Track = 5 | 10 | 20 | 30 | 50 | 100;

export interface Question {
  id: string;
  a: number;
  b: number;
  operator: '+' | '-';
  answer: number;
}

export const TRACKS: Track[] = [5, 10, 20, 30, 50, 100];

export function generateQuestion(track: Track): Question {
  const operator = Math.random() < 0.5 ? '+' : '-';
  let a: number, b: number, answer: number;

  if (operator === '+') {
    // For addition: a + b <= track
    // Pick answer first, then split it
    answer = Math.floor(Math.random() * (track + 1));
    a = Math.floor(Math.random() * (answer + 1));
    b = answer - a;
  } else {
    // For subtraction: a - b >= 0, a <= track
    a = Math.floor(Math.random() * (track + 1));
    b = Math.floor(Math.random() * (a + 1));
    answer = a - b;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    a,
    b,
    operator,
    answer,
  };
}

export function questionToString(q: Question): string {
  return `${q.a} ${q.operator} ${q.b}`;
}
