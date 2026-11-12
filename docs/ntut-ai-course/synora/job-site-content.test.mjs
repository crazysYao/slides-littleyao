import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck } from './build-deck-html.mjs';
import * as content from './job-site-content.mjs';

const ids = buildDeck(content).slides.map((s) => s.id);
const page = (id) => content.pages.find((p) => p.id === id);
const text = (p) => JSON.stringify(p);

const S1 = ['cover', 's1', 's1-outline', 's1-goal', 's1-login', 's1-ai-exp', 's1-paid', 's1-problem', 's1-problem-reveal',
  's1-drink', 's1-drink-reveal', 's1-gf-1', 's1-gf-2', 's1-gf-3', 's1-interview', 's1-prompt-1', 's1-save', 's1-save-poll', 'break1'];

test('第一節頁序', () => assert.deepEqual(ids.slice(0, S1.length), S1));

// 學員只用聊天 AI，舊工具鏈的字眼不能留在畫面或講稿
const BANNED = ['OpenCode', 'npx', 'site/index.html', 'my-site', 'AI Studio', 'job-site-template', 'Context Engineering', 'MCP'];
const scan = (pages) => {
  for (const p of pages)
    for (const w of [...BANNED, ...(p.id.startsWith('s2-skill-') && p.layout === 'skillSlide' ? [] : ['Agent'])])
      assert.ok(!text(p).includes(w), `${p.id} 出現 ${w}`);
};

test('第一節沒有舊工具鏈字眼', () => scan(content.pages.slice(0, content.pages.findIndex((x) => x.id === 'break1') + 1)));

test('訪問卡與追問是聊天版', () => {
  assert.match(page('s1-interview').prompt, /我的基本資料/);
  assert.match(page('s1-prompt-1').prompt, /重新輸出完整的/);
  assert.doesNotMatch(page('s1-prompt-1').prompt, /寫回|檔案/);
});

test('第一節分鐘數加總 50', () => {
  const end = content.pages.findIndex((x) => x.id === 'break1');
  const sum = content.pages.slice(0, end).reduce((a, p) => a + Number(p.notes?.match(/^\d\d:\d\d [^(（]*[(（](\d+)[)）]/)?.[1] ?? 0), 0);
  assert.equal(sum, 50);
});

const S2 = ['s2', 's2-quiz-warmup-1', 's2-quiz-warmup-2', 's2-quiz-warmup-3', 's2-typhoon', 's2-typhoon-poll', 's2-typhoon-reveal',
  's2-style', 's2-style-poll', 's2-prompt-2', 's2-rescue', 's2-v1-poll',
  's2-skill-1', 's2-skill-2', 's2-skill-3', 's2-skill-4', 's2-skill-5', 's2-skill-6', 's2-skill-7',
  's2-skill-make', 's2-skill-save', 's2-skill-upload', 'break2'];
const minutes = (from, to) =>
  content.pages
    .slice(content.pages.findIndex((x) => x.id === from), content.pages.findIndex((x) => x.id === to))
    .reduce((a, p) => a + Number((p.notes ?? p.firstNote)?.match(/^\d\d:\d\d [^(（]*[(（](\d+)[)）]/)?.[1] ?? 0), 0);

test('第二節頁序', () => assert.deepEqual(ids.slice(S1.length, S1.length + S2.length), S2));

test('第一、二節沒有舊工具鏈字眼', () => scan(content.pages.slice(0, content.pages.findIndex((x) => x.id === 'break2') + 1)));

test('Prompt ② 是 Canvas 版', () => {
  const p = page('s2-prompt-2').prompt;
  for (const s of ['Canvas', '給誰看', '風格', '最想讓對方記住的一件事', '單一 HTML', '不要放身分證、住址、私人手機']) assert.ok(p.includes(s), s);
});

test('Skill Prompt 輸出三欄且不重做網站', () => {
  const p = page('s2-skill-make').prompt;
  for (const s of ['名稱', '說明', '指示', '不要重做網站']) assert.ok(p.includes(s), s);
});

test('咖啡店七頁照順序', () => {
  const order = content.pages.filter((p) => p.layout === 'skillSlide').map((p) => p.slide);
  assert.deepEqual(order, ['s1-what', 's2-compare', 's2-compare-b', 's3-folder', 's4-skillmd', 's5-flow', 's6-uses']);
});

test('第二節分鐘數加總 50', () => assert.equal(minutes('s2', 'break2'), 50));
