import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layouts } from './html-layouts.mjs';
import { makeNative } from './native.mjs';
import { pages, palette } from './job-site-content.mjs';
import { esc } from './html-kit.mjs';

const page = (id) => pages.find((x) => x.id === id);
const run = (id) => {
  const p = page(id);
  return [p, layouts[p.layout](p, { palette, n: makeNative(p.id, palette.accent) })];
};

test('copyMock：膠囊、複製卡標題、loop', () => {
  const [p, r] = run('s1-install-win');
  assert.equal(r.loop, true);
  assert.match(r.body, /<b>1<\/b>複製[\s\S]*<b>4<\/b>Enter/);
  const cc = r.natives.filter((e) => e.type === 'copycard');
  assert.equal(cc.length, 1);
  assert.equal(cc[0].title, '安裝 · Windows');
  assert.equal(cc[0].content, p.prompt);
  assert.match(r.body, /PS C:\\Users\\你&gt;/);
  assert.match(r.body, /示意畫面/);
  assert.match(r.body, /class="done[^"]*"[^>]*>全部裝好/);
});

test('copyMock：s1-hello、s1-vercel-login 的卡名與膠囊', () => {
  const [, hello] = run('s1-hello');
  assert.equal(hello.natives[0].title, '打招呼');
  assert.match(hello.body, /<b>1<\/b>複製[\s\S]*<b>3<\/b>傳送/);
  assert.match(hello.body, /class="slot"[^>]*>\[ 允許一次 \]/);
  const [, login] = run('s1-vercel-login');
  assert.equal(login.natives[0].title, '登入');
  assert.match(login.body, /<b>4<\/b>瀏覽器按授權/);
});

test('copyMock：複製卡在畫面內且不壓到示意視窗', () => {
  for (const id of ['s1-install-win', 's1-hello', 's1-vercel-login']) {
    const [, r] = run(id);
    const cc = r.natives[0];
    const winLeft = Number(r.body.match(/class="win[^"]*" style="left:(\d+)px/)[1]);
    assert.ok(cc.x >= 0 && cc.y >= 150 && cc.y + cc.height <= 540, id);
    assert.ok(cc.x + cc.width <= winLeft, `${id} 複製卡壓到視窗`);
  }
});

// 頁面裡所有要給人看的字串（排除設定欄位、顏色代號、交給原生元件的欄位）
const SKIP = new Set(['id', 'layout', 'section', 'title', 'notes']);
const visibleStrings = (p, skip = []) => {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') { if (!(v in palette)) out.push(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  for (const [k, v] of Object.entries(p)) if (!SKIP.has(k) && !skip.includes(k)) walk(v);
  return out;
};
export const assertAllShown = (p, r, skip) => {
  for (const s of visibleStrings(p, skip)) assert.ok(r.body.includes(esc(s)), `${p.id} 少了「${s}」`);
};

test('代表頁：cover、rows、linkTask 文字齊全、不循環', () => {
  for (const id of ['cover', 's1-gf-3', 's1-aistudio']) {
    const [p, r] = run(id);
    assertAllShown(p, r, ['link']);
    assert.ok(!r.loop, id);
  }
});

test('linkTask：只有一個原生 link，網址與內容檔相同', () => {
  const [p, r] = run('s1-aistudio');
  assert.deepEqual(r.natives.map((e) => e.type), ['link']);
  assert.equal(r.natives[0].linkUrl, p.link[0]);
});
