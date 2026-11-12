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
