// 求職網站簡報的 HTML 底圖共用件：跳脫、步驟膠囊、整頁外框（CSS、進場動畫、截圖時顯示最終畫面）。
// 版面語言取自 Eric「新竹將軍村」第 20 頁 jj-setup1，顏色改用 content 的 palette。

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');

// '打招呼 → 複製 → 貼到 OpenCode' → 卡名「打招呼」＋步驟；第一段是「複製」時沒有卡名，改用 fallback
export const splitSteps = (cardTitle, fallbackLabel) => {
  const parts = cardTitle.split('→').map((s) => s.trim());
  if (parts.length < 2) return { label: cardTitle, steps: [] };
  if (parts[0] === '複製') return { label: fallbackLabel, steps: parts };
  return { label: parts[0], steps: parts.slice(1) };
};

export const chips = (steps, delay = 0.15) =>
  `<div class="chips">${steps.map((s, i) => `<span class="in" style="--d:${(delay + i * 0.06).toFixed(2)}s"><b>${i + 1}</b>${esc(s)}</span>`).join('')}</div>`;

const css = (P) => `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:960px;height:540px;overflow:hidden}
body{position:relative;font-family:'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif;color:${P.text};background:${P.bg};-webkit-font-smoothing:antialiased}
.mono{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
.paper{position:absolute;inset:0;background:radial-gradient(520px 340px at 100% 0%,${P.accent}22,transparent),repeating-linear-gradient(0deg,${P.text}06 0 1px,transparent 1px 28px),${P.bg}}
.hd{position:absolute;left:0;right:0;top:0;height:38px;background:${P.dark};display:flex;align-items:center;padding:0 44px;color:#fff;font-size:13px;font-weight:700;letter-spacing:.1em}
.hd:after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:6px;background:repeating-linear-gradient(90deg,${P.accent} 0 18px,${P.dark} 18px 36px)}
h1.t{position:absolute;left:44px;right:44px;top:58px;font-size:33px;font-weight:900;line-height:1.3;color:${P.text}}
.chips{position:absolute;left:44px;right:44px;top:110px;display:flex;gap:8px;flex-wrap:wrap}
.chips span{font-size:14px;font-weight:700;color:${P.text};background:#fff;border:1.5px solid ${P.line};border-radius:99px;padding:4px 13px}
.chips b{display:inline-block;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:10px;background:${P.accent};color:${P.text};margin-right:6px;font-size:12px}
.card{background:#fff;border:1.5px solid ${P.line};border-top:6px solid ${P.accent};border-radius:8px;padding:20px 22px;box-shadow:0 6px 18px ${P.text}0f}
.card h3{font-size:22px;font-weight:900;margin-bottom:10px;line-height:1.3}
.card p{font-size:17px;line-height:1.7;color:${P.muted}}
.card.dark{background:${P.dark};border-color:${P.dark}}.card.dark h3{color:#fff}.card.dark p{color:${P.darkSub}}
.win{position:absolute;background:${P.dark};border-radius:10px;overflow:hidden;box-shadow:0 14px 30px ${P.text}55}
.win .tb{height:28px;background:#2a2a30;display:flex;align-items:center;gap:6px;padding:0 10px;font-size:12px;font-weight:700;color:${P.darkSub}}
.win .tb i{width:9px;height:9px;border-radius:50%;background:#55555c}
.win .tag{margin-left:auto;font-size:11px;font-weight:700;color:${P.text};background:${P.accent};border-radius:4px;padding:2px 8px}
.scr{padding:12px 16px;font:14px/1.9 ui-monospace,'SF Mono',Menlo,Consolas,monospace;color:#e8e6df}
.scr .g{color:#8fd19e}.scr .m{color:${P.darkSub}}.scr .pr{color:${P.darkSub}}
.done{margin-top:6px;display:inline-block;background:${P.accent};color:${P.text};border-radius:5px;padding:2px 10px;font:700 13px/1.8 'PingFang TC','Noto Sans TC',sans-serif}
.arw{position:absolute;color:${P.text}}
@keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.in{animation:up .45s ease-out both;animation-delay:var(--d,0s)}
.cap *{animation:none!important;opacity:1!important;transform:none!important}
@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important;transform:none!important}}
`;

// 只有操作示意頁用：貼上格亮起 → 訊息逐行出現 → 完成提示，9 秒一輪
const loopCss = (P) => `
.slot{display:inline-block;vertical-align:middle;margin-left:6px;height:24px;border:2px dashed ${P.accent};border-radius:5px;padding:0 8px;font:700 12px/20px 'PingFang TC','Noto Sans TC',sans-serif;color:${P.accent};animation:slot 9s cubic-bezier(.34,1.56,.64,1) infinite}
.ln{opacity:0;animation:show 9s steps(1) infinite}
.arw{animation:nudge 1.2s cubic-bezier(.34,1.56,.64,1) infinite}
@keyframes slot{0%,20%{background:transparent;transform:scale(1)}24%{transform:scale(1.12);background:${P.accent};border-style:solid;color:${P.text}}28%,92%{transform:none;background:${P.accent};border-style:solid;color:${P.text}}100%{background:transparent;border-style:dashed}}
@keyframes show{0%{opacity:0}1%,92%{opacity:1}100%{opacity:0}}
@keyframes nudge{0%,100%{transform:none}50%{transform:translateX(7px)}}
`;

const DEFAULTS = { bg: '#fbfaf7', text: '#16161a', accent: '#f5b400', muted: '#62646b', line: '#ebe7de', dark: '#16161a', darkSub: '#c9c6bd' };

export const pageHtml = ({ brand, section, palette, body, loop = false, background }) => {
  const P = { ...DEFAULTS, ...palette };
  const bg = background ? `<div class="paper" style="background:${background}"></div>` : '<div class="paper"></div>';
  const hd = section ? `<div class="hd">${esc(`${brand} · ${section}`)}</div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<script>if (window.__SYNORA_CAPTURE__) document.documentElement.classList.add('cap')</script>
<style>${css(P)}${loop ? loopCss(P) : ''}</style></head><body>${bg}${hd}${body}</body></html>`;
};
