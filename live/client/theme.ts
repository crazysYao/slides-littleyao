export const C = {
  bg: '#f2f3f5',
  text: '#1d2129',
  accent: '#2f7bf6',
  muted: '#7a808a',
  panel: '#ffffff',
  line: '#e3e5e8',
  good: '#10b981',
  bad: '#ef4444',
  warn: '#f59e0b',
  radius: 28,
  font: '"PingFang TC", "Noto Sans TC", system-ui, sans-serif',
} as const;

export const STUDENT_SITE = 'slides.littleyao.me';

export const studentPath = (deckId: string) => `/s/${deckId}`;

export const studentUrl = (deckId: string, code: string) => `https://${STUDENT_SITE}${studentPath(deckId)}?s=${code}`;
