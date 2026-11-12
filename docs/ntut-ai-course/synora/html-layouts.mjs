// 求職網站簡報的版型：每個版型回傳 { body: HTML 片段, natives: 原生元件, loop?: 是否循環示意 }。
import { esc, splitSteps, chips } from './html-kit.mjs';

const title = (s, d = 0) => `<h1 class="t in" style="--d:${d}s">${esc(s)}</h1>`;

// 示意畫面一行：[文字, 色鍵] 片段；y＝要學員做的動作（亮起的格子），g＝成功，m＝次要
const seg = ([t, c]) => (c === 'y' ? `<span class="slot">${esc(t)}</span>` : c ? `<span class="${c}">${esc(t)}</span>` : esc(t));
const mockRow = (line, i, last) => {
  const segs = typeof line === 'string' ? [[line]] : line;
  if (last && segs.length === 1 && segs[0][1] === 'm') {
    return `<span class="done ln" style="animation-delay:${(2.8 + i * 0.7).toFixed(1)}s">${esc(segs[0][0])}</span>`;
  }
  const html = segs.map(seg).join('');
  return i === 0 ? `<div>${html}</div>` : `<div class="ln" style="animation-delay:${(2.8 + (i - 1) * 0.7).toFixed(1)}s">${html}</div>`;
};

const COPY = { x: 44, y: 160, w: 330, h: 350 };
const WIN = { x: 420, y: 160, w: 496, h: 350 };

const d = (i, base = 0.15, step = 0.08) => `--d:${(base + i * step).toFixed(2)}s`;
// 內容檔用顏色代號（accent、dark、muted、text）；黃色上面一律放黑字
const fill = (P, key) => P[key] ?? key;
const onFill = (P, key) => (P.ink?.[fill(P, key)] ?? (key === 'accent' ? P.text : '#fff'));

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
      `<div style="position:absolute;left:44px;right:44px;top:290px;display:grid;grid-template-columns:repeat(${p.items.length},1fr);gap:16px">${p.items
        .map(
          (s, i) =>
            `<div class="card in" style="${d(i, 0.3)};height:200px"><div style="width:34px;height:34px;border-radius:17px;background:${P.accent};color:${P.text};font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;margin-bottom:12px">${i + 1}</div><p style="color:${P.text};font-size:18px">${esc(s)}</p></div>`,
        )
        .join('')}</div>`,
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
