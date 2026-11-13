import { readFileSync } from 'node:fs';
// 求職網站簡報的版型：每個版型回傳 { body: HTML 片段, natives: 原生元件, loop?: 是否循環示意 }。
import { esc, splitSteps, chips } from './html-kit.mjs';
import { contextLayouts } from './html-context.mjs';
import { skillLayouts } from './html-skill.mjs';

const title = (s, d = 0) => `<h1 class="t in" style="--d:${d}s">${esc(s)}</h1>`;

// 示意畫面一行：[文字, 色鍵] 片段；y＝要學員做的動作（亮起的格子），g＝成功，m＝次要
const seg = ([t, c]) => (c === 'y' ? `<span class="slot">${esc(t)}</span>` : c ? `<span class="${c}">${esc(t)}</span>` : esc(t));
const mockRow = (line, i, last) => {
  const segs = typeof line === 'string' ? [[line]] : line;
  if (last && segs.length === 1 && segs[0][1] === 'm') {
    return `<span class="done ln r${i}">${esc(segs[0][0])}</span>`;
  }
  const html = segs.map(seg).join('');
  // 每行用自己的 9 秒時間軸（r1、r2…），每一輪都重新逐行出現；第一行一開始就在
  return i === 0 ? `<div>${html}</div>` : `<div class="ln r${i}">${html}</div>`;
};

const COPY = { x: 44, y: 160, w: 330, h: 350 };
const WIN = { x: 420, y: 160, w: 496, h: 350 };

const d = (i, base = 0.15, step = 0.08) => `--d:${(base + i * step).toFixed(2)}s`;
// 內容檔用顏色代號（accent、dark、muted、text）；黃色上面一律放黑字
const fill = (P, key) => P[key] ?? key;
const onFill = (P, key) => (P.ink?.[fill(P, key)] ?? (key === 'accent' ? P.text : '#fff'));

// 風格縮圖：引用 Eric 新竹簡報 jj-site-styles 的 8 種風格樣式
const STYLE_CSS = `.sm { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 12px; font-size: 10px; line-height: 1.2; isolation: isolate; } .sm-page { position: relative; z-index: 1; display: grid; height: 100%; grid-template-columns: 1.1fr 1fr; grid-template-rows: 1fr auto; gap: 8px; padding: 12px 14px; } .sm-hero { display: flex; flex-direction: column; justify-content: center; gap: 6px; } .sm-name { font-size: 17px; font-weight: 800; white-space: nowrap; } .sm-sub { display: block; height: 5px; width: 70%; border-radius: 3px; background: currentColor; opacity: 0.3; } .sm-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 6px; } .sm-card { display: block; } .sm-c1 { grid-row: span 2; } .sm-btn { align-self: end; justify-self: start; padding: 4px 10px; font-size: 9px; font-weight: 700; } .sm-deco { position: absolute; pointer-events: none; } .sm-A { background: #f5f5f7; color: #1d1d1f; } .sm-A .sm-hero { border-radius: 14px; background: #fff; padding: 8px; } .sm-A .sm-card { border-radius: 12px; background: #fff; } .sm-A .sm-c3 { background: #1d1d1f; } .sm-A .sm-btn { border-radius: 999px; background: #1d1d1f; color: #fff; } .sm-B { background: linear-gradient(135deg, #7dd3fc, #a78bfa 55%, #f9a8d4); color: #0f172a; } .sm-B .sm-hero, .sm-B .sm-card { border: 1px solid rgb(255 255 255 / 0.55); border-radius: 14px; background: rgb(255 255 255 / 0.22); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7); backdrop-filter: blur(10px); } .sm-B .sm-hero { padding: 8px; } .sm-B .sm-btn { border: 1px solid rgb(255 255 255 / 0.7); border-radius: 999px; background: rgb(255 255 255 / 0.35); } .sm-B .sm-d1 { top: -20%; right: 10%; width: 45%; height: 70%; border-radius: 50%; background: #f472b6; filter: blur(18px); opacity: 0.6; z-index: 0; } .sm-C { background: #ffde59; color: #111; } .sm-C .sm-name { transform: rotate(-2deg); font-family: "Archivo Black", sans-serif; } .sm-C .sm-card { border: 2px solid #111; background: #fff; box-shadow: 4px 4px 0 #111; } .sm-C .sm-btn { border: 2px solid #111; background: #ff5757; box-shadow: 3px 3px 0 #111; } .sm-D { background: #eef2ff; color: #3730a3; } .sm-D .sm-card, .sm-D .sm-btn { border-radius: 14px; box-shadow: 5px 5px 12px rgb(99 102 241 / 0.25), inset -3px -3px 6px rgb(0 0 0 / 0.08), inset 3px 3px 6px rgb(255 255 255 / 0.8); } .sm-D .sm-c1 { background: #c7d2fe; } .sm-D .sm-c2 { background: #fde68a; } .sm-D .sm-c3 { background: #a7f3d0; } .sm-D .sm-btn { border-radius: 999px; background: #fbcfe8; } .sm-D .sm-name { font-family: "Fredoka", "Nunito", sans-serif; } .sm-E { background: #07070b; color: #f4f4f5; } .sm-E .sm-d1 { top: -30%; left: -10%; width: 60%; height: 90%; border-radius: 50%; background: #8b5cf6; filter: blur(22px); opacity: 0.55; z-index: 0; } .sm-E .sm-d2 { bottom: -40%; left: 25%; width: 55%; height: 90%; border-radius: 50%; background: #22d3ee; filter: blur(22px); opacity: 0.45; z-index: 0; } .sm-E .sm-name { background: linear-gradient(90deg, #fff, #67e8f9); -webkit-background-clip: text; background-clip: text; color: transparent; } .sm-E .sm-card { border: 1px solid rgb(255 255 255 / 0.1); border-radius: 8px; background: rgb(17 17 24 / 0.8); } .sm-E .sm-btn { border-radius: 6px; background: #fff; color: #000; box-shadow: 0 0 12px rgb(255 255 255 / 0.4); } .sm-F { background: #f4f1ea; color: #111; } .sm-F .sm-name { color: #e63312; font-size: 20px; letter-spacing: -0.04em; } .sm-F .sm-card { border-top: 1px solid #111; background: transparent; } .sm-F .sm-btn { padding: 0; border-bottom: 1px solid #111; } .sm-G { background: radial-gradient(circle at 70% 20%, #2a1a3d, #0b0b12 70%); color: #fff; } .sm-G .sm-name { background: linear-gradient(180deg, #fff, #9ca3af 50%, #f3f4f6 60%, #6b7280); -webkit-background-clip: text; background-clip: text; color: transparent; font-family: "Unbounded", "Syne", sans-serif; } .sm-G .sm-card { border: 1px solid transparent; border-radius: 10px; background: linear-gradient(#14141f, #14141f) padding-box, linear-gradient(120deg, #ff71ce, #01cdfe, #05ffa1, #b967ff) border-box; } .sm-G .sm-btn { border-radius: 999px; background: linear-gradient(120deg, #ff71ce, #01cdfe, #b967ff); color: #0b0b12; } .sm-G .sm-d1 { top: 12%; right: 8%; width: 8px; height: 8px; background: #fff; clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); } .sm-H { background: #1a1c2c; color: #f4f4f4; font-family: "Press Start 2P", ui-monospace, monospace; } .sm-H .sm-name { font-size: 11px; color: #ffcd75; } .sm-H .sm-card { background: #333c57; box-shadow: 0 -2px 0 #f4f4f4, 0 2px 0 #f4f4f4, -2px 0 0 #f4f4f4, 2px 0 0 #f4f4f4; } .sm-H .sm-c2 { background: repeating-linear-gradient(90deg, #38b764 0 6px, transparent 6px 8px) 3px 40% / 70% 5px no-repeat, #333c57; } .sm-H .sm-btn { background: #ef7d57; color: #1a1c2c; font-size: 7px; box-shadow: 0 2px 0 #b13e53; } .sm-H .sm-d1 { inset: 0; background: repeating-linear-gradient(0deg, rgb(0 0 0 / 0.25) 0 1px, transparent 1px 3px); z-index: 2; } .sg{position:absolute;left:44px;right:44px;top:120px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px 14px} .st{opacity:0;animation:up .5s ease-out forwards} .st .lab{display:flex;align-items:baseline;gap:6px;margin-top:5px} .st .cd{font:800 13px 'JetBrains Mono',monospace;color:#fff;background:#0F3D38;border-radius:3px;padding:0 5px} .st .nmz{font-size:13.5px;font-weight:800;color:#0F3D38} .st .vb{font-size:11.5px;color:#38524D;margin-top:1px} .sm{box-shadow:0 4px 12px rgba(15,61,56,.12)}`;
const styleTile = (code, who) =>
  `<div class="sm sm-${code}"><div class="sm-page"><div class="sm-hero"><span class="sm-name">${esc(who)}</span><span class="sm-sub"></span></div><div class="sm-grid"><span class="sm-card sm-c1"></span><span class="sm-card sm-c2"></span><span class="sm-card sm-c3"></span></div><span class="sm-btn">Contact</span></div><span class="sm-deco sm-d1"></span><span class="sm-deco sm-d2"></span></div>`;

export const layouts = {
  cover: (p, { palette: P }) => ({
    body:
      `<div class="in" style="position:absolute;left:80px;top:118px;font-size:15px;font-weight:700;letter-spacing:.12em;color:${P.text}">${esc(p.date)}</div>` +
      `<div class="in" style="position:absolute;left:80px;top:156px;right:80px;font-size:66px;font-weight:900;line-height:1.25;color:${P.text};${d(1)}">${esc(p.heading)}</div>` +
      `<div class="in" style="position:absolute;left:80px;top:336px;right:80px;font-size:24px;font-weight:700;color:${P.text};${d(2)}">${esc(p.subtitle)}</div>` +
      `<div style="position:absolute;left:80px;top:400px;display:flex;gap:14px">${p.pills
        .map(([c, label], i) => `<span class="in" style="${d(i, 0.4)};background:${fill(P, c)};color:${onFill(P, c)};font-size:16px;font-weight:700;border-radius:99px;padding:6px 18px">${esc(label)}</span>`)
        .join('')}</div>`,
  }),

  // 條列對照：每列白卡＋左色條，左邊粗體標籤、右邊說明，依序浮上
  rows: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      `<div style="position:absolute;left:44px;right:44px;top:124px;display:grid;gap:10px">${p.rows
        .map(
          ([c, q, body], i) =>
            `<div class="in" style="${d(i)};display:flex;align-items:center;gap:20px;background:#fff;border:1.5px solid ${P.line};border-left:8px solid ${fill(P, c)};border-radius:8px;padding:12px 20px">` +
            `<b style="flex:0 0 230px;font-size:21px;font-weight:900">${esc(q)}</b><span style="font-size:19px;line-height:1.5;color:${P.text}">${esc(body)}</span></div>`,
        )
        .join('')}</div>`,
  }),

  // 連結任務：標籤＋標題 → 原生連結 → 編號步驟卡
  linkTask: (p, { palette: P, n }) => ({
    body:
      `<div class="in" style="position:absolute;left:44px;top:56px;font-size:13px;font-weight:700;color:#fff;background:${P.dark};border-radius:99px;padding:4px 12px">${esc(p.tag)}</div>` +
      `<h1 class="t in" style="top:88px;${d(0, 0.08)}">${esc(p.heading)}</h1>` +
      (p.items ? `<div style="position:absolute;left:44px;right:44px;top:290px;display:grid;grid-template-columns:repeat(${p.items.length},1fr);gap:16px">${p.items
        .map(
          (s, i) =>
            `<div class="card in" style="${d(i, 0.3)};height:200px"><div style="width:34px;height:34px;border-radius:17px;background:${P.accent};color:${P.text};font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">${i + 1}</div><p style="color:${P.text};font-size:18px">${esc(s)}</p></div>`,
        )
        .join('')}</div>` : ''),
    natives: [n.link(44, 160, 872, 110, p.link)],
  }),


  // 操作頁（Eric jj-setup1）：膠囊步驟 → 左：要按的複製卡 → 箭頭 → 右：貼上後會看到的示意畫面（循環）
  copyMock: (p, { n }) => {
    const { label, steps } = splitSteps(p.cardTitle, p.tag);
    const rows = p.mock.map((line, i) => mockRow(line, i, i === p.mock.length - 1)).join('');
    const body =
      title(p.heading) +
      chips(steps) +
      `<div class="arw in" style="left:${COPY.x + COPY.w + 8}px;top:${COPY.y + COPY.h / 2 - 14}px;--d:.35s"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>` +
      `<div class="win in" style="left:${WIN.x}px;top:${WIN.y}px;width:${WIN.w}px;height:${WIN.h}px;--d:.4s"><div class="tb"><i></i><i></i><i></i>${esc(p.mockTitle)}<span class="tag">示意畫面</span></div><div class="scr">${rows}</div></div>`;
    return { body, natives: [n.copycard(COPY.x, COPY.y, COPY.w, COPY.h, label, p.prompt)], loop: true };
  },
};

// ── 其餘版型 ──────────────────────────────────────────

const ICONS = {
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  bot: '<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.01"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  tag: '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  pen: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>',
};
const icon = (name, size, bg, fg) =>
  ICONS[name]
    ? `<span style="flex:0 0 ${size}px;width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:inline-flex;align-items:center;justify-content:center"><svg width="${size * 0.62}" height="${size * 0.62}" viewBox="0 0 24 24" fill="none" stroke="${fg}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg></span>`
    : '';
const COPY_PASTE_DEMO = readFileSync(new URL('assets/copy-paste-demo.fragment.html', import.meta.url), 'utf8');

const abs = (style, inner, i = 0, base) => `<div class="in" style="position:absolute;${style};${d(i, base)}">${inner}</div>`;
const tagPill = (P, s) => `<div class="in" style="position:absolute;left:44px;top:56px;font-size:13px;font-weight:700;color:#fff;background:${P.dark};border-radius:99px;padding:4px 12px">${esc(s)}</div>`;
const taskTitle = (s) => `<h1 class="t in" style="top:88px;${d(0, 0.08)}">${esc(s)}</h1>`;
const numCards = (P, items, top, h) =>
  `<div style="position:absolute;left:44px;right:44px;top:${top}px;display:grid;grid-template-columns:repeat(${items.length},1fr);gap:16px">${items
    .map(
      (s, i) =>
        `<div class="card in" style="${d(i, 0.3)};height:${h}px"><div style="width:34px;height:34px;border-radius:17px;background:${P.accent};color:${P.text};font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">${i + 1}</div><p style="color:${P.text};font-size:18px">${esc(s)}</p></div>`,
    )
    .join('')}</div>`;
const mark = (P, s, size) => `<span style="background:${P.accent};color:${P.text};padding:0 .2em;border-radius:6px">${esc(s)}</span>`;
const centerCol = (inner) => `<div style="position:absolute;left:60px;right:60px;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px">${inner}</div>`;
const lineIn = (i, style, inner, base = 0.1) => `<div class="in" style="${d(i, base, 0.15)};${style}">${inner}</div>`;
// 複製卡頁：標籤＋標題 → 膠囊步驟 → 原生複製卡
const copyPage = (p, { palette: P, n }) => {
  const { label, steps } = splitSteps(p.cardTitle, p.tag);
  const top = steps.length ? 186 : 150;
  return {
    body: tagPill(P, p.tag) + taskTitle(p.heading) + (steps.length ? `<div style="position:absolute;left:0;right:0;top:34px">${chips(steps, 0.2)}</div>` : ''),
    natives: [n.copycard(44, top, 872, 520 - top, label, p.prompt)],
  };
};
// 假網站手機畫面（原生 svg）
const phoneSvg = (P, site, w, h) => {
  const t = (x, y, s, size, color, bold) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-family="sans-serif"${bold ? ' font-weight="bold"' : ''}>${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  const heroH = 120;
  let out = `<rect width="${w}" height="${h}" rx="22" fill="${P.dark}"/><rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="16" fill="#fff"/><rect x="8" y="8" width="${w - 16}" height="${heroH}" rx="16" fill="${site.heroColor ?? P.line}"/>`;
  const hs = site.heroSize ?? 20;
  site.hero.split('\n').forEach((l, i) => (out += t(24, 40 + i * hs * 1.4, l, hs, P.text, true)));
  let y = 8 + heroH + 30;
  for (const l of site.lines) { out += t(24, y, l, 14, P.muted); y += 28; }
  if (site.cta) out += `<rect x="24" y="${h - 70}" width="${w - 48}" height="46" rx="23" fill="${P.accent}"/><text x="${w / 2}" y="${h - 41}" font-size="18" font-weight="bold" fill="${P.text}" text-anchor="middle" font-family="sans-serif">${site.cta}</text>`;
  return out;
};

Object.assign(layouts, {
  divider: (p, { palette: P }) => ({
    body:
      abs(`left:80px;top:100px;font-size:96px;font-weight:900;line-height:1;color:${P.text}`, esc(p.no)) +
      abs(`left:80px;right:80px;top:226px;font-size:56px;font-weight:900;line-height:1.25;color:${P.text}`, esc(p.heading), 1) +
      abs(`left:80px;top:330px;font-size:16px;font-weight:700;letter-spacing:.1em;color:#fff;background:${P.dark};border-radius:99px;padding:4px 14px`, esc(p.time), 2) +
      abs(`left:80px;right:80px;top:380px;font-size:22px;font-weight:700;color:${P.text}`, esc(p.sub), 3),
  }),

  bigPrompt: (p, { palette: P }) => ({
    body: centerCol(
      lineIn(0, `font-size:20px;font-weight:700;color:${P.muted}`, esc(p.caption)) +
        lineIn(1, `background:${P.dark};color:#fff;border-radius:28px;padding:22px 56px;font-size:48px;font-weight:900;box-shadow:0 14px 30px ${P.text}40`, esc(p.prompt)),
    ),
  }),

  reveal: (p, { palette: P }) => ({
    body: centerCol(
      lineIn(0, `font-size:22px;font-weight:700;color:${P.muted}`, esc(p.ask)) +
        lineIn(1, `font-size:54px;font-weight:900;line-height:1.3`, esc(p.lead)) +
        lineIn(2, `font-size:54px;font-weight:900;line-height:1.3`, mark(P, p.punch)) +
        lineIn(3, `font-size:22px;color:${P.muted}`, esc(p.sub)),
    ),
  }),

  // 對話：她（左）／我（右）的氣泡，最後一句結論打上黃底
  story: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      `<div style="position:absolute;left:44px;right:44px;top:130px;display:flex;flex-direction:column;gap:16px">${p.beats
        .map(([from, s, , label = 'AI'], i) => {
          const me = from === 'me';
          const bubble = `<div style="max-width:620px;padding:14px 20px;border-radius:18px;font-size:21px;line-height:1.5;${me ? `background:${P.dark};color:#fff` : `background:#fff;border:1.5px solid ${P.line}`}">${esc(s)}</div>`;
          const who = `<span style="flex:0 0 40px;height:40px;border-radius:20px;background:${me ? P.accent : P.dark};color:${me ? P.text : '#fff'};font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center">${me ? '我' : esc(label)}</span>`;
          return `<div class="in" style="${d(i, 0.15, 0.25)};display:flex;align-items:flex-end;gap:12px;${me ? 'flex-direction:row-reverse' : ''}">${who}${bubble}</div>`;
        })
        .join('')}${p.punch ? `<div class="in" style="${d(p.beats.length, 0.15, 0.25)};margin-top:10px;font-size:28px;font-weight:900">${mark(P, p.punch)}</div>` : ''}</div>`,
  }),

  three: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      `<div style="position:absolute;left:44px;right:44px;top:140px;display:grid;grid-template-columns:repeat(${p.cards.length},1fr);gap:18px">${p.cards
        .map(([c, t, b], i) => `<div class="card in" style="${d(i, 0.2)};border-top-color:${fill(P, c)};min-height:220px"><h3>${esc(t)}</h3><p>${esc(b)}</p></div>`)
        .join('')}</div>`,
  }),

  compare: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      `<div style="position:absolute;left:44px;right:44px;top:140px;display:grid;grid-template-columns:1fr 1fr;gap:18px">${p.cards
        .map(([c, t, b], i) => `<div class="card in${c === 'dark' ? ' dark' : ''}" style="${d(i, 0.2)};min-height:220px"><h3>${esc(t)}</h3><p style="font-size:21px">${esc(b)}</p></div>`)
        .join('')}</div>` +
      abs(`left:44px;right:44px;top:400px;font-size:20px;font-weight:700;border-left:6px solid ${P.accent};padding-left:14px`, esc(p.note), 3),
  }),

  grid: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      `<div style="position:absolute;left:44px;right:44px;top:124px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${p.tiles
        .map(([t, b], i) => `<div class="card in" style="${d(i, 0.15, 0.06)};height:184px;padding:16px 18px"><h3 style="font-size:20px">${esc(t)}</h3><p style="font-size:16px;line-height:1.6">${esc(b)}</p></div>`)
        .join('')}</div>`,
  }),

  // 編號步驟：卡片之間用箭頭串起來
  steps: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      `<div style="position:absolute;left:44px;right:44px;top:150px;display:flex;align-items:stretch;gap:10px">${p.items
        .map(
          ([t, b], i) =>
            (i ? `<div class="in" style="${d(i, 0.15, 0.15)};align-self:center;font-size:28px;font-weight:900">→</div>` : '') +
            `<div class="card in" style="${d(i, 0.15, 0.15)};flex:1;min-height:260px"><div style="font-size:44px;font-weight:900;color:${P.accent};line-height:1">${i + 1}</div><h3 style="margin-top:12px">${esc(t)}</h3><p>${esc(b)}</p></div>`,
        )
        .join('')}</div>`,
  }),

  // 問題迴圈：左邊四步繞一圈，右邊今天三站（截圖框留原生）＋下課帶走
  loop: (p, { palette: P, n }) => {
    const [cx, cy, r] = [250, 320, 128];
    const pos = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
    const nodes = p.steps
      .map(([t, s], i) => {
        const [x, y] = pos[i];
        const last = i === p.steps.length - 1;
        return `<div class="in" style="${d(i, 0.25, 0.12)};position:absolute;left:${x - 66}px;top:${y - 30}px;width:132px;height:60px;border-radius:10px;background:${last ? P.dark : P.accent};color:${last ? '#fff' : P.text};text-align:center;padding-top:6px"><b style="font-size:18px">${esc(t)}</b><div style="font-size:11px;opacity:.8">${esc(s)}</div></div>`;
      })
      .join('');
    const RX = 560;
    const RW = 916 - RX;
    const shots = p.shots.map(([t], i) => abs(`left:${RX}px;top:${142 + i * 84}px;width:${RW}px;font-size:13px;font-weight:700`, esc(t), i, 0.4)).join('');
    const cmpTop = 142 + p.shots.length * 84 + 4;
    return {
      body:
        title(p.heading) +
        `<svg class="in" style="position:absolute;left:0;top:0;${d(0, 0.1)}" width="960" height="540"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${P.line}" stroke-width="18"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${P.text}" stroke-width="2" stroke-dasharray="6 8"/></svg>` +
        abs(`left:44px;top:${cy - r - 22}px;font-size:15px;font-weight:700;color:#fff;background:${P.dark};border-radius:99px;padding:6px 14px`, esc(p.start), 0, 0.15) +
        nodes +
        abs(`left:${cx - 80}px;top:${cy - 24}px;width:160px;text-align:center;font-size:15px;font-weight:700;color:${P.muted}`, esc(p.center), 4, 0.25) +
        abs(`left:${RX}px;top:118px;font-size:13px;font-weight:700;color:${P.muted};letter-spacing:.1em`, esc(p.cardsTitle), 0, 0.35) +
        shots +
        abs(`left:${RX}px;top:${cmpTop}px;width:${RW}px;border-left:5px solid ${P.accent};padding-left:12px;font-size:14px;line-height:1.6`, `<b>${esc(p.compareTitle)}</b><br>${p.compare.map(esc).join('<br>')}`, 3, 0.4),
      natives: p.shots.map(([, cap], i) => n.shotFrame(RX, 142 + i * 84 + 22, RW, 52, cap, P.muted, P.text)),
    };
  },

  split: (p, { palette: P }) => ({
    body:
      abs(`left:44px;top:150px;font-size:14px;font-weight:700;color:#fff;background:${P.dark};border-radius:99px;padding:4px 12px`, esc(p.kicker)) +
      abs(`left:44px;top:196px;width:330px;font-size:40px;font-weight:900;line-height:1.3`, esc(p.heading), 1) +
      `<div style="position:absolute;left:410px;right:44px;top:110px;display:flex;flex-direction:column;gap:14px">${p.items
        .map((s, i) => `<div class="card in" style="${d(i, 0.3)};border-top:none;border-left:6px solid ${P.accent};display:flex;gap:16px;align-items:center"><b style="font-size:30px;color:${P.text}">${i + 1}</b><p style="color:${P.text};font-size:19px">${esc(s)}</p></div>`)
        .join('')}</div>`,
  }),

  // 同一個任務兩欄對照：聊天 AI（你動手）vs Agent（AI 動手）
  whoDoes: (p, { palette: P }) => {
    const col = (side, dark, i) =>
      `<div class="card in${dark ? ' dark' : ''}" style="${d(i, 0.25, 0.2)};flex:1;padding:16px 20px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">${icon(side.icon, 40, dark ? P.accent : P.dark, dark ? P.text : '#fff')}<h3 style="margin:0">${esc(side.name)}</h3><span style="margin-left:auto;font-size:14px;font-weight:700;background:${dark ? P.accent : P.line};color:${P.text};border-radius:99px;padding:3px 10px">${esc(side.count)}</span></div>${side.steps
        .map(([who, s]) => `<div style="display:flex;gap:10px;margin-top:8px;font-size:16px;line-height:1.5"><b style="flex:0 0 30px;color:${dark ? P.accent : P.text}">${esc(who)}</b><span style="color:${dark ? P.darkSub : P.text}">${esc(s)}</span></div>`)
        .join('')}</div>`;
    const [lead, punch] = p.bottom;
    return {
      body:
        title(p.heading, 0) +
        abs(`left:44px;top:110px;font-size:14px;font-weight:700;color:#fff;background:${P.dark};border-radius:99px;padding:4px 12px`, esc(`任務：${p.task}`), 1) +
        `<div style="position:absolute;left:44px;right:44px;top:150px;display:flex;gap:20px">${col(p.left, false, 0)}${col(p.right, true, 1)}</div>` +
        abs(`left:44px;top:478px;font-size:21px;font-weight:700`, `${esc(lead)}${mark(P, punch)}`, 4),
    };
  },

  // 左：引言＋標題；右：原生連結＋三張圖示卡
  iconSplit: (p, { palette: P, n }) => ({
    body:
      abs(`left:44px;top:120px;font-size:14px;font-weight:700;color:#fff;background:${P.dark};border-radius:99px;padding:4px 12px`, esc(p.kicker)) +
      abs(`left:44px;top:166px;width:300px;font-size:38px;font-weight:900;line-height:1.3`, esc(p.heading), 1) +
      `<div style="position:absolute;left:380px;right:44px;top:250px;display:grid;grid-template-columns:repeat(${p.cards.length},1fr);gap:12px">${p.cards
        .map(([ic, t, b], i) => `<div class="card in" style="${d(i, 0.3)};height:250px;padding:16px">${icon(ic, 40, P.accent, P.text)}<h3 style="font-size:18px;margin-top:12px">${esc(t)}</h3><p style="font-size:15px;line-height:1.6">${esc(b)}</p></div>`)
        .join('')}</div>`,
    natives: [n.link(380, 120, 536, 110, p.link)],
  }),

  // 填空骨架：深色編輯框裡逐行，範例小字
  skillTemplate: (p, { palette: P }) => ({
    body:
      tagPill(P, p.tag) +
      taskTitle(p.heading) +
      `<div class="win in" style="left:44px;top:170px;width:872px;height:220px;${d(1)}"><div class="tb"><i></i><i></i><i></i>${esc(p.app ?? '聊天 AI')}</div><div class="scr" style="font-size:18px;line-height:1.7">${p.lines
        .map(([c, s, ex]) => `<div style="color:${c === 'why' ? P.accent : '#e8e6df'};margin-top:8px">${esc(s)}</div>${ex ? `<div style="font-size:14px;color:${P.darkSub}">${esc(ex)}</div>` : ''}`)
        .join('')}</div></div>` +
      (p.note ? abs(`left:44px;right:44px;top:416px;font-size:20px;font-weight:700;border-left:6px solid ${P.accent};padding-left:14px`, esc(p.note), 3) : ''),
  }),

  break: (p, { palette: P }) => ({
    body: centerCol(
      lineIn(0, `font-size:64px;font-weight:900;color:#fff`, esc(p.heading)) +
        lineIn(1, `font-size:22px;font-weight:700;color:${P.text};background:${P.accent};border-radius:99px;padding:6px 22px`, esc(`${p.back} 回來`)),
    ),
  }),

  qa: (p, { palette: P }) => ({
    body: centerCol(lineIn(0, `font-size:80px;font-weight:900;color:#fff`, esc(p.heading)) + lineIn(1, `font-size:24px;color:${P.darkSub}`, esc(p.sub))),
  }),

  closing: (p, { palette: P }) => ({
    body: centerCol(
      lineIn(0, `font-size:18px;font-weight:700;color:${P.muted};letter-spacing:.1em`, esc(p.kicker)) +
        lineIn(1, `font-size:40px;font-weight:900`, esc(p.before)) +
        lineIn(2, `font-size:58px;font-weight:900`, `${esc(p.lead)}${mark(P, p.punch)}`) +
        lineIn(3, 'display:flex;gap:14px', p.pills.map(([c, s]) => `<span style="background:${fill(P, c)};color:${onFill(P, c)};font-size:16px;font-weight:700;border-radius:99px;padding:6px 18px">${esc(s)}</span>`).join('')),
    ),
  }),

  // ── 疊原生元件的版型 ──
  goalShot: (p, { palette: P, n }) => ({
    body:
      title(p.heading) +
      abs(`left:44px;top:300px;width:420px;font-size:20px;line-height:1.6;color:${P.muted};border-left:6px solid ${P.accent};padding-left:14px`, esc(p.note), 2) +
      (p.shotSrc
        ? abs(
            'left:599px;top:132px;width:208px;height:386px;background:#16161a;border-radius:30px;padding:8px;box-sizing:border-box;box-shadow:0 12px 32px rgba(0,0,0,.25)',
            `<img src="${p.shotSrc}" alt="${esc(p.shot)}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top;border-radius:22px">`,
            1,
          )
        : ''),
    natives: [n.link(44, 160, 420, 110, p.link), ...(p.shotSrc ? [] : [n.shotFrame(490, 140, 426, 370, p.shot, P.muted, P.text)])],
  }),

  iconLinks: (p, { palette: P, n }) => {
    const [ic, t, b] = p.dark;
    const rowH = 96;
    const darkY = 186 + p.links.length * (rowH + 12) + 6;
    const natives = p.links.flatMap((row, r) => {
      const cw = (872 - 16 * (row.length - 1)) / row.length;
      return row.map(([i2, url, label, desc], i) => n.link(44 + i * (cw + 16), 186 + r * (rowH + 12), cw, rowH, [url, i2 ? `${i2} ${label}` : label, desc], 'download'));
    });
    return {
      body:
        tagPill(P, p.tag) +
        taskTitle(p.heading) +
        `<div class="card dark in" style="position:absolute;left:44px;right:44px;top:${darkY}px;${d(2)};display:flex;gap:16px;align-items:center;padding:18px 22px">${icon(ic, 44, P.accent, P.text)}<div><h3 style="margin:0 0 4px;font-size:21px">${esc(t)}</h3><p style="font-size:16px">${esc(b)}</p></div></div>`,
      natives,
    };
  },

  copyFull: copyPage,
  copyPrompt: copyPage,

  taskDownload: (p, { palette: P, n }) => ({
    body: tagPill(P, p.tag) + taskTitle(p.heading) + numCards(P, p.items, 290, 200),
    natives: [n.fileDownload(44, 160, 872, 110, p.file)],
  }),

  // 完成打卡（講師只看完成比例）
  checkpoint: (p, { n }) => ({ body: title(p.heading), natives: [n.checkpoint(p.question, p.buttonLabel)] }),

  // 複製貼上動畫示範（講師提供的 copy-paste-demo.html 改成 960×540 片段）
  copyPasteDemo: (p) => ({ body: title(p.heading) + COPY_PASTE_DEMO }),

  // 照片在左，三句故事依序出現在右，最後一句打上黃底
  photoStory: (p, { palette: P }) => ({
    body:
      title(p.heading) +
      abs('left:44px;top:120px;width:520px;height:390px;border-radius:12px;overflow:hidden;box-shadow:0 10px 28px rgba(0,0,0,.2)', `<img src="${p.src}" alt="${esc(p.alt)}" style="display:block;width:100%;height:100%;object-fit:cover">`, 0) +
      `<div style="position:absolute;left:596px;right:44px;top:140px;display:flex;flex-direction:column;gap:22px">${p.lines
        .map((s, i) => {
          const last = i === p.lines.length - 1;
          return `<div class="in" style="${d(i, 0.6, 0.9)};font-size:${last ? 25 : 22}px;font-weight:${last ? 900 : 700};line-height:1.45">${last ? mark(P, s) : esc(s)}</div>`;
        })
        .join('')}</div>`,
    natives: [],
  }),

  // 一張照片＋標題
  photo: (p) => ({
    body:
      title(p.heading) +
      abs(
        'left:124px;top:118px;width:712px;height:400px;border-radius:12px;overflow:hidden;box-shadow:0 10px 28px rgba(0,0,0,.2)',
        `<img src="${p.src}" alt="${esc(p.alt)}" style="display:block;width:100%;height:100%;object-fit:cover">`,
        1,
      ),
    natives: [],
  }),

  // 兩個網站的真截圖並排（颱風題）
  siteShots: (p, { palette: P }) => {
    const frame = (s, i) =>
      abs(
        `left:${i ? 496 : 44}px;top:140px;width:420px`,
        `<div style="text-align:center;font-size:20px;font-weight:900;margin-bottom:8px">${esc(s.name)}</div>` +
          `<div style="border:2px solid ${P.line};border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.12)">` +
          `<div style="height:22px;background:#f1efe9;display:flex;align-items:center;gap:6px;padding-left:10px">${'<i style="width:8px;height:8px;border-radius:4px;background:#d4d0c6"></i>'.repeat(3)}</div>` +
          `<img src="${s.shotSrc}" alt="${esc(s.name)}的網站" style="display:block;width:100%;height:315px;object-fit:cover;object-position:top"></div>`,
        i,
        0.2,
      );
    return { body: `<h1 class="t in" style="font-size:28px">${esc(p.heading)}</h1>` + p.sites.map(frame).join(''), natives: [] };
  },

  siteMock: (p, { palette: P, n }) => {
    const w = 340;
    const h = 330;
    return {
      body:
        `<h1 class="t in" style="font-size:28px">${esc(p.heading)}</h1>` +
        p.sites.map((s, i) => abs(`left:${i ? 576 : 44}px;top:150px;width:${w}px;text-align:center;font-size:20px;font-weight:900`, esc(s.name), i, 0.2)).join('') +
        abs(`left:384px;top:330px;width:192px;text-align:center;font-size:36px;font-weight:900;color:${P.muted}`, 'vs', 2, 0.3),
      natives: p.sites.map((s, i) => n.svg(i ? 576 : 44, 190, w, h, phoneSvg(P, s, w, h))),
    };
  },

  // 8 種風格縮圖＋風格字典連結（Eric 新竹版）
  styleGallery: (p, { palette: P, n }) => ({
    body:
      `<style>${STYLE_CSS}.sg{position:absolute;left:44px;right:44px;top:120px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px 14px}.sg .sm{box-shadow:0 4px 12px rgba(0,0,0,.12)}.sg .lab{display:flex;align-items:baseline;gap:6px;margin-top:5px}.sg .cd{font:800 13px ui-monospace,monospace;color:#fff;background:${P.dark};border-radius:3px;padding:0 5px}.sg .nmz{font-size:14px;font-weight:800;color:${P.text}}</style>` +
      title(p.heading) +
      `<div class="sg">${p.styles.map(([code, name], i) => `<div class="in" style="${d(i, 0.15, 0.06)}">${styleTile(code, p.who)}<div class="lab"><span class="cd">${code}</span><span class="nmz">${esc(name)}</span></div></div>`).join('')}</div>`,
    natives: [n.link(44, 436, 872, 64, p.link)],
  }),

  homework: (p, { n }) => ({ body: title(p.heading), natives: [n.homework(p.hwId, 70, 130, 820, 400, p.title, p.description)] }),
  poll: (p, { n }) => ({ body: '', natives: [n.poll(p.question, p.options)] }),
  multiChoice: (p, { n }) => ({ body: '', natives: [n.poll(p.question, p.options, true)] }),
  quiz: (p, { n }) => ({ body: '', natives: [n.quiz(p.question, p.options, p.correct)] }),
  wordcloud: (p, { n }) => ({ body: '', natives: [n.wordcloud(p.question, p.maxWords)] }),
  showcase: (p, { n }) => ({ body: '', natives: [n.showcase(p.title, p.linkHomework)] }),
  webProject: (p, { n }) => ({ body: '', natives: [n.webProject(p.question, p.methods)] }),
});

Object.assign(layouts, contextLayouts, skillLayouts);
