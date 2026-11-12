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

export const layouts = {
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
