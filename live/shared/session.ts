import type {
  ClientMsg,
  Interaction,
  InteractionDef,
  LeaderRow,
  Role,
  SessionState,
  StudentView,
  TeacherView,
} from './protocol.ts';

const DEFAULT_QUIZ_SECONDS = 20;

export function createSession(sessionId: string, deckId: string, now: number): SessionState {
  return {
    sessionId,
    deckId,
    createdAt: now,
    nav: null,
    participants: {},
    interactions: {},
    activeId: null,
    view: 'question',
  };
}

export function quizPoints(elapsedMs: number, limitMs: number): number {
  const ratio = Math.min(1, Math.max(0, elapsedMs / limitMs));
  return Math.round(500 + 500 * (1 - ratio));
}

const limitMs = (i: InteractionDef) => (i.seconds ?? DEFAULT_QUIZ_SECONDS) * 1000;

const setInteraction = (s: SessionState, i: Interaction): SessionState => ({
  ...s,
  interactions: { ...s.interactions, [i.id]: i },
});

function addScores(s: SessionState, deltas: Record<string, number>): SessionState {
  const participants = { ...s.participants };
  for (const [pid, d] of Object.entries(deltas)) {
    const p = participants[pid];
    if (p) participants[pid] = { ...p, score: p.score + d };
  }
  return { ...s, participants };
}

export function reduce(
  s: SessionState,
  msg: ClientMsg,
  ctx: { role: Role; pid?: string; now: number },
): SessionState {
  if (ctx.role === 'student') return reduceStudent(s, msg, ctx.pid, ctx.now);
  return reduceTeacher(s, msg, ctx.now);
}

function reduceStudent(s: SessionState, msg: ClientMsg, pid: string | undefined, now: number): SessionState {
  if (!pid) return s;
  if (msg.t === 'join') {
    const name = msg.name.trim();
    if (msg.pid !== pid || name.length < 1 || [...name].length > 20) return s;
    const prev = s.participants[pid];
    return { ...s, participants: { ...s.participants, [pid]: { name, score: prev?.score ?? 0 } } };
  }
  if (msg.t === 'answer') {
    const i = s.interactions[msg.iid];
    if (!s.participants[pid] || !i || i.status !== 'open') return s;
    if (!Number.isInteger(msg.choice) || msg.choice < 0 || msg.choice >= i.options.length) return s;
    if (i.kind === 'quiz') {
      if (i.answers[pid]) return s;
      if (now - (i.openedAt ?? now) > limitMs(i)) return s;
    }
    return setInteraction(s, { ...i, answers: { ...i.answers, [pid]: { choice: msg.choice, at: now } } });
  }
  return s;
}

function reduceTeacher(s: SessionState, msg: ClientMsg, now: number): SessionState {
  switch (msg.t) {
    case 'define': {
      const interactions = { ...s.interactions };
      for (const d of msg.defs) {
        const prev = interactions[d.id];
        interactions[d.id] = prev
          ? { ...prev, ...d }
          : { ...d, status: 'idle', answers: {} };
      }
      return { ...s, interactions };
    }
    case 'nav':
      return { ...s, nav: msg.nav };
    case 'view':
      return { ...s, view: msg.view };
    case 'open': {
      const i = s.interactions[msg.iid];
      if (!i) return s;
      const next = setInteraction(s, { ...i, status: 'open', openedAt: now });
      return { ...next, activeId: i.id, view: 'question' };
    }
    case 'close': {
      const i = s.interactions[msg.iid];
      if (!i || i.status !== 'open') return s;
      return setInteraction(s, { ...i, status: 'closed' });
    }
    case 'reveal': {
      const i = s.interactions[msg.iid];
      if (!i) return s;
      if (i.status === 'revealed') return s;
      const awarded: Record<string, number> = {};
      if (i.kind === 'quiz' && i.correct !== undefined) {
        for (const [pid, a] of Object.entries(i.answers)) {
          if (a.choice === i.correct) awarded[pid] = quizPoints(a.at - (i.openedAt ?? a.at), limitMs(i));
        }
      }
      return addScores(setInteraction(s, { ...i, status: 'revealed', awarded }), awarded);
    }
    case 'reset': {
      const i = s.interactions[msg.iid];
      if (!i) return s;
      const refunds = Object.fromEntries(Object.entries(i.awarded ?? {}).map(([pid, d]) => [pid, -d]));
      const cleared: Interaction = { ...i, status: 'idle', answers: {}, awarded: {}, openedAt: undefined };
      return addScores(setInteraction(s, cleared), refunds);
    }
    default:
      return s;
  }
}

function countsOf(i: Interaction): number[] {
  const counts = i.options.map(() => 0);
  for (const a of Object.values(i.answers)) counts[a.choice]++;
  return counts;
}

function leaderboardOf(s: SessionState): (LeaderRow & { pid: string })[] {
  return Object.entries(s.participants)
    .map(([pid, p]) => ({ pid, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

const toDef = (i: Interaction): InteractionDef => ({
  id: i.id,
  kind: i.kind,
  question: i.question,
  options: i.options,
  ...(i.seconds !== undefined ? { seconds: i.seconds } : {}),
});

export function teacherView(s: SessionState): TeacherView {
  const counts: Record<string, number[]> = {};
  const answered: Record<string, number> = {};
  for (const i of Object.values(s.interactions)) {
    counts[i.id] = countsOf(i);
    answered[i.id] = Object.keys(i.answers).length;
  }
  const leaderboard = leaderboardOf(s).slice(0, 10).map(({ name, score }) => ({ name, score }));
  return { ...s, counts, answered, leaderboard };
}

export function studentView(s: SessionState, pid: string): StudentView {
  const defs: StudentView['defs'] = {};
  const revealed: StudentView['revealed'] = {};
  for (const i of Object.values(s.interactions)) {
    defs[i.id] = toDef(i);
    if (i.status === 'revealed') {
      revealed[i.id] = { counts: countsOf(i), ...(i.correct !== undefined ? { correct: i.correct } : {}) };
    }
  }
  const nav = s.nav
    ? { ...s.nav, note: '', title: s.nav.teacherOnly ? '' : s.nav.title }
    : null;
  const ai = s.activeId ? s.interactions[s.activeId] : undefined;
  const active: StudentView['active'] = ai
    ? {
        def: toDef(ai),
        status: ai.status,
        ...(ai.openedAt !== undefined ? { openedAt: ai.openedAt } : {}),
        ...(ai.answers[pid] ? { myChoice: ai.answers[pid].choice } : {}),
        ...(revealed[ai.id] ?? {}),
      }
    : null;
  const view: StudentView = {
    nav,
    defs,
    revealed,
    me: s.participants[pid] ?? null,
    active,
    view: s.view,
  };
  if (s.view === 'leaderboard') {
    const lb = leaderboardOf(s);
    view.leaderboard = lb.slice(0, 10).map(({ name, score }) => ({ name, score }));
    const rank = lb.findIndex((r) => r.pid === pid);
    if (rank >= 0) view.myRank = rank + 1;
  }
  return view;
}
