// 暫時的學生版預覽，Task 10 刪除
import { type Page, type SlideMeta, Step, Steps } from '@open-slide/core';
import type { InteractionDef } from '../../live/shared/protocol.ts';
import type { LiveDeck } from '../../live/client/deck.ts';
import { LivePoll } from '../../live/client/LivePoll.tsx';
import { LiveQuiz } from '../../live/client/LiveQuiz.tsx';
import { makeStudentDeck } from '../../live/client/StudentShell.tsx';

const wrap = { width: '100%', height: '100%', background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: '72px 140px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontSize: 60 } as const;
const poll: InteractionDef = { id: 'p1', kind: 'poll', question: '上課時，你有過有問題卻沒舉手的經驗嗎？', options: ['有', '沒有', '常常'] };
const quiz: InteractionDef = { id: 'q1', kind: 'quiz', question: '給 AI 的背景資訊叫什麼？', options: ['Prompt', 'Context', 'Skill', 'Agent'], seconds: 20 };

const Cover: Page = () => <div style={wrap}>封面</div>;
const StepsPage: Page = () => (
  <div style={wrap}>
    <div>分步頁</div>
    <Steps>
      <Step><div id="step-1">第一步</div></Step>
      <Step><div id="step-2">第二步</div></Step>
    </Steps>
  </div>
);
const PollPage: Page = () => <div style={wrap}><LivePoll id="p1" def={poll} /></div>;
const QuizPage: Page = () => <div style={wrap}><LiveQuiz id="q1" def={quiz} /></div>;
const Demo: Page = () => <div style={wrap}>老師專屬 Demo</div>;

export const deck: LiveDeck = {
  deckId: 'live-playground-student',
  pages: [
    { id: 'cover', Page: Cover },
    { id: 'steps', Page: StepsPage },
    { id: 'poll', Page: PollPage, interaction: 'p1' },
    { id: 'demo', Page: Demo, teacherOnly: true },
    { id: 'quiz', Page: QuizPage, interaction: 'q1' },
  ],
  interactions: [poll, quiz],
};

export const meta: SlideMeta = { title: 'live playground student', createdAt: '2026-10-19T12:00:00.000Z' };
export default makeStudentDeck(deck, { palette: { bg: '#f2f3f5', text: '#1d2129', accent: '#2f7bf6' }, fonts: { display: 'system-ui', body: 'system-ui' }, typeScale: { hero: 150, body: 40 }, radius: 28 });
