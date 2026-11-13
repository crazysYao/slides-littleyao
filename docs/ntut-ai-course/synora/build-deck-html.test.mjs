import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck } from './build-deck-html.mjs';

const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));

const layouts = {
  plain: (p) => ({ body: `<h1>${p.heading}</h1>`, natives: [] }),
  withLink: (p, { n }) => ({ body: '', natives: [n.link(70, 190, 820, 110, ['https://x', 'X', 'd'])] }),
  quiz: (p, { n }) => ({ body: '', natives: [n.quiz(p.question, p.options, p.correct)] }),
};
const fakeContent = {
  brand: 'B',
  palette: {},
  pages: [
    { id: 'a', layout: 'plain', section: 'S', title: 'A', notes: 'n', heading: 'h' },
    { id: 'b', layout: 'withLink', title: 'B', notes: 'n' },
    { id: 'q', layout: 'quizSet', section: 'S', label: '搶答', firstNote: '開場', items: [['Q1', ['x', 'y'], 1], ['Q2', ['x', 'y'], 0]] },
  ],
};

test('每頁第一個元件是滿版 html，原生元件在後', () => {
  const deck = buildDeck(fakeContent, { layouts });
  for (const s of deck.slides) {
    assert.deepEqual(pick(s.elements[0], ['id', 'type', 'x', 'y', 'width', 'height']), { id: `${s.id}-bg`, type: 'html', x: 0, y: 0, width: 960, height: 540 });
    assert.match(s.elements[0].html, /^<!doctype html>/);
  }
  const b = deck.slides.find((s) => s.id === 'b');
  assert.equal(b.elements[1].type, 'link');
  assert.equal(b.elements[1].id, 'b-link-1');
});

test('quizSet 展開成多頁且講稿附正解', () => {
  const deck = buildDeck(fakeContent, { layouts });
  const qs = deck.slides.filter((s) => s.id.startsWith('q-'));
  assert.deepEqual(qs.map((s) => s.id), ['q-1', 'q-2']);
  assert.equal(qs[0].notes, '開場 正解：y');
  assert.equal(qs[1].notes, '正解：x');
  assert.equal(qs[0].title, '搶答 1/2');
});

test('--only 只輸出指定頁且 slideNumber 從 1 連號', () => {
  const deck = buildDeck(fakeContent, { layouts, only: ['b', 'q-2'] });
  assert.deepEqual(deck.slides.map((s) => [s.id, s.slideNumber]), [['b', 1], ['q-2', 2]]);
});

test('版型不存在時丟錯並帶出頁 id', () => {
  const bad = { ...fakeContent, pages: [{ id: 's-x', layout: 'nope', title: 't', notes: 'n' }] };
  assert.throws(() => buildDeck(bad, { layouts }), /s-x.*nope/);
});

import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as content from './job-site-content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const INTERACTIVE = new Set(['poll', 'quiz', 'link', 'copycard', 'fileDownload', 'wordcloud', 'webProject', 'homework', 'showcase']);
const FULLSIZE = new Set(['poll', 'quiz', 'wordcloud', 'webProject', 'showcase']);
// 舊產生器沒有後來新增的版型，比對時先拿掉這些頁
const NEW_LAYOUTS = ['styleGallery', 'skillSlide', 'ctxClasses', 'ctxWindow', 'siteShots', 'photo'];
const oldDeck = () => {
  const dir = mkdtempSync(join(tmpdir(), 'deck-'));
  const out = join(dir, 'old.json');
  const src = pathToFileURL(join(here, 'job-site-content.mjs')).href;
  const tmp = join(dir, 'content.mjs');
  writeFileSync(tmp, `import * as c from '${src}';\nexport * from '${src}';\nexport const pages = c.pages.filter((p) => !${JSON.stringify(NEW_LAYOUTS)}.includes(p.layout));\n`);
  execFileSync(process.execPath, [join(here, 'build-deck.mjs'), out, tmp]);
  return JSON.parse(readFileSync(out, 'utf8'));
};
const strip = (e, keepBox) => {
  const { id, x, y, width, height, ...rest } = e;
  if (e.type === 'copycard') delete rest.title;
  return keepBox ? { ...rest, x, y, width, height } : rest;
};

test('全份：61 頁，原生互動元件與舊產生器一致', () => {
  const all = buildDeck(content).slides;
  const old = oldDeck().slides;
  assert.equal(all.length, 61);
  const oldIds = new Set(old.map((s) => s.id));
  const now = all.filter((s) => oldIds.has(s.id));
  assert.equal(now.length, old.length);
  assert.deepEqual(now.map((s) => [s.id, s.notes]), old.map((s) => [s.id, s.notes]));
  for (const s of all) for (const e of s.elements) assert.ok(e.x >= 0 && e.y >= 0 && e.x + e.width <= 960 && e.y + e.height <= 540, `${s.id} ${e.id} 出界`);
  now.forEach((s, i) => {
    const pick2 = (els) => els.filter((e) => INTERACTIVE.has(e.type)).map((e) => strip(e, FULLSIZE.has(e.type)));
    assert.deepEqual(pick2(s.elements), pick2(old[i].elements), s.id);
    assert.equal(s.elements[0].type, 'html', s.id);
    for (const e of s.elements) assert.ok(e.x >= 0 && e.y >= 0 && e.x + e.width <= 960 && e.y + e.height <= 540, `${s.id} ${e.id} 出界`);
  });
});

test('全份：沒有循環動畫頁', () => {
  const loops = buildDeck(content).slides.filter((s) => /infinite/.test(s.elements[0].html)).map((s) => s.id);
  assert.deepEqual(loops, []);
});

test('全份：截圖佔位 svg 數量', () => {
  const svgs = Object.fromEntries(buildDeck(content).slides.map((s) => [s.id, s.elements.filter((e) => e.type === 'svg').length]));
  assert.equal(svgs['s1-goal'], 0);
  assert.equal(svgs['s2-typhoon'], 0);
  assert.equal(svgs['s3-recap'], 3);
});

test('全份：copycard 標題', () => {
  const titles = Object.fromEntries(buildDeck(content).slides.flatMap((s) => s.elements.filter((e) => e.type === 'copycard').map((e) => [s.id, e.title])));
  assert.deepEqual(titles, {
    's1-interview': '讓 AI 訪問你', 's1-prompt-1': '照貼就好',
    's2-prompt-2': '複製後，先填好三個空格再送出', 's2-skill-make': '整理成 Skill', 's3-newchat': '面試自介',
  });
});
