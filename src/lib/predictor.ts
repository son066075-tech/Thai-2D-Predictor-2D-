import { format, isBefore, set, addDays, isAfter } from 'date-fns';

export type Session = 'morning' | 'evening';

export interface Prediction {
  id: string;
  date: string;
  session: Session;
  numbers: string[];
  timestamp: number;
}

export const getNextSession = (now: Date = new Date()): { session: Session; time: Date } => {
  const morningCutoff = set(now, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
  const eveningCutoff = set(now, { hours: 16, minutes: 30, seconds: 0, milliseconds: 0 });

  if (isBefore(now, morningCutoff)) {
    return { session: 'morning', time: morningCutoff };
  } else if (isBefore(now, eveningCutoff)) {
    return { session: 'evening', time: eveningCutoff };
  } else {
    // Tomorrow morning
    return { session: 'morning', time: set(addDays(now, 1), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }) };
  }
};

export const generatePredictions = (session: Session, date: string): string[] => {
  // Use a seed based on date and session to make it consistent for the same day/session
  const seed = `${date}-${session}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const random = () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return (hash >>> 0) / 4294967296;
  };

  const numbers: string[] = [];
  while (numbers.length < 5) {
    const num = Math.floor(random() * 100).toString().padStart(2, '0');
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers;
};
