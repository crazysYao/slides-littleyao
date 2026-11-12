import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contextLayouts } from './html-context.mjs';

const P = { text: '#16161a', accent: '#f5b400', muted: '#62646b', line: '#ebe7de', dark: '#16161a', darkSub: '#c9c6bd', bg: '#fbfaf7' };
const win = {
  heading: 'H',
  capLabel: '這一輪 AI 看得到的內容',
  disclaimer: '示意圖',
  steps: [
    { used: 10, event: '貼上訪問卡', msgs: [['me', '訪問卡', '一次問我一題']] },
    { used: 100, event: '塞滿了', msgs: [['cut', '訪問問答', '沒有送進這一輪'], ['big', '網站 v2', '<html>']] },
    { used: 14, event: '開新對話', msgs: [['me', '基本資料副本', '…']] },
  ],
};
const noScript = (s) => s.replace(/<script[\s\S]*?<\/script>/g, '');

test('ctxWindow：資料完整內嵌，可還原', () => {
  const { body, natives } = contextLayouts.ctxWindow(win, { palette: P });
  const json = body.match(/<script type="application\/json" id="cw-data">([\s\S]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(json), win.steps);
  assert.deepEqual(natives ?? [], []);
});

test('ctxWindow：沒有 JS 也看得到「塞滿」那一步', () => {
  const stat = noScript(contextLayouts.ctxWindow(win, { palette: P }).body);
  assert.match(stat, /訪問問答/);
  assert.match(stat, /100%/);
  assert.match(stat, /示意圖/);
});

test('ctxWindow：內容跳脫、不載外部資源、認得截圖模式', () => {
  const { body } = contextLayouts.ctxWindow(win, { palette: P });
  assert.doesNotMatch(noScript(body), /<html>/);
  assert.doesNotMatch(body, /https?:\/\//);
  assert.match(body, /__SYNORA_CAPTURE__/);
});

test('ctxWindow：有下一步與重設', () => {
  const { body } = contextLayouts.ctxWindow(win, { palette: P });
  assert.match(body, /data-act="next"/);
  assert.match(body, /data-act="reset"/);
});

test('ctxClasses：八格，狀態寫進 class', () => {
  const p = { heading: 'H', note: 'N', classes: [['1', 'lost'], ['2', 'faint'], ['3', 'clear'], ['4', 'faint'], ['5', 'lost'], ['6', 'faint'], ['7', 'clear'], ['8', 'clear']] };
  const { body } = contextLayouts.ctxClasses(p, { palette: P });
  assert.equal((body.match(/class="cls /g) ?? []).length, 8);
  assert.equal((body.match(/cls lost/g) ?? []).length, 2);
});

test('ctxWindow：換行與特殊字元在有沒有 JS 時畫出來一樣', () => {
  const tricky = { ...win, steps: [{ used: 100, event: '第一行\n第二行 </script> & "引號"', msgs: [['me', 'A&B', '上\n下']] }] };
  const { body } = contextLayouts.ctxWindow(tricky, { palette: P });
  // 內嵌資料可還原，而且沒有被內容裡的 </script> 截斷
  const json = body.match(/<script type="application\/json" id="cw-data">([\s\S]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(json), tricky.steps);
  assert.equal((body.match(/<script/g) ?? []).length, 2);
  // 伺服端先畫的那一步
  const stat = noScript(body);
  assert.match(stat, /第一行<br>第二行 &lt;\/script&gt; &amp; &quot;引號&quot;/);
  assert.match(stat, /<b>A&amp;B<\/b><small>上<br>下<\/small>/);
  // 瀏覽器端用同一份跳脫與組字函式重畫，事件文字也走 innerHTML
  const script = body.match(/<script>([\s\S]*?)<\/script>/)[1];
  const fn = (name) => new Function(`${script.match(new RegExp(`var ${name}=(function[\\s\\S]*?\\});`))[0]}return ${name}`)();
  const E = fn('E');
  const M = fn('M');
  assert.equal(E(tricky.steps[0].event), '第一行<br>第二行 &lt;/script&gt; &amp; &quot;引號&quot;');
  assert.ok(stat.includes(M(tricky.steps[0].msgs, E)));
  assert.match(script, /\$\('cw-ev'\)\.innerHTML=E\(/);
});
