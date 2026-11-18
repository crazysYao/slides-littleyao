import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck } from './build-deck-html.mjs';
import * as base from './job-site-content.mjs';
import * as listen from './listen-content.mjs';

const deck = buildDeck(listen);
const ids = deck.slides.map((s) => s.id);
const baseIds = new Set(base.pages.map((p) => p.id));
const slide = (id) => deck.slides.find((s) => s.id === id);
const page = (id) => listen.pages.find((p) => p.id === id);
const STAT = ['poll', 'quiz', 'checkpoint', 'homework', 'showcase', 'webProject', 'wordcloud'];

test('頁序引用的原版 id 都存在', () => {
  for (const x of listen.ORDER) if (typeof x === 'string') assert.ok(baseIds.has(x), x);
});

test('沒有統計元件', () => {
  for (const s of deck.slides) for (const e of s.elements) assert.ok(!STAT.includes(e.type), `${s.id} 有 ${e.type}`);
});

test('刪掉的頁不在', () => {
  for (const id of ['s1-save-poll', 's2-rescue', 's2-v1-poll', 's2-skill-upload', 's3-try', 's3-v2-upload', 's3-obsidian'])
    assert.ok(!ids.includes(id), id);
});

test('頁序以外的原版頁不會混進來', () => {
  const ordered = new Set(listen.ORDER.filter((x) => typeof x === 'string'));
  for (const id of ids) if (baseIds.has(id)) assert.ok(ordered.has(id), id);
});

test('舉手頁', () => {
  for (const id of ['s1-ai-exp', 's1-paid', 's2-typhoon-poll', 's2-quiz-warmup-1', 's2-quiz-warmup-2', 's2-quiz-warmup-3'])
    assert.equal(page(id)?.layout, 'handRaise', id);
  const items = base.pages.find((p) => p.id === 's2-quiz-warmup').items;
  items.forEach(([, options, correct], i) => {
    const n = page(`s2-quiz-warmup-${i + 1}`).notes;
    assert.ok(n.includes('正解：') && n.includes(options[correct]), n);
  });
});

test('v1→v2 對照', () => {
  const els = slide('s3-v2-wall').elements;
  const frames = els.filter((e) => e.type === 'svg' && e.svgContent.includes('待講師提供'));
  assert.equal(frames.length, 2);
  assert.ok(!els.some((e) => e.type === 'showcase'));
});

test('複製卡保留', () => {
  for (const id of ['s1-interview', 's2-prompt-2', 's2-skill-make', 's3-newchat'])
    assert.equal(slide(id).elements.filter((e) => e.type === 'copycard').length, 1, id);
});

const ACT = ['全班實作', '上傳你的', '換你做', '存好了', '互投', '助教', '走動看大家', '大家上傳', '所有人都先做', '交 v1', '你們改網站'];
test('沒有要學員動手的字', () => {
  for (const p of listen.pages)
    for (const k of ['title', 'heading', 'tag', 'notes', 'description'])
      for (const w of ACT) assert.ok(!(p[k] ?? '').includes(w), `${p.id}.${k} 出現 ${w}`);
});

test('有時間前綴的頁都被覆寫過', () => {
  for (const id of ids) {
    const b = base.pages.find((p) => p.id === id);
    if (b && /^\d\d:\d\d/.test(b.notes ?? '')) assert.ok(listen.OVERRIDES[id]?.notes, id);
  }
});

test('示範頁標題', () => {
  for (const id of ['s1-interview', 's2-prompt-2', 's2-skill-make', 's3-newchat']) assert.match(page(id).tag, /^講師示範/, id);
});

test('跟著改字', () => {
  for (const id of ['cover', 's1-outline', 's1', 's2', 's3', 's3-recap', 'qa']) assert.ok(listen.OVERRIDES[id], id);
  assert.notEqual(page('cover').subtitle, base.pages.find((p) => p.id === 'cover').subtitle);
  assert.ok(!JSON.stringify(page('s3-recap')).includes('上傳'));
});
