import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck } from './build-deck-html.mjs';
import * as content from './job-site-content.mjs';

const ids = buildDeck(content).slides.map((s) => s.id);
const page = (id) => content.pages.find((p) => p.id === id);
const text = (p) => JSON.stringify(p).replace(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/g, '');

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

const S2 = ['s2', 's2-quiz-warmup-1', 's2-quiz-warmup-2', 's2-quiz-warmup-3', 's2-typhoon-video', 's2-roof', 's2-typhoon', 's2-typhoon-poll', 's2-typhoon-reveal',
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

test('Skill 用一句話觸發，不用打斜線', () => {
  assert.match(page('s2-skill-make').prompt, /我說什麼的時候/);
  assert.ok(page('s2-skill-make').prompt.length < 120);
  assert.ok(!text(page('s2-skill-save')).includes('/名稱'));
  assert.match(page('s2-skill-save').note, /幫我做求職網站/);
});

test('咖啡店七頁照順序', () => {
  const order = content.pages.filter((p) => p.layout === 'skillSlide').map((p) => p.slide);
  assert.deepEqual(order, ['s1-what', 's2-compare-b', 's2-compare', 's3-folder', 's4-skillmd', 's5-flow', 's6-uses']);
});

test('第二節分鐘數加總 50', () => assert.equal(minutes('s2', 'break2'), 50));

const S3 = ['s3', 's3-reel', 's3-review', 's3-fix', 's3-v2-upload', 's3-v2-wall', 's3-public',
  's3-ctx-classes', 's3-ctx-teachers', 's3-ctx-window', 's3-ctx-reveal', 's3-newchat', 's3-drop', 's3-obsidian', 's3-recap', 'qa'];

test('全份 60 頁，頁序完整', () => {
  assert.equal(ids.length, 60);
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

// 設計文件三張時間表的 25 個環節：每個環節第一頁的講稿要用「時間 名稱(分)」開頭
const SCHEDULE = [
  ['s1-outline', '09:00', 4], ['s1-login', '09:04', 5], ['s1-problem', '09:09', 4], ['s1-drink', '09:13', 4], ['s1-gf-1', '09:17', 4],
  ['s1-interview', '09:21', 15], ['s1-prompt-1', '09:36', 11], ['s1-save', '09:47', 3],
  ['s2-quiz-warmup', '10:00', 3], ['s2-typhoon', '10:03', 4], ['s2-style', '10:07', 4], ['s2-prompt-2', '10:11', 20], ['s2-v1-poll', '10:31', 3],
  ['s2-skill-1', '10:34', 5], ['s2-skill-make', '10:39', 8], ['s2-skill-upload', '10:47', 3],
  ['s3-review', '11:00', 13], ['s3-v2-upload', '11:13', 8], ['s3-public', '11:21', 2], ['s3-ctx-classes', '11:23', 7], ['s3-newchat', '11:30', 6],
  ['s3-drop', '11:36', 4], ['s3-obsidian', '11:40', 6], ['s3-recap', '11:46', 1], ['qa', '11:50', 10],
];
const stamp = (p) => (p.notes ?? p.firstNote ?? '').match(/^(\d\d:\d\d) [^(（]*[(（](\d+)[)）]/);

test('25 個環節的時間與分鐘數逐一符合設計的時間表', () => {
  for (const [id, time, min] of SCHEDULE) {
    const m = stamp(page(id));
    assert.ok(m, `${id} 的講稿沒有時間標記`);
    assert.deepEqual([m[1], Number(m[2])], [time, min], id);
  }
  const marked = content.pages.filter(stamp).map((p) => p.id);
  assert.deepEqual(marked, SCHEDULE.map(([id]) => id), '有時間標記的頁，應該剛好是這 25 頁');
  // 前一個環節的開始時間加分鐘數，要等於下一個環節的開始時間（跨休息與緩衝除外）
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const gaps = { 's2-quiz-warmup': 10, 's3-review': 10, qa: 3 };
  SCHEDULE.slice(1).forEach(([id, time], i) => {
    const [, prevTime, prevMin] = SCHEDULE[i];
    assert.equal(toMin(time), toMin(prevTime) + prevMin + (gaps[id] ?? 0), `${id} 的開始時間接不上前一個環節`);
  });
});

test('審查修正：講稿前後一致', () => {
  // Skill 是今天帶走的第三樣（基本資料、網站 v2、Skill），回顧頁也是這個順序
  assert.match(page('s2-skill-upload').notes, /第三樣/);
  assert.deepEqual(page('s3-recap').compare, ['一份「我的基本資料」', '網站 v2', '一個自己做的 Skill']);
  // 09:09 到 11:30 不到三小時
  assert.doesNotMatch(page('s3-newchat').notes, /三小時前/);
  // 前面一路在同一個對話做，揭曉「一個對話只做一件事」時要交代為什麼
  assert.match(page('s3-ctx-reveal').notes, /同一個對話/);
  // 三欄對應咖啡店第 5 頁，畫面上要看得到
  assert.match(page('s2-skill-make').tag, /Metadata/);
});

test('總體審查修正：上傳前先提醒個資、登入頁講到 Skills、示意圖交代各自操作', () => {
  // 反目標：上傳的作品不能出現私人手機、身分證、住址；提醒要在上傳那一頁就出現，不是上傳之後
  assert.match(page('s3-v2-upload').description, /私人手機、身分證、住址/);
  assert.match(page('s3-v2-upload').notes, /私人手機、身分證、住址/);
  // 學校帳號沒有 Canvas，也不能用 Skills
  assert.match(page('s1-login').notes, /Skills/);
  // 示意圖在每個人的裝置上各自從第一步開始
  assert.match(page('s3-ctx-window').notes, /大螢幕/);
});

test('對抗審查修正：換工具也不行時有出路，v1 上牆要標明是 v1', () => {
  // 換了 ChatGPT／Claude 還是沒有網頁預覽時，救援卡要給下一步，不能讓學員停在那裡
  const rescue = page('s2-rescue').rows.map(([, label, body]) => `${label} ${body}`).join('\n');
  assert.match(rescue, /換了還是不行/);
  assert.match(rescue, /助教/);
  // 來不及做 v2 的人交 v1，但要標明，牆上才不會把 v1 當成 v2
  assert.match(page('s3-v2-upload').description, /還沒做出 v2[\s\S]*v1/);
  assert.match(page('s3-v2-wall').notes, /v1/);
});

test('對抗審查第 2 輪：救援不把學員的資料貼進同學的帳號', () => {
  const p = page('s2-rescue');
  const rescue = p.rows.map(([, label, body]) => `${label} ${body}`).join('\n');
  // 基本資料有學經歷與聯絡方式，只能交給助教，而且要本人同意
  assert.doesNotMatch(rescue, /同學/);
  assert.doesNotMatch(p.notes, /同學.*帳號|帳號.*同學/);
  assert.match(rescue, /助教/);
  assert.match(p.notes, /同意/);
});
