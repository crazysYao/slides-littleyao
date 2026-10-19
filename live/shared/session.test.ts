import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ClientMsg, Role, SessionState } from './protocol.ts';
import { createSession, quizPoints, reduce, studentView, teacherView } from './session.ts';

const T = (s: SessionState, msg: ClientMsg, now = 0) => reduce(s, msg, { role: 'teacher', now });
const S = (s: SessionState, pid: string, msg: ClientMsg, now = 0) => reduce(s, msg, { role: 'student', pid, now });

const quiz = { id: 'q1', kind: 'quiz' as const, question: 'Q?', options: ['a', 'b', 'c'], seconds: 20, correct: 1 };
const poll = { id: 'p1', kind: 'poll' as const, question: 'P?', options: ['x', 'y'] };

function setup() {
  let s = createSession('S1', 'deck', 0);
  s = T(s, { t: 'define', defs: [quiz, poll] });
  s = S(s, 'p1', { t: 'join', pid: 'p1', name: '小明' });
  s = S(s, 'p2', { t: 'join', pid: 'p2', name: '小華' });
  return s;
}

test('join 空白名字被拒', () => {
  const s = S(createSession('S1', 'deck', 0), 'p1', { t: 'join', pid: 'p1', name: '  ' });
  assert.equal(s.participants.p1, undefined);
});

test('join 名字超過 20 字被拒', () => {
  const s = S(createSession('S1', 'deck', 0), 'p1', { t: 'join', pid: 'p1', name: 'x'.repeat(21) });
  assert.equal(s.participants.p1, undefined);
});

test('join 只能用自己的 pid', () => {
  const s = S(createSession('S1', 'deck', 0), 'p1', { t: 'join', pid: 'p9', name: 'a' });
  assert.equal(s.participants.p9, undefined);
});

test('重連保留分數、更新名字', () => {
  let s = setup();
  s = T(s, { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 5000);
  s = T(s, { t: 'reveal', iid: 'q1' }, 21000);
  const before = s.participants.p1.score;
  s = S(s, 'p1', { t: 'join', pid: 'p1', name: '阿明' });
  assert.equal(s.participants.p1.score, before);
  assert.equal(s.participants.p1.name, '阿明');
});

test('時間到後作答拒收', () => {
  let s = setup();
  s = T(s, { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 20001);
  assert.equal(s.interactions.q1.answers.p1, undefined);
});

test('未開放的題目拒收作答', () => {
  const s = S(setup(), 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 10);
  assert.equal(s.interactions.q1.answers.p1, undefined);
});

test('未加入的學生不能作答', () => {
  let s = T(setup(), { t: 'open', iid: 'p1' });
  s = S(s, 'ghost', { t: 'answer', iid: 'p1', choice: 0 });
  assert.equal(s.interactions.p1.answers.ghost, undefined);
});

test('超出範圍的選項被拒', () => {
  let s = T(setup(), { t: 'open', iid: 'p1' });
  s = S(s, 'p1', { t: 'answer', iid: 'p1', choice: 5 });
  assert.equal(s.interactions.p1.answers.p1, undefined);
});

test('搶答重複作答只收第一次', () => {
  let s = T(setup(), { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 0 }, 1000);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 2000);
  assert.deepEqual(s.interactions.q1.answers.p1, { choice: 0, at: 1000 });
});

test('投票可改選', () => {
  let s = T(setup(), { t: 'open', iid: 'p1' });
  s = S(s, 'p1', { t: 'answer', iid: 'p1', choice: 0 });
  s = S(s, 'p1', { t: 'answer', iid: 'p1', choice: 1 });
  assert.equal(s.interactions.p1.answers.p1.choice, 1);
});

test('關閉後拒收作答', () => {
  let s = T(setup(), { t: 'open', iid: 'p1' });
  s = T(s, { t: 'close', iid: 'p1' });
  s = S(s, 'p1', { t: 'answer', iid: 'p1', choice: 0 });
  assert.equal(s.interactions.p1.answers.p1, undefined);
});

test('公布前學生看不到票數與正解', () => {
  let s = T(setup(), { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 1000);
  const before = studentView(s, 'p1');
  assert.equal(before.active?.counts, undefined);
  assert.equal(before.active?.correct, undefined);
  assert.equal(before.active?.myChoice, 1);
  assert.deepEqual(before.revealed, {});
  assert.equal(JSON.stringify(before).includes('"correct"'), false);
  s = T(s, { t: 'reveal', iid: 'q1' }, 21000);
  const after = studentView(s, 'p1');
  assert.deepEqual(after.active?.counts, [0, 1, 0]);
  assert.equal(after.active?.correct, 1);
  assert.deepEqual(after.revealed.q1, { counts: [0, 1, 0], correct: 1 });
});

test('學生的 defs 不含正解', () => {
  const v = studentView(setup(), 'p1');
  assert.deepEqual(Object.keys(v.defs).sort(), ['p1', 'q1']);
  assert.equal('correct' in v.defs.q1, false);
});

test('quizPoints 越快越高、範圍 500–1000', () => {
  assert.equal(quizPoints(5000, 20000), 875);
  assert.equal(quizPoints(0, 20000), 1000);
  assert.equal(quizPoints(20000, 20000), 500);
});

test('reveal 計分只加一次', () => {
  let s = T(setup(), { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 5000);
  s = S(s, 'p2', { t: 'answer', iid: 'q1', choice: 0 }, 5000);
  s = T(s, { t: 'reveal', iid: 'q1' }, 21000);
  assert.equal(s.participants.p1.score, 875);
  assert.equal(s.participants.p2.score, 0);
  s = T(s, { t: 'reveal', iid: 'q1' }, 22000);
  assert.equal(s.participants.p1.score, 875);
});

test('reset 扣回分數並清空作答', () => {
  let s = T(setup(), { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p1', { t: 'answer', iid: 'q1', choice: 1 }, 5000);
  s = T(s, { t: 'reveal', iid: 'q1' }, 21000);
  s = T(s, { t: 'reset', iid: 'q1' });
  assert.equal(s.participants.p1.score, 0);
  assert.deepEqual(s.interactions.q1.answers, {});
  assert.equal(s.interactions.q1.status, 'idle');
});

test('student 不能送老師訊息', () => {
  const s = setup();
  const msgs: ClientMsg[] = [
    { t: 'open', iid: 'p1' },
    { t: 'view', view: 'leaderboard' },
    { t: 'nav', nav: { pageId: 'x', step: 0, teacherOnly: false, title: '', note: '' } },
    { t: 'define', defs: [] },
  ];
  for (const m of msgs) assert.equal(S(s, 'p1', m), s);
});

test('define 不清掉既有作答', () => {
  let s = T(setup(), { t: 'open', iid: 'p1' });
  s = S(s, 'p1', { t: 'answer', iid: 'p1', choice: 1 });
  s = T(s, { t: 'define', defs: [quiz, poll] });
  assert.equal(s.interactions.p1.answers.p1.choice, 1);
  assert.equal(s.interactions.p1.status, 'open');
});

test('open 設為目前題目並回到題目畫面', () => {
  let s = T(setup(), { t: 'view', view: 'leaderboard' });
  s = T(s, { t: 'open', iid: 'q1' }, 42);
  assert.equal(s.activeId, 'q1');
  assert.equal(s.view, 'question');
  assert.equal(s.interactions.q1.openedAt, 42);
});

test('teacherOnly 頁的 nav 不洩漏標題與講稿', () => {
  const s = T(setup(), { t: 'nav', nav: { pageId: 'demo', step: 0, teacherOnly: true, title: 'Demo', note: '秘密講稿' } });
  const v = studentView(s, 'p1');
  assert.equal(v.nav?.note, '');
  assert.equal(v.nav?.title, '');
  assert.equal(v.nav?.pageId, 'demo');
});

test('一般頁學生也看不到講稿', () => {
  const s = T(setup(), { t: 'nav', nav: { pageId: 'cover', step: 1, teacherOnly: false, title: '封面', note: '講稿' } });
  assert.equal(studentView(s, 'p1').nav?.note, '');
});

test('排行榜只在 leaderboard 畫面給學生，並含自己的名次', () => {
  let s = T(setup(), { t: 'open', iid: 'q1' }, 0);
  s = S(s, 'p2', { t: 'answer', iid: 'q1', choice: 1 }, 1000);
  s = T(s, { t: 'reveal', iid: 'q1' }, 21000);
  assert.equal(studentView(s, 'p1').leaderboard, undefined);
  s = T(s, { t: 'view', view: 'leaderboard' });
  const v = studentView(s, 'p1');
  assert.equal(v.leaderboard?.[0].name, '小華');
  assert.equal(v.myRank, 2);
});

test('teacherView 有票數、作答數與排行榜', () => {
  let s = T(setup(), { t: 'open', iid: 'p1' });
  s = S(s, 'p1', { t: 'answer', iid: 'p1', choice: 1 });
  const v = teacherView(s);
  assert.deepEqual(v.counts.p1, [0, 1]);
  assert.equal(v.answered.p1, 1);
  assert.equal(v.leaderboard.length, 2);
  assert.equal(v.interactions.q1.correct, 1);
});

test('排行榜最多 10 人、同分依名字排序', () => {
  let s = createSession('S1', 'deck', 0);
  for (let i = 0; i < 12; i++) s = S(s, `p${i}`, { t: 'join', pid: `p${i}`, name: `n${String(i).padStart(2, '0')}` });
  const lb = teacherView(s).leaderboard;
  assert.equal(lb.length, 10);
  assert.equal(lb[0].name, 'n00');
});

test('未知訊息原樣回傳', () => {
  const s = setup();
  const role: Role = 'teacher';
  assert.equal(reduce(s, { t: 'bogus' } as unknown as ClientMsg, { role, now: 0 }), s);
});
