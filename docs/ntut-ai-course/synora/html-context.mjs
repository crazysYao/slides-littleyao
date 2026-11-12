// Context 段的兩個版型：八堂課方格、互動示意圖（仿 ../references/llm-context-window-interactive.html）。
import { esc } from './html-kit.mjs';

const title = (s) => `<h1 class="t in">${esc(s)}</h1>`;

// 被擠掉、摘要兩種狀態要一眼分得出來，所以用語意色，不取自 palette
const CUT = '#c8473f';
const SUM = '#2e8f63';

const STATE_TEXT = { clear: '記得', faint: '模糊', lost: '想不起來' };

const ctxClasses = (p, { palette: P }) => ({
  body:
    `<style>.cg{position:absolute;left:44px;right:44px;top:150px;display:grid;grid-template-columns:repeat(8,1fr);gap:10px}` +
    `.cls{height:170px;border-radius:10px;border:2px solid ${P.dark};background:${P.accent};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}` +
    `.cls b{font-size:38px;font-weight:900;line-height:1}.cls span{font-size:14px;font-weight:700;line-height:1.5;text-align:center}` +
    `.cls.faint{background:${P.accent}55;border-color:${P.muted}}.cls.faint b,.cls.faint span{color:${P.muted}}` +
    `.cls.lost{background:transparent;border:2px dashed ${P.muted}}.cls.lost b,.cls.lost span{color:${P.muted}}</style>` +
    title(p.heading) +
    `<div class="cg">${p.classes
      .map(([label, state], i) => `<div class="cls ${state} in" style="--d:${(0.15 + i * 0.06).toFixed(2)}s"><b>${state === 'lost' ? '？' : esc(label)}</b><span>第 ${esc(label)} 堂<br>${STATE_TEXT[state]}</span></div>`)
      .join('')}</div>` +
    `<div class="in" style="position:absolute;left:44px;right:44px;top:360px;font-size:22px;font-weight:700;line-height:1.6;border-left:6px solid ${P.accent};padding-left:14px;--d:.7s">${esc(p.note)}</div>`,
});

const msgHtml = ([kind, label, text]) => `<div class="cm k-${kind}"><b>${esc(label)}</b><small>${esc(text)}</small></div>`;
const dotsHtml = (n, i) => Array.from({ length: n }, (_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('');

const ctxWindow = (p, { palette: P }) => {
  // 沒有 JS、截圖、關閉動畫時停在最滿的那一步，畫面才有內容
  const full = p.steps.reduce((best, s, i) => (s.used > p.steps[best].used ? i : best), 0);
  const s = p.steps[full];
  const css =
    `.cw{position:absolute;left:44px;top:112px;width:560px;height:404px;border:2px solid ${P.dark};border-radius:12px;background:#fff;padding:12px 14px;display:flex;flex-direction:column}` +
    `.cw-h{display:flex;justify-content:space-between;align-items:baseline;font-size:15px;font-weight:900}.cw-h span{font:700 20px ui-monospace,Menlo,monospace}` +
    `.cw-bar{height:8px;border-radius:4px;background:${P.line};margin:8px 0 10px;overflow:hidden}.cw-bar i{display:block;height:100%;background:${P.accent};transition:width .4s}` +
    `.cw-st{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;overflow:hidden}` +
    `.cm{border:1.5px solid ${P.line};border-left:6px solid ${P.dark};border-radius:7px;padding:4px 10px;background:${P.bg};min-height:34px;display:flex;flex-direction:column;justify-content:center}` +
    `.cm b{font-size:13px;line-height:1.3}.cm small{font-size:12px;line-height:1.3;color:${P.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}` +
    `.cm.k-me{border-left-color:${P.accent}}.cm.k-big{min-height:68px}` +
    `.cm.k-sum{border-left-color:${SUM};background:${SUM}14}` +
    `.cm.k-cut{border:1.5px dashed ${CUT};border-left:6px dashed ${CUT};background:transparent;opacity:.75}.cm.k-cut b{color:${CUT}}` +
    `.cw-side{position:absolute;left:624px;right:44px;top:112px;height:404px;display:flex;flex-direction:column;gap:12px}` +
    `.cw-ev{background:${P.dark};color:#fff;border-radius:10px;padding:14px 16px;font-size:19px;font-weight:900;line-height:1.45;min-height:112px}.cw-ev small{display:block;font-size:12px;font-weight:700;color:${P.darkSub};margin-bottom:6px;letter-spacing:.08em}` +
    `.cw-dots{display:flex;gap:5px}.cw-dots i{flex:1;height:6px;border-radius:3px;background:${P.line}}.cw-dots i.on{background:${P.accent}}` +
    `.cw-btn{display:flex;gap:8px}.cw-btn button{font:900 17px 'PingFang TC','Noto Sans TC',sans-serif;border-radius:9px;padding:10px 14px;cursor:pointer;border:2px solid ${P.dark};background:${P.accent};color:${P.text};flex:1}` +
    `.cw-btn button[data-act="reset"]{background:#fff;flex:0 0 84px}.cw-btn button:disabled{opacity:.4;cursor:default}` +
    `.cw-note{margin-top:auto;font-size:13px;line-height:1.5;color:${P.muted}}` +
    `.cap .cw-btn{visibility:hidden}`;
  const data = JSON.stringify(p.steps).replace(/</g, '\\u003c');
  const script =
    `(function(){var S=JSON.parse(document.getElementById('cw-data').textContent),i=${full};` +
    `var E=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};` +
    `var $=function(id){return document.getElementById(id)};` +
    `function draw(){var s=S[i];$('cw-st').innerHTML=s.msgs.map(function(m){return '<div class="cm k-'+m[0]+'"><b>'+E(m[1])+'</b><small>'+E(m[2])+'</small></div>'}).join('');` +
    `$('cw-used').textContent=s.used+'%';$('cw-fill').style.width=s.used+'%';$('cw-ev').textContent=s.event;` +
    `$('cw-dots').innerHTML=S.map(function(_,k){return '<i class="'+(k<=i?'on':'')+'"></i>'}).join('');` +
    `$('cw-next').disabled=i===S.length-1}` +
    `$('cw-next').onclick=function(){if(i<S.length-1){i++;draw()}};$('cw-reset').onclick=function(){i=0;draw()};` +
    `var still=window.__SYNORA_CAPTURE__||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);` +
    `if(!still){i=0;draw()}})()`;
  return {
    body:
      `<style>${css}</style>` +
      title(p.heading) +
      `<div class="cw"><div class="cw-h">${esc(p.capLabel)}<span id="cw-used">${s.used}%</span></div>` +
      `<div class="cw-bar"><i id="cw-fill" style="width:${s.used}%"></i></div>` +
      `<div class="cw-st" id="cw-st">${s.msgs.map(msgHtml).join('')}</div></div>` +
      `<div class="cw-side"><div class="cw-ev"><small>這一步</small><span id="cw-ev">${esc(s.event)}</span></div>` +
      `<div class="cw-dots" id="cw-dots">${dotsHtml(p.steps.length, full)}</div>` +
      `<div class="cw-btn"><button id="cw-next" data-act="next">下一步</button><button id="cw-reset" data-act="reset">重設</button></div>` +
      `<div class="cw-note">${esc(p.disclaimer)}</div></div>` +
      `<script type="application/json" id="cw-data">${data}</script><script>${script}</script>`,
    natives: [],
  };
};

export const contextLayouts = { ctxClasses, ctxWindow };
