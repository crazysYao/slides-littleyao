// 暫時的元件預覽，Task 10 刪除
import type { Page, SlideMeta } from '@open-slide/core';
import { createSession, reduce, teacherView } from '../../live/shared/session.ts';
import type { ClientMsg } from '../../live/shared/protocol.ts';
import { Leaderboard } from '../../live/client/Interaction.tsx';
import { JoinBadge } from '../../live/client/JoinBadge.tsx';
import { LivePoll } from '../../live/client/LivePoll.tsx';
import { LiveQuiz } from '../../live/client/LiveQuiz.tsx';
import { type LiveStore, setCurrentStore } from '../../live/client/store.ts';

let s = createSession('K7P2QX', 'ntut-three-questions', 0);
const T = (m: ClientMsg) => (s = reduce(s, m, { role: 'teacher', now: Date.now() }));
const S = (pid: string, m: ClientMsg) => (s = reduce(s, m, { role: 'student', pid, now: Date.now() }));
T({
  t: 'define',
  defs: [
    { id: 'p1', kind: 'poll', question: '上課時，你有過有問題卻沒舉手的經驗嗎？', options: ['有', '沒有', '常常'] },
    { id: 'q1', kind: 'quiz', question: '給 AI 的背景資訊叫什麼？', options: ['Prompt', 'Context', 'Skill', 'Agent'], seconds: 20, correct: 1 },
    { id: 'q2', kind: 'quiz', question: '讓 AI 接上外部工具和資料的是？', options: ['Context', 'Skill', 'MCP', 'Agent'], seconds: 20, correct: 2 },
  ],
});
const names = ['小明', '小華', '阿美', '志強', '怡君', '家豪', '雅婷'];
names.forEach((n, i) => S(`p${i}`, { t: 'join', pid: `p${i}`, name: n }));
T({ t: 'open', iid: 'p1' });
names.forEach((_, i) => S(`p${i}`, { t: 'answer', iid: 'p1', choice: [0, 2, 0, 1, 2, 0, 2][i] }));
T({ t: 'open', iid: 'q1' });
names.forEach((_, i) => S(`p${i}`, { t: 'answer', iid: 'q1', choice: [1, 1, 0, 1, 3, 1, 2][i] }));
T({ t: 'reveal', iid: 'q1' });
T({ t: 'open', iid: 'q2' });

const view = teacherView(s);
const snap = { connected: true, view, role: 'teacher' as const };
const fake: LiveStore = {
  subscribe: () => () => {},
  getState: () => snap,
  send() {},
  close() {},
};
setCurrentStore(fake);

const wrap = { width: '100%', height: '100%', background: '#f2f3f5', padding: '72px 140px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } as const;

const PollPage: Page = () => <div style={wrap}><LivePoll id="p1" /></div>;
const QuizRevealed: Page = () => <div style={wrap}><LiveQuiz id="q1" /></div>;
const QuizOpen: Page = () => <div style={wrap}><LiveQuiz id="q2" /></div>;
const Board: Page = () => (
  <div style={wrap}>
    <Leaderboard rows={view.leaderboard} />
  </div>
);
const Badge: Page = () => (
  <div style={{ ...wrap, alignItems: 'center', justifyContent: 'center' }}>
    <JoinBadge deckId="ntut-three-questions" code="K7P2QX" size={400} />
  </div>
);

export const meta: SlideMeta = { title: 'live playground', createdAt: '2026-10-19T12:00:00.000Z' };
export default [PollPage, QuizRevealed, QuizOpen, Board, Badge] satisfies Page[];
