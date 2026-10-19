// 產生北科大課程的 Synora deck.json。內容移植自 backup/ntut-live-f4b9be9 的 open-slide 版。
// 用法：node build-deck.mjs <輸出路徑>
import { writeFileSync } from 'node:fs';

const W = 960;
const PAD = 70;
const CW = W - PAD * 2;

const C = {
  bg: '#f2f3f5',
  text: '#1d2129',
  accent: '#2f7bf6',
  muted: '#7a808a',
  panel: '#ffffff',
  line: '#e3e5e8',
  why: '#f59e0b',
  whyNot: '#ef4444',
  better: '#10b981',
  dark: '#1d2129',
  darkSub: '#b8bcc4',
};

const LH = 1.5;

// 中英混排的粗估寬度：全形字 1em，半形 0.55em
const textWidth = (s, size) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? size : size * 0.55), 0);
const lineCount = (s, size, width) => s.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(textWidth(l, size) / width)), 0);

let slideId;
let seq;
const el = (type, props) => ({ id: `${slideId}-${type}-${++seq}`, type, ...props });

const text = (x, y, width, content, { size = 20, color = C.text, bold = false, align = 'left', height } = {}) =>
  el('text', {
    x,
    y,
    width,
    height: height ?? Math.ceil(lineCount(content, size, width) * size * LH),
    content,
    fontSize: size,
    color,
    bold,
    italic: false,
    underline: false,
    textAlign: align,
    fontFamily: '',
  });

const box = (x, y, width, height, background, borderRadius = 0) =>
  el('shape', { x, y, width, height, shapeType: 'rectangle', background, borderRadius });

const textH = (content, size, width) => Math.ceil(lineCount(content, size, width) * size * LH);

// ── 元件 ──────────────────────────────────────────

const header = (section) => [
  box(0, 0, W, 44, C.panel),
  box(0, 44, W, 1, C.line),
  box(PAD, 18, 8, 8, '#22c55e', 4),
  text(PAD + 16, 10, 400, `提問力 · ${section}`, { size: 13, color: C.muted, height: 24 }),
];

const H = (y, content, size = 36) => text(PAD, y, CW, content, { size, bold: true });

const note = (y, content) => text(PAD, y, CW, content, { size: 20, color: C.muted });

const pill = (x, y, content, color) => {
  const w = Math.ceil(textWidth(content, 15)) + 32;
  return [box(x, y, w, 30, color, 15), text(x, y + 5, w, content, { size: 15, color: '#fff', bold: true, align: 'center', height: 22 })];
};

// 聊天氣泡：回傳 [元素, 下一個 y]
const bubble = (y, from, content, tint) => {
  const size = 19;
  const maxInner = 560;
  const inner = Math.min(maxInner, Math.ceil(textWidth(content, size)) + 4);
  const h = textH(content, size, inner) + 26;
  const w = inner + 36;
  const me = from === 'me';
  const x = me ? PAD + CW - w : PAD + 42;
  const els = [
    box(x, y, w, h, me ? (tint ?? C.accent) : C.panel, 18),
    text(x + 18, y + 13, inner, content, { size, color: me ? '#fff' : C.text }),
  ];
  if (!me) {
    els.unshift(box(PAD, y + h - 32, 32, 32, C.text, 16), text(PAD, y + h - 26, 32, 'AI', { size: 12, color: '#fff', bold: true, align: 'center', height: 20 }));
  }
  return [els, y + h];
};

const bubbles = (y, items, gap = 14) => {
  const out = [];
  for (const [from, content, tint] of items) {
    const [els, next] = bubble(y, from, content, tint);
    out.push(...els);
    y = next + gap;
  }
  return [out, y];
};

const card = (x, y, w, h, color, title, body) => [
  box(x, y, w, h, C.panel, 14),
  box(x, y, w, 6, color, 3),
  text(x + 24, y + 26, w - 48, title, { size: 21, color, bold: true }),
  text(x + 24, y + 64, w - 48, body, { size: 18 }),
];

const cards = (y, h, items) => {
  const gap = 20;
  const w = (CW - gap * (items.length - 1)) / items.length;
  return items.flatMap(([color, title, body], i) => card(PAD + i * (w + gap), y, w, h, color, title, body));
};

const numRow = (y, color, q, body) => [
  box(PAD, y, CW, 56, C.panel, 12),
  box(PAD, y, 6, 56, color),
  text(PAD + 26, y + 14, 220, q, { size: 21, color, bold: true, height: 30 }),
  text(PAD + 250, y + 15, CW - 270, body, { size: 19, height: 28 }),
];

const term = (y, name, body) => [
  text(PAD, y, 120, name, { size: 20, color: C.accent, bold: true, height: 30 }),
  text(PAD + 130, y, CW - 130, body, { size: 20, height: 30 }),
];

const list = (y, items, ordered) =>
  text(PAD + 10, y, CW - 10, items.map((s, i) => `${ordered ? `${i + 1}.` : '•'} ${s}`).join('\n'), { size: 20 });

const taskHeader = (tag, title) => [...pill(PAD, 76, tag, C.text), H(118, title)];

// ── 頁面 ──────────────────────────────────────────

const pages = [];
const page = (id, title, notes, build, background = C.bg) => pages.push({ id, title, notes, build, background });

const framed = (section, body) => () => [...header(section), ...body()];

page('cover', '封面', '開場：今天不教工具，教你怎麼問。主標語先放著，最後回來。', () => [
  text(80, 120, 800, '北科大 AI 新秀課 · 2026.11.26', { size: 14, color: C.muted }),
  text(80, 160, 800, '為什麼、為什麼不、\n有沒有更好的', { size: 64, bold: true }),
  text(80, 362, 800, 'AI 時代的提問力', { size: 24, bold: true }),
  ...pill(80, 416, '為什麼？', C.why),
  ...pill(190, 416, '為什麼不用 X？', C.whyNot),
  ...pill(340, 416, '有沒有更好的方法？', C.better),
]);

const agendaRow = (y, no, title, time, desc) => [
  box(PAD, y, CW, 84, C.panel, 12),
  text(PAD + 24, y + 20, 70, no, { size: 32, color: C.accent, bold: true, height: 44 }),
  text(PAD + 110, y + 12, 400, title, { size: 24, bold: true, height: 34 }),
  text(PAD + 520, y + 18, 200, time, { size: 15, color: C.muted, height: 24 }),
  text(PAD + 110, y + 48, 600, desc, { size: 17, color: C.muted, height: 26 }),
];

page('agenda', '今天的三節課', '三節都照「好奇 → 反轉 → 優化」走：思維、關鍵字、討論與應用。', framed('今天的課', () => [
  H(76, '今天的三節課'),
  ...agendaRow(150, '01', '思維：三個問題', '09:00–09:50', '好奇 → 反轉攻防 → 優化'),
  ...agendaRow(250, '02', '關鍵字：用三問學 AI', '10:00–10:55', 'Prompt / Context / Skill / MCP / Agent'),
  ...agendaRow(350, '03', '討論與應用', '11:05–12:00', '把三問用在你自己想學的技能'),
]));

const divider = (no, title, time, sub) => () => [
  text(80, 110, 800, no, { size: 80, color: C.accent, bold: true }),
  text(80, 240, 800, title, { size: 55, bold: true }),
  text(80, 330, 800, time, { size: 18, color: C.muted }),
  text(80, 380, 800, sub, { size: 20 }),
];

const poll = (id, question, options, multiSelect = false) =>
  el('poll', {
    x: PAD,
    y: 54,
    width: CW,
    height: 476,
    question,
    options: options.map((t, i) => ({ id: `${id}-opt${i + 1}`, text: t })),
    multiSelect,
    maxSelect: 0,
  });

const quiz = (id, question, options, correct) =>
  el('quiz', {
    x: PAD,
    y: 54,
    width: CW,
    height: 476,
    question,
    options: options.map((t, i) => ({ id: `${id}-opt${i + 1}`, text: t, correct: i === correct })),
    multiple: false,
    points: 5,
    speedBonus: true,
    speedDecay: 0.02,
  });

const leaderboard = () =>
  el('leaderboard', { x: PAD, y: 54, width: CW, height: 476, lbMode: 'personal', lbTopN: 10, lbShowGroups: true, interactiveType: '' });

const qDetail = (color, tag, q, ai, me, noteText) =>
  framed('01 思維', () => {
    const [bs, y] = bubbles(196, [['ai', ai], ['me', me, color]]);
    return [...pill(PAD, 76, tag, color), text(PAD, 116, CW, q, { size: 48, color, bold: true }), ...bs, note(y + 16, noteText)];
  });

const breakPage = (back) => () => [
  text(0, 190, W, '休息 10 分鐘', { size: 70, color: '#fff', bold: true, align: 'center' }),
  text(0, 310, W, `${back} 回來`, { size: 22, color: C.darkSub, align: 'center' }),
];

// 第一節
page('s1', '第一節：思維', '09:00–09:50。先不談工具，先談你怎麼問。', divider('01', '思維：三個問題', '09:00–09:50', '先不談工具，先談你怎麼問'));

page('s1-poll-hands', '投票：沒舉手的經驗', '09:00 開場投票(5)。先不評論結果，只說「等一下會回來看這兩題」。', framed('01 思維', () => [
  poll('s1-poll-hands', '上課時，你有過有問題卻沒舉手的經驗嗎？', ['有', '沒有', '常常']),
]));

page('s1-poll-start', '投票：怎麼開始學', '先不評論，記住大家的學法，案例段會回來對照。', framed('01 思維', () => [
  poll('s1-poll-start', '學一個新技能，你通常怎麼開始？', ['找線上課從頭看', '先動手做', '問人', '問 AI']),
]));

page('past', '以前：提問發生在課堂上', '09:05 反轉(10)。回扣第一題：舉手要勇氣，所以過去「敢問」是一種優點。', framed('01 思維', () => [
  H(76, '以前：提問發生在課堂上'),
  list(160, ['全班都看著你舉手', '怕問題太簡單、怕被笑', '所以「敢問」是一種優點']),
]));

page('now', '現在：提問發生在你和 AI 之間', '提問從課堂移到「你和 AI 之間」，不用是大 E 人，沒人會笑你。', framed('01 思維', () => {
  const [bs, y] = bubbles(160, [['me', '這個問題會不會很白癡？'], ['ai', '不會。我們一起拆解看看。']]);
  return [H(76, '現在：提問發生在你和 AI 之間'), ...bs, note(y + 24, '不用是大 E 人，也沒有人會笑你。')];
}));

page('reversal-1', '以前缺的是勇氣', '勇氣不再是門檻，差距只剩問題的品質。先停在這句，下一頁揭曉。', () => [
  text(80, 200, 800, '以前缺的是勇氣，', { size: 55, color: C.muted, bold: true }),
]);

page('reversal-2', '現在缺的是好問題', '帶出主標語：以前缺的是勇氣，現在缺的是好問題。', () => [
  text(80, 160, 800, '以前缺的是勇氣，', { size: 55, color: C.muted, bold: true }),
  text(80, 250, 520, '現在缺的是', { size: 55, bold: true }),
  text(80 + 55 * 5, 250, 400, '好問題。', { size: 55, color: C.accent, bold: true }),
]);

page('good-bad', '好問題 vs 壞問題', '好問題會拋磚引玉，壞問題讓人覺得沒內容。', framed('01 思維', () => [
  H(76, '好問題 vs 壞問題'),
  ...cards(160, 150, [[C.better, '好問題', '拋磚引玉，讓討論往下走'], [C.whyNot, '壞問題', '讓人覺得沒內容，對話就停了']]),
  note(350, '差距在於：你會不會判斷什麼是好問題。'),
]));

page('three', '好問題，來自三個問法', '09:15 三問(15)。為什麼？為什麼不用 X？有沒有更好的方法？', framed('01 思維', () => [
  H(76, '好問題，來自三個問法'),
  ...cards(170, 150, [
    [C.why, '為什麼？', '好奇心\n驅動你不斷探索'],
    [C.whyNot, '為什麼不用 X？', '反轉攻防\n挑戰理所當然'],
    [C.better, '有沒有更好的方法？', '優化思維\n好還要更好'],
  ]),
]));

page('why', '第一問：為什麼？', '好奇心驅動探索，「多問一個為什麼」。',
  qDetail(C.why, '第一問 · 好奇心', '為什麼？', '建議你先做一個小作品。', '為什麼？先做有什麼好處？', '多問一個為什麼，答案就從「結論」變成「理由」。'));
page('why-not', '第二問：為什麼不用 X？', '反轉與攻防：「很明顯可以用 X，那為什麼不用？」',
  qDetail(C.whyNot, '第二問 · 反轉攻防', '為什麼不用 X？', '這份報表可以用 Excel 函數完成。', '很明顯可以用 Python 自動化，那為什麼不用？', '反轉一下，逼出取捨與限制。'));
page('better', '第三問：有沒有更好的方法？', '優化思維：好還要更好，不好的被汰換。',
  qDetail(C.better, '第三問 · 優化思維', '有沒有更好的方法？', '這是一份三個月的學習計畫。', '有沒有更好的方法？幫我找出最弱的地方。', '好的再更好，不好的就汰換。'));

page('multiply', '好奇心 × 優化思維', '乘法關係：只好奇＝到處看看；只優化＝原地打磨。三行依序講。', framed('01 思維', () => [
  H(76, '好奇心 × 優化思維'),
  ...numRow(170, C.why, '只好奇，不優化', '到處看看'),
  ...numRow(242, C.better, '只優化，不好奇', '原地打磨'),
  ...numRow(314, C.accent, '兩個相乘', '越問越深，越做越好'),
]));

page('case-compare', '案例：學一個新技能', '09:30 案例(8)。我的學法：找一套線上課從頭看到尾；AI 的學法：先做小作品，卡住再查。', framed('01 思維', () => [
  H(76, '案例：學一個新技能'),
  ...cards(160, 150, [[C.muted, '我的學法', '找一套線上課，從頭看到尾'], [C.accent, 'AI 的學法', '先做一個小作品，卡住再查']]),
  note(350, '你有自己的做法，AI 給了你不知道的做法，問題就出現了。'),
]));

page('case-ask', '這時候，三問就派上用場', '示範三問。重點：你有自己的做法，AI 給了你不知道的做法，問題就出現了。', framed('01 思維', () => {
  const [bs] = bubbles(150, [
    ['ai', '建議你先做一個小作品，卡住再查。'],
    ['me', '為什麼要先做？', C.why],
    ['me', '為什麼不先看完課？', C.whyNot],
    ['me', '有沒有更快的學法？', C.better],
  ]);
  return [H(76, '這時候，三問就派上用場'), ...bs];
}));

page('practice-v1', '實作：你的學習計畫 v1', '09:38 實作(8)。寫下想學的技能，問 AI「我該怎麼學 ＿＿？」存下來就是 v1，先不要改。', framed('01 思維', () => [
  ...taskHeader('實作 · 8 分鐘', '你的學習計畫 v1'),
  list(190, ['寫下一個你想學的技能', '問 AI：「我該怎麼學 ＿＿？」', '把回答存起來，這就是 v1', '先不要改，第三節會回來升級'], true),
]));

const BETTER_A = 'A：怎麼學 Python？';
const BETTER_B = 'B：我會 Excel，想三個月內做出自動化報表。為什麼你建議先做小作品，而不是先看課？';

page('s1-poll-better', '投票：哪個問法比較好', '09:46 投票(4)。等大家投完再公布，下一頁解析。', framed('01 思維', () => [
  poll('s1-poll-better', '哪個問法比較好？', [BETTER_A, BETTER_B]),
]));

const voteBase = () => {
  const [bs, y] = bubbles(160, [['me', BETTER_A], ['me', BETTER_B]]);
  return [[...pill(PAD, 76, '投票解析', C.accent), text(PAD, 112, CW, '哪個問法比較好？', { size: 30, bold: true }), ...bs], y];
};

page('s1-vote-analysis', '投票解析', '先讓大家看兩個問法，下一頁揭曉解析。', framed('01 思維', () => voteBase()[0]));
page('s1-vote-answer', '投票解析：B 好在哪', 'B 好在有背景、有目標，還帶了一個「為什麼」。', framed('01 思維', () => {
  const [els, y] = voteBase();
  return [...els, note(y + 20, 'B 好在：有背景、有目標，還帶了一個「為什麼」。')];
}));

page('break1', '休息', '休息 09:50–10:00。', breakPage('10:00'), C.dark);

// 第二節
page('s2', '第二節：關鍵字', '10:00–10:55。這一節本身就是「學新技能」示範：用三問把 AI 關鍵字一個一個問出來。',
  divider('02', '關鍵字：用三問學 AI', '10:00–10:55', '這一節，就是一次「學新技能」的示範'));

const WARMUP = [
  ['主標語：「以前缺的是＿＿，現在缺的是好問題。」', ['勇氣', '時間', '工具', '錢'], 0],
  ['「很明顯可以用 X，那為什麼不用？」屬於哪一問？', ['為什麼？', '為什麼不用 X？', '有沒有更好的方法？'], 1],
  ['只好奇、不優化，會變成？', ['到處看看', '原地打磨', '越問越好', '什麼都沒做'], 0],
  ['「怎麼學 Python？」這個問法缺了什麼？', ['背景與目標', '禮貌', '英文關鍵字', '更多字數'], 0],
];
const REVIEW = [
  ['給 AI 的背景資訊叫什麼？', ['Prompt', 'Context', 'Skill', 'Agent'], 1],
  ['把一套好問法打包、重複使用的是？', ['Prompt', 'MCP', 'Skill', 'Agent'], 2],
  ['讓 AI 接上外部工具和資料的是？', ['Context', 'Skill', 'MCP', 'Agent'], 2],
  ['讓 AI 自己規劃步驟、自己去做的是？', ['Prompt', 'MCP', 'Skill', 'Agent'], 3],
  ['講師 Demo 中，A–E 五個主題全被否決的原因？', ['太難', '不夠「是我」', '時間不夠', '學生不會喜歡'], 1],
];

const quizPages = (prefix, label, items, firstNote) =>
  items.forEach(([q, opts, correct], i) => {
    const id = `${prefix}-${i + 1}`;
    page(id, `${label} ${i + 1}/${items.length}`, `${i === 0 ? `${firstNote} ` : ''}正解：${opts[correct]}`, framed('02 關鍵字', () => [quiz(id, q, opts, correct)]));
  });

quizPages('s2-quiz-warmup', '暖身搶答', WARMUP, '10:00 暖身搶答(5)。');
page('s2-board-warmup', '暖身排行榜', '暖身搶答結果。', framed('02 關鍵字', () => [leaderboard()]));

page('prompt-context', 'Prompt / Context', '10:05 為什麼？→ Prompt / Context(12)。先拋問題：同一個 AI 答案差很多，差在哪？再講 Prompt 是指令、Context 是背景。', framed('02 關鍵字', () => [
  ...pill(PAD, 76, '為什麼？', C.why),
  H(116, '為什麼同一個 AI，有人問得出好答案？'),
  ...term(200, 'Prompt', '你給 AI 的指令'),
  ...term(244, 'Context', '你給 AI 的背景'),
  note(320, '問題講得越清楚，答案就越好。'),
]));

const BEFORE = '我該怎麼學 Python？';
const AFTER = '我是剛畢業的商管系學生，會 Excel，想三個月內做出自動化報表。我該怎麼學 Python？';
page('context-practice', '小練習：幫 v1 補上背景', '小練習 4 分鐘：把 v1 補上「我是誰、我會什麼、目標是什麼」，比較回答差在哪。下一頁看補完的樣子。', framed('02 關鍵字', () => {
  const [bs, y] = bubbles(190, [['me', BEFORE, C.muted]]);
  return [...taskHeader('小練習 · 4 分鐘', '幫 v1 補上背景'), ...bs, note(y + 20, '補上三件事：我是誰、我會什麼、目標是什麼。')];
}));
page('context-practice-after', '小練習：補完背景之後', '對照：補完背景的問法。', framed('02 關鍵字', () => {
  const [bs, y] = bubbles(190, [['me', BEFORE, C.muted], ['me', AFTER]]);
  return [...taskHeader('小練習 · 4 分鐘', '幫 v1 補上背景'), ...bs, note(y + 20, '補上三件事：我是誰、我會什麼、目標是什麼。')];
}));

page('skill', 'Skill', '10:17 為什麼不只靠 Prompt？→ Skill(12)。反轉：每次都重打一長串背景，為什麼不打包？Gemini Gems 已改名 Gemini Skills。', framed('02 關鍵字', () => [
  ...pill(PAD, 76, '為什麼不只靠 Prompt？', C.whyNot),
  H(116, '每次重打一長串背景，為什麼不打包起來？'),
  ...term(200, 'Skill', '把一套好問法，打包成可重複用的能力'),
  list(260, ['同一類問題重複問，就該打包', '下次一句話就能叫出來']),
  text(PAD, 480, CW, '補充：Gemini 的 Gems 預計 11/17 改名為 Gemini Skills', { size: 14, color: C.muted }),
]));

const node = (x, y, label, strong) => {
  const w = Math.ceil(textWidth(label, 17)) + 28;
  return [[box(x, y, w, 38, strong ? C.accent : C.panel, 8), text(x, y + 8, w, label, { size: 17, color: strong ? '#fff' : C.text, bold: true, align: 'center', height: 24 })], x + w];
};
const flowRow = (y, label, parts) => {
  const out = [text(PAD, y + 9, 150, label, { size: 17, bold: true, height: 26 })];
  let x = PAD + 160;
  for (const p of parts) {
    if (p === '→' || p === '⇄') {
      out.push(text(x + 6, y + 4, 24, p, { size: 20, color: C.muted, align: 'center', height: 30 }));
      x += 36;
    } else {
      const [els, nx] = node(x, y, p.replace('*', ''), p.endsWith('*'));
      out.push(...els);
      x = nx;
    }
  }
  return out;
};

page('mcp-agent', 'MCP / Agent', '10:29 有沒有更好的方法？→ MCP / Agent(10)。問了還要自己查、自己貼，有沒有更好的？MCP 是插座，Agent 自己規劃去做。', framed('02 關鍵字', () => [
  ...pill(PAD, 76, '有沒有更好的方法？', C.better),
  H(116, '問完還要自己查、自己貼？'),
  ...flowRow(190, 'Prompt', ['你', '→', 'AI*']),
  ...flowRow(242, 'Skill', ['你', '→', '打包好的問法', '→', 'AI*']),
  ...flowRow(294, 'MCP / Agent', ['你', '→', 'AI*', '⇄', '工具與資料']),
  ...term(370, 'MCP', '讓 AI 接上外部工具和資料的插座'),
  ...term(410, 'Agent', '讓 AI 自己規劃步驟、自己去做'),
]));

page('demo', 'Demo：這堂課是怎麼備出來的', '10:39 講師 Demo(9)。展示備課對話：A–E 主題被否決，因為不夠「是我」；順序從工具→思維改成思維→工具。展示 memory：AI 記住上次討論到哪。', framed('02 關鍵字', () => {
  const [bs] = bubbles(140, [
    ['ai', '這裡有五個主題候選，A 到 E。'],
    ['me', '都不夠「是我」。為什麼不先挖我的觀點？', C.whyNot],
    ['ai', '建議先講關鍵字，再講思維。'],
    ['me', '有沒有更好的順序？先講思維，開場才是我。', C.better],
  ], 10);
  return [H(76, 'Demo：這堂課是怎麼備出來的'), ...bs, note(480, 'AI 用 memory 記住上次討論到哪，下次直接接續。')];
}));

quizPages('s2-quiz-review', '關鍵字複習', REVIEW, '10:48 搶答(7)。');
page('s2-board-review', '關鍵字複習排行榜', '關鍵字複習結果。', framed('02 關鍵字', () => [leaderboard()]));

page('break2', '休息', '休息 10:55–11:05。', breakPage('11:05'), C.dark);

// 第三節
page('s3', '第三節：討論與應用', '11:05–12:00。把三問用在自己想學的技能。', divider('03', '討論與應用', '11:05–12:00', '把三問用在你自己想學的技能'));

page('s3-poll-repeat', '投票：重複問幾次', '11:05 投票(3)。重複問很多次的，就是值得打包成 Skill 的。', framed('03 討論與應用', () => [
  poll('s3-poll-repeat', '同一類問題，你重複問過 AI 幾次？', ['1 次', '2–5 次', '5 次以上', '沒注意過']),
]));

page('main-practice', '主實作：v1 → v3', '11:08 主實作(15)。拿出 v1，依序問三問，產出 v3。', framed('03 討論與應用', () => [
  ...taskHeader('主實作 · 15 分鐘', 'v1 → v3：用三問跟 AI 攻防'),
  ...numRow(200, C.why, '為什麼？', '追問 AI 建議背後的理由'),
  ...numRow(272, C.whyNot, '為什麼不用 X？', '拿你原本的學法挑戰 AI'),
  ...numRow(344, C.better, '有沒有更好的方法？', '要 AI 自我批判、給第二版'),
]));

page('pair-talk', '兩兩討論', '11:23 兩兩討論(10)。交換計畫，用「為什麼不用 X」挑戰對方，選出最佳攻防。', framed('03 討論與應用', () => [
  ...taskHeader('兩兩討論 · 10 分鐘', '互相挑戰對方的計畫'),
  list(190, ['交換你們的學習計畫', '用「為什麼不用 X？」挑戰對方', '選出一個「最佳攻防」', '準備給全班投票'], true),
]));

page('my-skill', '把三問寫成你的個人 Skill', '11:33 實作(10)。把三問寫成個人 Skill，定稿學習計畫。', framed('03 討論與應用', () => [
  ...taskHeader('實作 · 10 分鐘', '把三問寫成你的個人 Skill'),
  box(PAD, 190, CW, 200, C.dark, 14),
  text(PAD + 28, 212, CW - 56, '我想學 ＿＿。我的背景是 ＿＿，目標是 ＿＿。', { size: 18, color: C.bg }),
  text(PAD + 28, 252, CW - 56, '每次給建議時，請說明為什麼；', { size: 18, color: C.why }),
  text(PAD + 28, 292, CW - 56, '列出一個常見替代做法，說明為什麼不選它；', { size: 18, color: C.whyNot }),
  text(PAD + 28, 332, CW - 56, '最後告訴我有沒有更好的方法。', { size: 18, color: C.better }),
]));

page('s3-poll-best', '投票：最佳攻防', '11:43 投票＋收尾(7)。組別選項當天依分組改。', framed('03 討論與應用', () => [
  poll('s3-poll-best', '哪一組的攻防最精彩？', ['第 1 組', '第 2 組', '第 3 組', '第 4 組']),
]));

page('s3-poll-exit', '出口票', '出口票。投完發三問卡。', framed('03 討論與應用', () => [
  poll('s3-poll-exit', '今天你最記得哪一問？', ['為什麼？', '為什麼不用 X？', '有沒有更好的方法？']),
]));

const closingPills = () => [...pill(80, 430, '為什麼？', C.why), ...pill(190, 430, '為什麼不用 X？', C.whyNot), ...pill(340, 430, '有沒有更好的方法？', C.better)];

page('closing-1', '那個沒舉手的你', '回扣開場：還記得第一題嗎？停在這句，下一頁揭曉。', () => [
  text(80, 140, 800, '還記得開場那一題嗎？', { size: 18, color: C.muted }),
  text(80, 190, 800, '那個沒舉手的你，', { size: 48, bold: true }),
  ...closingPills(),
]);
page('closing-2', '現在只需要好問題', '那個沒舉手的你，現在不用勇氣了，只需要好問題。', () => [
  text(80, 140, 800, '還記得開場那一題嗎？', { size: 18, color: C.muted }),
  text(80, 190, 800, '那個沒舉手的你，', { size: 48, bold: true }),
  text(80, 270, 800, '現在不用勇氣了，只需要', { size: 48, bold: true }),
  text(80 + 48 * 11, 270, 240, '好問題。', { size: 48, color: C.accent, bold: true }),
  ...closingPills(),
]);

page('qa', 'Q & A', '11:50 QA(10)。', () => [
  text(0, 170, W, 'Q & A', { size: 75, color: '#fff', bold: true, align: 'center' }),
  text(0, 300, W, '現在，換你問了。', { size: 24, color: C.darkSub, align: 'center' }),
], C.dark);

// ── 輸出 ──────────────────────────────────────────

const slides = pages.map((p, i) => {
  slideId = p.id;
  seq = 0;
  return { id: p.id, slideNumber: i + 1, title: p.title, description: '', background: p.background, notes: p.notes, elements: p.build() };
});

const out = process.argv[2];
if (!out) throw new Error('用法：node build-deck.mjs <輸出路徑>');
writeFileSync(out, `${JSON.stringify({ sections: [], slides }, null, 2)}\n`);
console.log(`${slides.length} 頁 → ${out}`);
