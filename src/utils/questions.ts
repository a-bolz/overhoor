export type Track = 5 | 10 | 20 | 30 | 50 | 100;

export interface Question {
  id: string;
  a: number;
  b: number;
  operator: '+' | '-';
  answer: number;
}

export const TRACKS: Track[] = [5, 10, 20, 30, 50, 100];

// Each track has an exclusive range for the max number
function getTrackRange(track: Track): { min: number; max: number } {
  switch (track) {
    case 5:   return { min: 1, max: 5 };
    case 10:  return { min: 6, max: 10 };
    case 20:  return { min: 11, max: 20 };
    case 30:  return { min: 21, max: 30 };
    case 50:  return { min: 31, max: 50 };
    case 100: return { min: 51, max: 100 };
  }
}

// Helper to get random int in range [min, max] inclusive
function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function getTrackLabel(track: Track): string {
  const { min, max } = getTrackRange(track);
  return `${min}-${max}`;
}

export function generateQuestion(track: Track): Question {
  const { min, max } = getTrackRange(track);
  const operator = Math.random() < 0.5 ? '+' : '-';
  let a: number, b: number, answer: number;

  if (operator === '+') {
    // For addition: a + b = answer, where answer is in [min, max]
    // Pick answer first (this is the max number), then split
    answer = randomInRange(min, max);
    // a can be 0 to answer, b = answer - a
    a = Math.floor(Math.random() * (answer + 1));
    b = answer - a;
  } else {
    // For subtraction: a - b = answer
    // The max number is 'a', so a must be in [min, max]
    a = randomInRange(min, max);
    // b can be 0 to a, answer = a - b
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
