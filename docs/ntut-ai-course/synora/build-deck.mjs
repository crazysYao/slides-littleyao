// 產生北科大課程的 Synora deck.json：只管版面，文字內容在 content.mjs。
// 用法：node build-deck.mjs <輸出路徑> [內容檔，預設 ./content.mjs]
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const { pages, brand = '提問力', palette = {} } = await import(process.argv[3] ? pathToFileURL(process.argv[3]).href : './content.mjs');

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
  ...palette,
};

// 主題可覆寫：ink＝某填色上的文字色，hue＝某顏色拿來當文字時改用的色，bgFor＝特定版型的底色
const ink = (fill) => C.ink?.[fill] ?? '#fff';
const hue = (color) => C.hue?.[color] ?? color;

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
  box(PAD, 18, 8, 8, C.dot ?? '#22c55e', 4),
  text(PAD + 16, 10, 400, `${brand} · ${section}`, { size: 13, color: C.muted, height: 24 }),
];

const H = (y, content, size = 36) => {
  const title = text(PAD, y, CW, content, { size, bold: true });
  return C.titleBar ? [title, box(PAD, y + size * LH + 2, 48, 6, C.titleBar, 3)] : title;
};

const note = (y, content) => text(PAD, y, CW, content, { size: 20, color: C.muted });

const pill = (x, y, content, color) => {
  const w = Math.ceil(textWidth(content, 15)) + 32;
  return [box(x, y, w, 30, color, 15), text(x, y + 5, w, content, { size: 15, color: ink(color), bold: true, align: 'center', height: 22 })];
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
    text(x + 18, y + 13, inner, content, { size, color: me ? ink(tint ?? C.accent) : C.text }),
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
  text(x + 24, y + 26, w - 48, title, { size: 21, color: hue(color), bold: true }),
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
  text(PAD + 26, y + 14, 220, q, { size: 21, color: hue(color), bold: true, height: 30 }),
  text(PAD + 250, y + 15, CW - 270, body, { size: 19, height: 28 }),
];

const term = (y, name, body) => [
  text(PAD, y, 120, name, { size: 20, color: hue(C.accent), bold: true, height: 30 }),
  text(PAD + 130, y, CW - 130, body, { size: 20, height: 30 }),
];

const list = (y, items, ordered) =>
  text(PAD + 10, y, CW - 10, items.map((s, i) => `${ordered ? `${i + 1}.` : '•'} ${s}`).join('\n'), { size: 20 });

const taskHeader = (tag, title) => [...pill(PAD, 76, tag, C.text), H(118, title)];

const agendaRow = (y, no, title, time, desc) => [
  box(PAD, y, CW, 84, C.panel, 12),
  text(PAD + 24, y + 20, 70, no, { size: 32, color: hue(C.accent), bold: true, height: 44 }),
  text(PAD + 110, y + 12, 400, title, { size: 24, bold: true, height: 34 }),
  text(PAD + 520, y + 18, 200, time, { size: 15, color: C.muted, height: 24 }),
  text(PAD + 110, y + 48, 600, desc, { size: 17, color: C.muted, height: 26 }),
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

const link = (x, y, width, [linkUrl, linkLabel, linkDesc]) =>
  el('link', { x, y, width, height: 110, linkUrl, linkLabel, linkDesc, linkColor: C.accent, linkIcon: 'open_in_new', linkImage: '' });

const checkpoint = (y, question, buttonLabel) => el('checkpoint', { x: PAD, y, width: CW, height: 530 - y, question, buttonLabel });

const copycard = (y, title, content) => el('copycard', { x: PAD, y, width: CW, height: 530 - y, title, content, copied: false });

const fileDownload = (y, [fileUrl, fileName, fileSize, fileType]) =>
  el('fileDownload', { x: PAD, y, width: CW, height: 110, fileUrl, fileName, fileSize, fileType });

const wordcloud = (question, maxWords) => el('wordcloud', { x: PAD, y: 54, width: CW, height: 476, question, maxWords });

const webProject = (question) =>
  el('webProject', { x: PAD, y: 54, width: CW, height: 476, question, enabledMethods: ['upload', 'url'], showVoting: true, peerVoteCount: 3 });

const leaderboard = () =>
  el('leaderboard', { x: PAD, y: 54, width: CW, height: 476, lbMode: 'personal', lbTopN: 10, lbShowGroups: true, interactiveType: '' });

const node = (x, y, label, strong) => {
  const w = Math.ceil(textWidth(label, 17)) + 28;
  return [[box(x, y, w, 38, strong ? C.accent : C.panel, 8), text(x, y + 8, w, label, { size: 17, color: strong ? ink(C.accent) : C.text, bold: true, align: 'center', height: 24 })], x + w];
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

const threePills = (y, items) => {
  let x = 80;
  return items.flatMap(([color, label]) => {
    const els = pill(x, y, label, C[color]);
    x += els[0].width + 18;
    return els;
  });
};

const tinted = (items) => items.map(([from, content, tint]) => [from, content, tint && C[tint]]);

const colored = (items) => items.map(([color, ...rest]) => [C[color], ...rest]);

// ── 版型：content.mjs 每頁的 layout 對應到這裡 ──────────

const layouts = {
  cover: (p) => [
    text(80, 120, 800, p.date, { size: 14, color: C.muted }),
    text(80, 160, 800, p.heading, { size: 64, bold: true }),
    text(80, 362, 800, p.subtitle, { size: 24, bold: true }),
    ...threePills(416, p.pills),
  ],
  agenda: (p) => [H(76, p.heading), ...p.rows.flatMap((r, i) => agendaRow(150 + i * 100, ...r))],
  divider: (p) => [
    text(80, 110, 800, p.no, { size: 80, color: hue(C.accent), bold: true }),
    text(80, 240, 800, p.heading, { size: 55, bold: true }),
    text(80, 330, 800, p.time, { size: 18, color: C.muted }),
    text(80, 380, 800, p.sub, { size: 20 }),
  ],
  poll: (p) => [poll(p.id, p.question, p.options)],
  quiz: (p) => [quiz(p.id, p.question, p.options, p.correct)],
  leaderboard: () => [leaderboard()],
  list: (p) => [H(76, p.heading), list(160, p.items)],
  chat: (p) => {
    const [bs, y] = bubbles(160, tinted(p.bubbles));
    return [H(76, p.heading), ...bs, note(y + 24, p.note)];
  },
  chatSteps: (p) => {
    const [bs] = bubbles(150, tinted(p.bubbles));
    return [H(76, p.heading), ...bs];
  },
  demo: (p) => {
    const [bs] = bubbles(140, tinted(p.bubbles), 10);
    return [H(76, p.heading), ...bs, note(480, p.note)];
  },
  reversal: (p) =>
    p.lead
      ? [
          text(80, 160, 800, p.before, { size: 55, color: C.muted, bold: true }),
          text(80, 250, 520, p.lead, { size: 55, bold: true }),
          text(80 + 55 * [...p.lead].length, 250, 400, p.punch, { size: 55, color: hue(C.accent), bold: true }),
        ]
      : [text(80, 200, 800, p.before, { size: 55, color: C.muted, bold: true })],
  compare: (p) => [H(76, p.heading), ...cards(160, 150, colored(p.cards)), note(350, p.note)],
  three: (p) => [H(76, p.heading), ...cards(170, 150, colored(p.cards))],
  question: (p) => {
    const color = C[p.color];
    const [bs, y] = bubbles(196, p.bubbles ? tinted(p.bubbles) : [['ai', p.ai], ['me', p.me, color]]);
    return [...pill(PAD, 76, p.tag, color), text(PAD, 116, CW, p.question, { size: 48, color: hue(color), bold: true }), ...bs, note(y + 16, p.note)];
  },
  rows: (p) => [H(76, p.heading), ...colored(p.rows).flatMap((r, i) => numRow(170 + i * 72, ...r))],
  taskRows: (p) => [...taskHeader(p.tag, p.heading), ...colored(p.rows).flatMap((r, i) => numRow(200 + i * 72, ...r))],
  task: (p) => [...taskHeader(p.tag, p.heading), list(190, p.items, true)],
  voteReveal: (p) => {
    const [bs, y] = bubbles(160, tinted(p.options.map((o) => ['me', ...[o].flat()])));
    const els = [...pill(PAD, 76, p.tag, C.accent), text(PAD, 112, CW, p.question, { size: 30, bold: true }), ...bs];
    return p.answer ? [...els, note(y + 20, p.answer)] : els;
  },
  break: (p) => [
    text(0, 190, W, p.heading, { size: 70, color: '#fff', bold: true, align: 'center' }),
    text(0, 310, W, `${p.back} 回來`, { size: 22, color: C.darkSub, align: 'center' }),
  ],
  promptContext: (p) => [
    ...pill(PAD, 76, p.tag[1], C[p.tag[0]]),
    H(116, p.heading),
    ...p.terms.flatMap(([name, body], i) => term(200 + i * 44, name, body)),
    note(320, p.note),
  ],
  contextPractice: (p) => {
    const [bs, y] = bubbles(190, [['me', p.before, C.muted], ...(p.after ? [['me', p.after]] : [])]);
    return [...taskHeader(p.tag, p.heading), ...bs, note(y + 20, p.note)];
  },
  skill: (p) => [
    ...pill(PAD, 76, p.tag[1], C[p.tag[0]]),
    H(116, p.heading),
    ...term(200, ...p.term),
    list(260, p.items),
  ],
  mcpAgent: (p) => [
    ...pill(PAD, 76, p.tag[1], C[p.tag[0]]),
    H(116, p.heading),
    ...p.flows.flatMap(([label, parts], i) => flowRow(190 + i * 52, label, parts)),
    ...p.terms.flatMap(([name, body], i) => term(370 + i * 40, name, body)),
  ],
  // lines 第三欄是範例，有範例時每行下面多一行灰字
  skillTemplate: (p) => {
    const gap = p.lines.some((l) => l[2]) ? 62 : 40;
    return [
      ...taskHeader(p.tag, p.heading),
      box(PAD, 190, CW, 200, C.dark, 14),
      ...p.lines.flatMap(([color, s, example], i) => [
        text(PAD + 28, 212 + i * gap, CW - 56, s, { size: 18, color: C[color] }),
        ...(example ? [text(PAD + 28, 238 + i * gap, CW - 56, example, { size: 15, color: C.darkSub })] : []),
      ]),
      ...(p.note ? [note(410, p.note)] : []),
    ];
  },
  // ── 版面變化：時間軸、左右分割、大編號步驟、資料夾磚、前後對照、深色提問 ──
  timeline: (p) => {
    const gap = CW / p.rows.length;
    return [
      H(76, p.heading),
      box(PAD, 268, CW, 4, C.text, 2),
      ...p.rows.flatMap(([no, title, time, desc], i) => {
        const x = PAD + i * gap;
        return [
          text(x, 210, gap - 20, time, { size: 16, color: C.muted, height: 26 }),
          box(x, 242, 56, 56, C.accent, 28),
          text(x, 256, 56, no, { size: 20, color: ink(C.accent), bold: true, align: 'center', height: 30 }),
          text(x, 320, gap - 30, title, { size: 24, bold: true }),
          text(x, 362, gap - 30, desc, { size: 17, color: C.muted }),
        ];
      }),
    ];
  },
  split: (p) => {
    let y = 120;
    const rows = p.items.flatMap((s, i) => {
      const h = Math.max(36, textH(s, 21, 430));
      const els = [
        box(400, y, 36, 36, C.accent, 18),
        text(400, y + 6, 36, String(i + 1), { size: 17, color: ink(C.accent), bold: true, align: 'center', height: 26 }),
        text(456, y + 2, 430, s, { size: 21 }),
      ];
      y += h + 30;
      return els;
    });
    return [
      box(0, 45, 340, 495, C.accent),
      text(48, 110, 260, p.kicker, { size: 16, color: ink(C.accent), bold: true, height: 26 }),
      text(48, 150, 260, p.heading, { size: 36, color: ink(C.accent), bold: true }),
      ...rows,
    ];
  },
  steps: (p) => {
    const gap = 18;
    const w = (CW - gap * (p.items.length - 1)) / p.items.length;
    return [
      ...(p.tag ? taskHeader(p.tag, p.heading) : [H(76, p.heading)]),
      ...p.items.flatMap(([title, body], i) => {
        const x = PAD + i * (w + gap);
        const y = p.tag ? 210 : 170;
        return [
          box(x, y, w, 250, C.panel, 14),
          text(x + 22, y + 20, w - 44, String(i + 1).padStart(2, '0'), { size: 44, color: C.accent, bold: true, height: 60 }),
          text(x + 22, y + 92, w - 44, title, { size: 21, bold: true }),
          text(x + 22, y + 92 + textH(title, 21, w - 44) + 8, w - 44, body, { size: 17, color: C.muted }),
        ];
      }),
    ];
  },
  // 藍圖：上方三節、中間五格流程(含 Agent ⇄ 知識庫回圈)、下方三個 Prompt
  blueprint: (p) => {
    const nw = 118;
    const gap = (CW - nw * 5) / 4;
    const nx = (i) => PAD + i * (nw + gap);
    const fills = { key: C.accent, opt: C.line };
    return [
      H(76, p.heading),
      ...p.sections.flatMap(([label, time, from, to]) => {
        const x = nx(from);
        const w = nx(to) + nw - x;
        return [
          box(x, 152, w, 4, C.text, 2),
          text(x, 162, w, label, { size: 15, bold: true, height: 22 }),
          text(x, 184, w, time, { size: 12, color: C.muted, height: 18 }),
        ];
      }),
      ...p.nodes.flatMap(([title, sub, kind], i) => [
        box(nx(i), 222, nw, 92, fills[kind] ?? C.panel, 12),
        text(nx(i), 236, nw, title, { size: 18, color: kind === 'key' ? ink(C.accent) : C.text, bold: true, align: 'center', height: 26 }),
        text(nx(i), 266, nw, sub, { size: 12, color: kind === 'key' ? ink(C.accent) : C.muted, align: 'center', height: 40 }),
      ]),
      ...p.arrows.flatMap((label, i) => [
        text(nx(i) + nw, 238, gap, label, { size: 12, color: C.muted, align: 'center', height: 18 }),
        text(nx(i) + nw, 254, gap, '→', { size: 22, bold: true, align: 'center', height: 30 }),
      ]),
      text(nx(1), 326, nx(2) + nw - nx(1), p.loop, { size: 13, bold: true, align: 'center', height: 22 }),
      ...p.prompts.flatMap(([name, desc], i) => {
        const w = (CW - 24) / 3;
        const x = PAD + i * (w + 12);
        return [
          box(x, 380, w, 46, C.dark, 10),
          text(x + 14, 393, 90, name, { size: 14, color: C.accent, bold: true, height: 22 }),
          text(x + 100, 393, w - 112, desc, { size: 14, color: C.panel, height: 22 }),
        ];
      }),
      note(456, p.note),
    ];
  },
  blanks: (p) => {
    const gap = 18;
    const w = (CW - gap * 2) / 3;
    return [
      H(76, p.heading),
      box(PAD, 150, CW, 96, C.dark, 14),
      ...p.prompt.map((line, i) => text(PAD + 28, 166 + i * 32, CW - 56, line, { size: 19, color: C.panel })),
      ...p.items.flatMap(([title, body], i) => {
        const x = PAD + i * (w + gap);
        return [
          box(x, 266, w, 200, C.panel, 14),
          box(x + 22, 286, 40, 40, C.accent, 20),
          text(x + 22, 293, 40, String(i + 1), { size: 20, color: ink(C.accent), bold: true, align: 'center', height: 28 }),
          text(x + 76, 292, w - 98, title, { size: 21, bold: true }),
          text(x + 22, 346, w - 44, body, { size: 17, color: C.muted }),
        ];
      }),
      ...(p.note ? [note(482, p.note)] : []),
    ];
  },
  grid: (p) => {
    const gap = 20;
    const w = (CW - gap * 2) / 3;
    return [
      H(76, p.heading),
      ...p.tiles.flatMap(([title, desc], i) => {
        const x = PAD + (i % 3) * (w + gap);
        const y = 160 + Math.floor(i / 3) * 170;
        return [
          box(x, y, 90, 18, C.accent, 6),
          box(x, y + 12, w, 136, C.panel, 10),
          text(x + 22, y + 36, w - 44, title, { size: 22, bold: true }),
          text(x + 22, y + 74, w - 44, desc, { size: 16, color: C.muted }),
        ];
      }),
    ];
  },
  beforeAfter: (p) => {
    const w = 360;
    const [bl, bt, bb] = p.before;
    const [al, at, ab] = p.after;
    const R = PAD + CW - w;
    return [
      H(76, p.heading),
      box(PAD, 170, w, 220, C.line, 14),
      text(PAD + 26, 190, w - 52, bl, { size: 15, color: C.muted, bold: true, height: 24 }),
      text(PAD + 26, 222, w - 52, bt, { size: 23, color: C.muted, bold: true }),
      text(PAD + 26, 270, w - 52, bb, { size: 17, color: C.muted }),
      text(PAD + w, 252, CW - 2 * w, '→', { size: 40, bold: true, align: 'center', height: 56 }),
      box(R - 4, 166, w + 8, 228, C.accent, 17),
      box(R, 170, w, 220, C.panel, 14),
      text(R + 26, 190, w - 52, al, { size: 15, color: hue(C.accent), bold: true, height: 24 }),
      text(R + 26, 222, w - 52, at, { size: 23, bold: true }),
      text(R + 26, 270, w - 52, ab, { size: 17 }),
      note(420, p.note),
    ];
  },
  darkQuestion: (p) => {
    const [bs, y] = bubbles(120 + textH(p.question, 52, CW) + 24, tinted(p.bubbles));
    return [
      ...pill(PAD, 76, p.tag, C.accent),
      text(PAD, 120, CW, p.question, { size: 52, color: C.accent, bold: true }),
      ...bs,
      text(PAD, y + 20, CW, p.note, { size: 21, color: C.darkSub }),
    ];
  },
  goal: (p) => [
    H(76, p.heading),
    link(PAD, 160, CW / 2 - 10, p.link),
    ...card(PAD + CW / 2 + 10, 160, CW / 2 - 10, 110, C[p.card[0]], p.card[1], p.card[2]),
    note(300, p.note),
  ],
  linkTask: (p) => [...taskHeader(p.tag, p.heading), link(PAD, 190, CW, p.link), list(330, p.items, true)],
  wordcloud: (p) => [wordcloud(p.question, p.maxWords)],
  links: (p) => [
    ...taskHeader(p.tag, p.heading),
    ...p.links.map((l, i) => link(PAD + i * (CW / 2 + 10), 200, CW / 2 - 10, l)),
    note(340, p.note),
  ],
  taskCheck: (p) => [...taskHeader(p.tag, p.heading), list(190, p.items, true), checkpoint(200 + textH(p.items.join('\n'), 20, CW) + 20, ...p.check)],
  taskDownload: (p) => [...taskHeader(p.tag, p.heading), fileDownload(190, p.file), list(330, p.items, true)],
  copyPrompt: (p) => [...taskHeader(p.tag, p.heading), copycard(190, p.cardTitle, p.prompt)],
  webProject: (p) => [webProject(p.question)],
  closing: (p) => [
    text(80, 140, 800, p.kicker, { size: 18, color: C.muted }),
    text(80, 190, 800, p.before, { size: 48, bold: true }),
    ...(p.lead
      ? [
          text(80, 270, 800, p.lead, { size: 48, bold: true }),
          ...(C.mark ? [box(80 + 48 * [...p.lead].length, 270 + 40, 48 * [...p.punch].length, 26, C.mark)] : []),
          text(80 + 48 * [...p.lead].length, 270, 240, p.punch, { size: 48, color: hue(C.accent), bold: true }),
        ]
      : []),
    ...threePills(430, p.pills),
  ],
  bigPrompt: (p) => {
    const w = Math.ceil(textWidth(p.prompt, 48)) + 96;
    return [
      text(0, 170, W, p.caption, { size: 18, color: C.muted, align: 'center', height: 28 }),
      box((W - w) / 2, 220, w, 110, C.dark, 28),
      text((W - w) / 2, 246, w, p.prompt, { size: 48, color: '#fff', bold: true, align: 'center', height: 72 }),
    ];
  },
  reveal: (p) => {
    const w = Math.ceil(textWidth(p.punch, 54)) + 32;
    return [
      text(0, 120, W, p.ask, { size: 22, color: C.muted, bold: true, align: 'center', height: 34 }),
      text(0, 190, W, p.lead, { size: 54, bold: true, align: 'center', height: 81 }),
      box((W - w) / 2, 282, w, 84, C.mark ?? C.accent, 8),
      text(0, 282, W, p.punch, { size: 54, color: ink(C.mark ?? C.accent), bold: true, align: 'center', height: 81 }),
      text(0, 410, W, p.sub, { size: 22, color: C.muted, align: 'center', height: 34 }),
    ];
  },
  loop: (p) => {
    const [cx, cy, r] = [400, 335, 135];
    const nw = 136;
    const at = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
    const arc = (from, to) => {
      const [x1, y1] = at(from);
      const [x2, y2] = at(to);
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${C.text}" stroke-width="2.5" fill="none" marker-end="url(#ar)"/>`;
    };
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="540" viewBox="0 0 ${W} 540" preserveAspectRatio="none"><defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.text}"/></marker></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line}" stroke-width="20"/>${[-90, 0, 90, 180].map((d) => arc(d + 32, d + 90 - 30)).join('')}<path d="M172 ${cy - r} L${cx - nw / 2 - 6} ${cy - r}" stroke="${C.text}" stroke-width="2.5" marker-end="url(#ar)"/></svg>`;
    const centers = [at(-90), at(0), at(90), at(180)];
    const nodes = p.steps.flatMap(([title, sub], i) => {
      const [x, y] = centers[i];
      const last = i === p.steps.length - 1;
      const fill = last ? C.dark : C.accent;
      return [
        box(x - nw / 2, y - 32, nw, 64, fill, 10),
        text(x - nw / 2, y - 24, nw, title, { size: 19, color: last ? '#fff' : ink(fill), bold: true, align: 'center', height: 28 }),
        text(x - nw / 2, y + 4, nw, sub, { size: 12, color: last ? C.darkSub : ink(fill), align: 'center', height: 18 }),
      ];
    });
    const RX = 630;
    const RW = W - PAD - RX;
    let y = 150;
    const side = [text(RX, 122, RW, p.cardsTitle, { size: 13, color: C.muted, bold: true, height: 20 })];
    for (const [title, body] of p.cards) {
      const h = 46 + textH(body, 14, RW - 32);
      side.push(
        box(RX, y, RW, h, C.dark, 10),
        text(RX + 16, y + 12, RW - 32, title, { size: 16, color: '#fff', bold: true, height: 24 }),
        text(RX + 16, y + 38, RW - 32, body, { size: 14, color: '#fff' }),
      );
      y += h + 12;
    }
    const cmp = p.compare.join('\n');
    side.push(box(RX, y + 4, 5, textH(cmp, 14, RW - 20) + 34, C.accent), text(RX + 16, y + 4, RW - 16, p.compareTitle, { size: 14, bold: true, height: 22 }), text(RX + 16, y + 28, RW - 16, cmp, { size: 14 }));
    return [
      el('svg', { x: 0, y: 0, width: W, height: 540, svgContent, src: "", label: "" }),
      H(62, p.heading, 30),
      box(PAD, cy - r - 26, 102, 52, C.dark, 26),
      text(PAD, cy - r - 13, 102, p.start, { size: 17, color: '#fff', bold: true, align: 'center', height: 26 }),
      ...nodes,
      text(cx - 80, cy - 24, 160, p.center, { size: 15, color: C.muted, bold: true, align: 'center', height: 48 }),
      ...side,
    ];
  },
  iconSplit: (p) => {
    const X = 370;
    const RW = W - PAD - X;
    const gap = 14;
    const cw = (RW - gap) / 2;
    const ch = 96;
    const rows = Math.ceil(p.cards.length / 2);
    const darkH = p.dark ? (p.dark[3] ? 104 : 80) : 0;
    const total = (p.link ? 124 : 0) + rows * (ch + gap) + darkH;
    let y = Math.max(64, Math.round((45 + 540 - total) / 2));
    const out = [
      box(0, 45, 340, 495, C.accent),
      text(48, 110, 260, p.kicker, { size: 16, color: ink(C.accent), bold: true, height: 26 }),
      text(48, 150, 260, p.heading, { size: 36, color: ink(C.accent), bold: true }),
    ];
    if (p.tagline) out.push(text(48, 160 + textH(p.heading, 36, 260), 260, p.tagline, { size: 17, color: ink(C.accent), bold: true }));
    if (p.link) {
      out.push(link(X, y, RW, p.link));
      y += 124;
    }
    p.cards.forEach(([icon, title, desc], i) => {
      const wide = i === p.cards.length - 1 && p.cards.length % 2 === 1;
      const x = wide || i % 2 === 0 ? X : X + cw + gap;
      const w = wide ? RW : cw;
      const cy = y + Math.floor(i / 2) * (ch + gap);
      out.push(
        box(x, cy, w, ch, C.panel, 12),
        text(x + 16, cy + 12, 40, icon, { size: 26, height: 36 }),
        text(x + 16, cy + 48, w - 32, title, { size: 17, bold: true, height: 24 }),
        text(x + 16, cy + 72, w - 32, desc, { size: 13, color: C.muted, height: 20 }),
      );
    });
    y += rows * (ch + gap);
    if (p.dark) {
      const [icon, title, desc, chips] = p.dark;
      out.push(
        box(X, y, RW, darkH, C.dark, 12),
        text(X + 16, y + 14, 40, icon, { size: 26, height: 36 }),
        text(X + 62, y + 14, RW - 78, title, { size: 17, color: '#fff', bold: true, height: 24 }),
        text(X + 62, y + 42, RW - 78, desc, { size: 13, color: C.darkSub, height: 20 }),
      );
      let cx = X + 62;
      for (const c of chips ?? []) {
        const els = pill(cx, y + 66, c, C.accent);
        out.push(...els);
        cx += els[0].width + 8;
      }
    }
    return out;
  },
  iconLinks: (p) => {
    const gap = 20;
    const cw = (CW - gap) / 2;
    const [icon, title, desc] = p.dark;
    return [
      ...taskHeader(p.tag, p.heading),
      ...p.links.flatMap(([ic, url, label, d], i) => {
        const x = PAD + i * (cw + gap);
        return [{ ...link(x, 220, cw, [url, `${ic} ${label}`, d]), linkIcon: 'download' }];
      }),
      box(PAD, 366, CW, 76, C.dark, 12),
      text(PAD + 20, 382, 40, icon, { size: 26, height: 36 }),
      text(PAD + 66, 380, CW - 86, title, { size: 19, color: '#fff', bold: true, height: 28 }),
      text(PAD + 66, 410, CW - 86, desc, { size: 14, color: C.darkSub, height: 22 }),
    ];
  },
  whoDoes: (p) => {
    const gap = 24;
    const cw = (CW - gap) / 2;
    const col = (x, c, on) => {
      const out = on ? [box(x - 3, 177, cw + 6, 286, C.accent, 15)] : [];
      out.push(
        box(x, 180, cw, 280, on ? C.panel : C.line, 12),
        text(x + 18, 194, cw - 150, `${c.icon} ${c.name}`, { size: 20, bold: true, height: 30 }),
        ...pill(x + cw - 18 - (Math.ceil(textWidth(c.count, 15)) + 32), 196, c.count, on ? C.accent : C.dark),
      );
      c.steps.forEach(([who, t], i) => {
        const y = 240 + i * 42;
        const ai = who === 'AI';
        out.push(
          box(x + 18, y + 2, 34, 22, ai ? (on ? C.accent : C.panel) : C.dark, 6),
          text(x + 18, y + 4, 34, who, { size: 12, color: ai ? (on ? ink(C.accent) : C.text) : '#fff', bold: true, align: 'center', height: 18 }),
          text(x + 62, y, cw - 80, t, { size: 15, height: 38 }),
        );
      });
      return out;
    };
    const [lead, punch] = p.bottom;
    const lw = Math.ceil(textWidth(lead, 20));
    const pw = Math.ceil(textWidth(punch, 20)) + 12;
    return [
      H(62, p.heading, 30),
      ...pill(PAD, 128, `任務：${p.task}`, C.dark),
      ...col(PAD, p.left, false),
      ...col(PAD + cw + gap, p.right, true),
      text(PAD, 482, lw, lead, { size: 20, bold: true, height: 30 }),
      box(PAD + lw, 482, pw, 30, C.mark ?? C.accent, 4),
      text(PAD + lw + 6, 482, pw, punch, { size: 20, color: ink(C.mark ?? C.accent), bold: true, height: 30 }),
    ];
  },
  qa: (p) => [
    text(0, 170, W, p.heading, { size: 75, color: '#fff', bold: true, align: 'center' }),
    text(0, 300, W, p.sub, { size: 24, color: C.darkSub, align: 'center' }),
  ],
};

const DARK = new Set(['break', 'qa', 'darkQuestion']);

// 搶答組每題展開成一頁，講稿附正解
const expand = (p) =>
  p.layout !== 'quizSet'
    ? [p]
    : p.items.map(([question, options, correct], i) => ({
        id: `${p.id}-${i + 1}`,
        layout: 'quiz',
        section: p.section,
        title: `${p.label} ${i + 1}/${p.items.length}`,
        notes: `${i === 0 ? `${p.firstNote} ` : ''}正解：${options[correct]}`,
        question,
        options,
        correct,
      }));

// ── 輸出 ──────────────────────────────────────────

const slides = pages.flatMap(expand).map((p, i) => {
  slideId = p.id;
  seq = 0;
  const body = () => layouts[p.layout](p);
  const elements = (p.section ? [...header(p.section), ...body()] : body()).flat();
  return { id: p.id, slideNumber: i + 1, title: p.title, description: '', background: C.bgFor?.[p.layout] ?? (DARK.has(p.layout) ? C.dark : C.bg), notes: p.notes, elements };
});

const out = process.argv[2];
if (!out) throw new Error('用法：node build-deck.mjs <輸出路徑> [內容檔]');
writeFileSync(out, `${JSON.stringify({ sections: [], slides }, null, 2)}\n`);
console.log(`${slides.length} 頁 → ${out}`);
