export type Role = 'teacher' | 'student';

export type InteractionDef = {
  id: string;
  kind: 'poll' | 'quiz';
  question: string;
  options: string[];
  seconds?: number;
};

export type InteractionStatus = 'idle' | 'open' | 'closed' | 'revealed';

export type Interaction = InteractionDef & {
  status: InteractionStatus;
  openedAt?: number;
  correct?: number;
  answers: Record<string, { choice: number; at: number }>;
  awarded?: Record<string, number>;
};

export type Nav = {
  pageId: string;
  step: number;
  teacherOnly: boolean;
  title: string;
  note: string;
  interaction?: string;
  index?: number;
  total?: number;
};

export type RemoteCmd = 'next' | 'prev' | 'switch-session';

export type LeaderRow = { name: string; score: number };

export type SessionState = {
  sessionId: string;
  deckId: string;
  createdAt: number;
  nav: Nav | null;
  participants: Record<string, { name: string; score: number }>;
  interactions: Record<string, Interaction>;
  activeId: string | null;
  view: 'question' | 'leaderboard';
};

export type TeacherView = SessionState & {
  counts: Record<string, number[]>;
  answered: Record<string, number>;
  leaderboard: LeaderRow[];
};

export type StudentView = {
  nav: Nav | null;
  defs: Record<string, InteractionDef>;
  revealed: Record<string, { counts: number[]; correct?: number }>;
  me: { name: string; score: number } | null;
  active: {
    def: InteractionDef;
    status: InteractionStatus;
    openedAt?: number;
    myChoice?: number;
    counts?: number[];
    correct?: number;
  } | null;
  view: 'question' | 'leaderboard';
  leaderboard?: LeaderRow[];
  myRank?: number;
};

export type ClientMsg =
  | { t: 'join'; pid: string; name: string }
  | { t: 'answer'; iid: string; choice: number }
  | { t: 'define'; defs: (InteractionDef & { correct?: number })[] }
  | { t: 'nav'; nav: Nav }
  | { t: 'open' | 'close' | 'reveal' | 'reset'; iid: string }
  | { t: 'view'; view: 'question' | 'leaderboard' }
  | { t: 'remote'; cmd: RemoteCmd };

export type ServerMsg =
  | { t: 'state'; state: TeacherView | StudentView; now: number }
  | { t: 'remote'; cmd: RemoteCmd }
  | { t: 'error'; reason: string };
