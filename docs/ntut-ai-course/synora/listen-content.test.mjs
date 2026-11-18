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
const BASE_HASH = '15738bcdf770e07e43529e0104ee0d23cd491c8b09649e4aaabd686e85ba5a88'; // 9416e39 原版 build；改 html-layouts 讓原版變了就會失敗
const STAT = ['poll', 'quiz', 'checkpoint', 'homework', 'showcase', 'webProject', 'wordcloud'];

test('頁序引用的原版 id 都存在', () => {
  for (const x of listen.ORDER) if (typeof x === 'string') assert.ok(baseIds.has(x), x);
});

test('沒有統計元件', () => {
  for (const s of deck.slides) for (const e of s.elements) assert.ok(!STAT.includes(e.type), `${s.id} 有 ${e.type}`);
});

test('刪掉的頁不在', () => {
  for (const id of ['s1-save-poll', 's2-rescue', 's2-v1-poll', 's2-skill-upload', 's3-try', 's3-v2-upload', 's3-obsidian', 's2-typhoon-poll'])
    assert.ok(!ids.includes(id), id);
});

test('頁序以外的原版頁不會混進來', () => {
  const ordered = new Set(listen.ORDER.filter((x) => typeof x === 'string'));
  for (const id of ids) if (baseIds.has(id)) assert.ok(ordered.has(id), id);
});

test('舉手頁', () => {
  for (const id of ['s1-ai-exp', 's1-paid', 's2-quiz-warmup-1', 's2-quiz-warmup-2', 's2-quiz-warmup-3'])
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

test('第三節頁序', () => {
  assert.deepEqual(ids.slice(ids.indexOf('s3')), ['s3', 'v-ways', 's3-drop', 'v-cli', 'v-github', 'jp-why', 'jp-need', 'jp-flow', 'jp-skills', 'jp-scene', 'jp-map', 's3-recap', 'qa']);
});

test('Vercel', () => {
  assert.ok(JSON.stringify(page('v-cli')).includes('vercel --prod'));
  assert.ok(page('v-github').notes.includes('口述'));
  assert.equal(slide('v-github').elements.length, 1);
});

test('日文不揭露', () => {
  for (const p of listen.pages.filter((x) => x.id.startsWith('jp-')))
    for (const w of ['77', '未及格', '沒過', '中斷', '19 天']) assert.ok(!JSON.stringify(p).includes(w), `${p.id} 出現 ${w}`);
});

test('日文對回今天', () => {
  const t = JSON.stringify(page('jp-map'));
  for (const w of ['基本資料', 'Skill', 'Context', 'japanes-pk.littleyao.me']) assert.ok(t.includes(w), w);
});

test('頁首節次編號跟著聽課版節次', () => {
  const nth = (id) => (ids.indexOf(id) < ids.indexOf('s2') ? '01' : ids.indexOf(id) < ids.indexOf('s3') ? '02' : '03');
  for (const p of listen.pages) {
    const m = (p.section ?? '').match(/^(0\d) /);
    if (m) assert.equal(m[1], nth(p.id), `${p.id}：${p.section}`);
  }
});

test('handRaise 選項在兩行標題下方', () => {
  const html = slide('s2-quiz-warmup-2').elements[0].html;
  assert.match(html, /top:170px;display:grid/);
});

test('講師全程用付費版 Claude，Codex 也做得到', () => {
  const [row] = page('s1-login').links;
  assert.equal(row[0][1], 'https://claude.ai');
  assert.ok(row.some(([, url]) => url === 'https://chatgpt.com/codex'));
  assert.ok(page('s1-login').notes.includes('付費版 Claude'));
  for (const id of ['s1-interview', 's2-skill-save']) assert.ok(!page(id).notes.includes('Gemini'), id);
  for (const id of ['s3-review', 's3-fix']) assert.equal(page(id).app, 'Claude', id);
});

// 審查發現：只掃部分欄位會漏掉 dark、cardTitle、links 與共用講稿；改成整頁掃描（prompt 是學員帶回家用的，不掃）
const ACT_ALL = [...ACT, '親手', '換另外兩個', '先填好三個空格', '用個人 Gmail 登入', '有什麼卡住', '卡住的地方', '反過來訪問你', '4 分鐘裡', '把你的 Skill', '整理成你的 Skill', '讓聊天 AI 訪問你', '應用①'];
test('整頁沒有要學員動手的字（不含 prompt）', () => {
  for (const p of deck.slides) {
    const src = listen.pages.find((x) => x.id === p.id);
    const { prompt, ...rest } = src;
    const t = JSON.stringify(rest) + p.notes;
    for (const w of ACT_ALL) assert.ok(!t.includes(w), `${p.id} 出現 ${w}`);
  }
});

test('原版 build 與改動前相同（快照）', async () => {
  const { createHash } = await import('node:crypto');
  const h = createHash('sha256').update(JSON.stringify(buildDeck(base))).digest('hex');
  assert.equal(h, BASE_HASH);
});

test('舉手選項不重複字母、v1→v2 不帶作業連結、上架頁畫面與講稿一致', () => {
  assert.match(page('s2-typhoon').notes, /舉手/);
  assert.equal(page('s3-v2-wall').linkHomework, undefined);
  assert.ok(!JSON.stringify(page('s3-drop').items).includes('自己網站'));
});

test('付費 AI 頁只留問題，細節現場問', () => {
  assert.equal(page('s1-paid').heading, '你有付費的 AI 服務嗎？');
  assert.equal(page('s1-paid').options, undefined);
});
