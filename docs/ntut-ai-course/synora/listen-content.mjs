// 北科大求職網站課「聽課版」：學員只聽不做，講師示範全部操作；統計互動改現場舉手。
// 內容沿用 job-site-content.mjs，這裡只寫頁序、覆寫與新頁。用法同原版：
//   node build-deck-html.mjs <輸出路徑> ./listen-content.mjs
import * as base from './job-site-content.mjs';

export const { brand, palette } = base;

const quiz = base.pages.find((p) => p.id === 's2-quiz-warmup');
const warmup = quiz.items.map(([question, options, correct], i) => ({
  id: `${quiz.id}-${i + 1}`,
  layout: 'handRaise',
  section: quiz.section,
  title: `${quiz.label}（舉手）${i + 1}/${quiz.items.length}`,
  notes: `${i === 0 ? '10:00 暖身舉手搶答(3)。每題唸完選項，請選這個答案的人舉手。 ' : ''}正解：${options[correct]}`,
  heading: question,
  options,
}));

// 頁序是白名單：原版之後新增的頁不會自動跑進聽課版
export const ORDER = [
  // 第一節：講清楚＋做出 v1
  'cover', 's1', 's1-outline', 's1-goal', 's1-login', 's1-ai-exp', 's1-paid',
  's1-problem', 's1-problem-reveal', 's1-drink', 's1-drink-reveal', 's1-gf-1', 's1-gf-2', 's1-gf-3',
  's1-interview', 's1-save',
  's2-typhoon-video', 's2-roof', 's2-typhoon', 's2-typhoon-poll', 's2-typhoon-reveal', 's2-interview', 's2-style', 's2-prompt-2',
  'break1',
  // 第二節：Skill＋改更好＋Context
  's2', ...warmup,
  's2-skill-1', 's2-skill-2', 's2-skill-3', 's2-skill-4', 's2-skill-5', 's2-skill-6', 's2-skill-7',
  's2-skill-make', 's2-skill-save', 's2-skill-find',
  's3-reel', 's3-reel-reveal', 's3-review', 's3-fix', 's3-v2-wall', 's3-public',
  's3-ctx-classes', 's3-ctx-teachers', 's3-ctx-window', 's3-ctx-reveal', 's3-newchat',
  { id: 's2-qa', layout: 'qa', section: '02 改更好', title: '舉手 QA', notes: '10:38 舉手 QA(12)。', heading: '舉手 QA', sub: '到這裡有卡住的地方，現在問。' },
  'break2',
  // 第三節：上架＋我的學習系統
  's3', 's3-drop', 's3-recap', 'qa',
];

export const OVERRIDES = {
  's1-ai-exp': { layout: 'handRaise', title: '舉手：你用 AI 做過哪些事', heading: '你用 AI 做過哪些事？（可以舉很多次）', notes: '看全班起點：每唸一項，做過的舉手。「還沒用過」多就放慢示範。' },
  's1-paid': { layout: 'handRaise', title: '舉手：有沒有付費的 AI', heading: '你有付費的 AI 服務嗎？', notes: '每唸一項，有的舉手。' },
  's2-typhoon-poll': { layout: 'handRaise', title: '舉手：你會打給哪一位', heading: '屋頂正在漏水，你會打給哪一位？', notes: '先數 A 再數 B，一面倒就是笑點。' },
  's3-v2-wall': {
    layout: 'shotPair',
    title: '講師示範：v1 → v2',
    heading: '講師示範：v1 → v2',
    shots: ['待講師提供：網站 v1 截圖', '待講師提供：網站 v2 截圖'],
    notes: '左邊是審稿前的 v1，右邊是寫完 fix: 之後的 v2。指出改了哪裡、為什麼這樣改。',
  },
};

const byId = new Map(base.pages.map((p) => [p.id, p]));
export const pages = ORDER.map((x) => (typeof x === 'string' ? { ...byId.get(x), ...OVERRIDES[x] } : x));
