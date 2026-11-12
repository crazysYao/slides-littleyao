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

const S3 = ['s3', 's3-review', 's3-fix', 's3-v2-upload', 's3-v2-wall', 's3-v2-html', 's3-public',
  's3-ctx-classes', 's3-ctx-teachers', 's3-ctx-window', 's3-ctx-reveal', 's3-newchat', 's3-drop', 's3-obsidian', 's3-recap', 'qa'];

test('全份 58 頁，頁序完整', () => {
  assert.equal(ids.length, 58);
  assert.deepEqual(ids, [...S1, ...S2, ...S3]);
});

test('全份沒有舊工具鏈字眼（內容檔）', () => scan(content.pages));

test('全份沒有舊工具鏈字眼（產出的畫面與講稿，含版型寫死的字）', () => {
  for (const s of buildDeck(content).slides) {
    // 內嵌照片的 base64 可能剛好拼出這些字，先拿掉
    const out = JSON.stringify(s).replace(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/g, '');
    for (const w of [...BANNED, ...(/^s2-skill-\d$/.test(s.id) ? [] : ['Agent'])]) assert.ok(!out.includes(w), `${s.id} 出現 ${w}`);
  }
});

test('fix 與審稿是聊天版', () => {
  assert.ok(text(page('s3-review')).includes('看上面這個網站'));
  assert.ok(text(page('s3-fix')).includes('其他地方不要動'));
});

test('Context 示意圖最後一步是新對話，而且最空', () => {
  const { steps } = page('s3-ctx-window');
  assert.equal(steps.length, 8);
  assert.equal(Math.max(...steps.map((s) => s.used)), steps.at(-2).used);
  assert.ok(steps.at(-1).used < 20);
  assert.ok(steps.at(-2).msgs.some(([kind]) => kind === 'cut'));
  assert.doesNotMatch(JSON.stringify(steps), /token|RAG|Transformer/i);
});

test('八堂課不是固定由淡到深', () => {
  const st = page('s3-ctx-classes').classes.map(([, s]) => s);
  assert.equal(st.length, 8);
  assert.ok(st.indexOf('clear') < st.lastIndexOf('faint'));
});

test('面試自介 Prompt', () => {
  const p = page('s3-newchat').prompt;
  for (const s of ['30 秒', '不要編造', '基本資料']) assert.ok(p.includes(s), s);
});

test('第三節分鐘數加總 57（含 QA 10 分；3 分緩衝沒有頁面）', () => {
  const sum = content.pages
    .slice(content.pages.findIndex((x) => x.id === 's3'))
    .reduce((a, p) => a + Number(p.notes?.match(/^\d\d:\d\d [^(（]*[(（](\d+)[)）]/)?.[1] ?? 0), 0);
  assert.equal(sum, 57);
});

test('作品牆連到存在的作業', () => {
  const hw = new Set(content.pages.filter((p) => p.layout === 'homework').map((p) => p.hwId));
  for (const p of content.pages.filter((x) => x.layout === 'showcase')) assert.ok(hw.has(p.linkHomework), p.id);
  assert.deepEqual([...hw], ['job-skill-up', 'job-v2-up']);
});
