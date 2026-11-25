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
const BASE_HASH = 'c4d87d0920cc740a8dbebfd25e7d14a8188f092c46db4586393f180b0a943e84'; // 2026-11-25 copy-paste-demo 改電腦在前後的原版 build；改 html-layouts 讓原版變了就會失敗
const STAT = ['poll', 'quiz', 'checkpoint', 'homework', 'showcase', 'webProject', 'wordcloud'];

test('頁序引用的原版 id 都存在', () => {
  for (const x of listen.ORDER) if (typeof x === 'string') assert.ok(baseIds.has(x), x);
});

// 2026-11-24 講師決定開回 Synora 投票與搶答，只限這幾頁
const STAT_OK = ['s1-paid', 's1-ai-exp', 's2-typhoon-poll', 'l-reel-poll', 'l-your-turn', 'l-quiz-s2-1', 'l-quiz-s2-2', 'l-quiz-s2-3', 'l-quiz-s3-1'];
test('統計元件只出現在投票與搶答頁', () => {
  for (const s of deck.slides) for (const e of s.elements) if (STAT.includes(e.type)) assert.ok(STAT_OK.includes(s.id), `${s.id} 有 ${e.type}`);
  for (const id of STAT_OK) assert.ok(slide(id).elements.some((e) => ['poll', 'quiz', 'wordcloud'].includes(e.type)), id);
});

test('投票與搶答頁講稿都有聊天室備案', () => {
  for (const id of ['s1-paid', 's1-ai-exp', 's2-typhoon-poll', 'l-quiz-s2-1', 'l-quiz-s3-1']) assert.match(slide(id).notes, /Meet 聊天室/, id);
});

test('刪掉的頁不在', () => {
  for (const id of ['s1-save-poll', 's2-rescue', 's2-v1-poll', 's2-skill-upload', 's3-try', 's3-v2-upload', 's3-obsidian', 's2-quiz-warmup-1', 's2-quiz-warmup-2', 's2-quiz-warmup-3', 's3-v2-wall'])
    assert.ok(!ids.includes(id), id);
});

test('頁序以外的原版頁不會混進來', () => {
  const ordered = new Set(listen.ORDER.filter((x) => typeof x === 'string'));
  for (const id of ids) if (baseIds.has(id)) assert.ok(ordered.has(id), id);
});

test('投票頁：第 8 頁只留 4 個選項', () => {
  for (const id of ['s1-ai-exp', 's1-paid']) assert.equal(page(id)?.layout, 'multiChoice', id);
  assert.deepEqual(page('s1-ai-exp').options, ['問問題', '寫報告／作業', '寫履歷或自傳', '還沒用過']);
});

test('複製卡保留', () => {
  for (const id of ['s1-interview-card', 's2-skill-make', 's3-newchat'])
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
  for (const id of ['s1-interview', 's1-interview-card', 's2-prompt-2', 's2-skill-make', 's3-newchat']) assert.match(page(id).tag, /^講師示範/, id);
});

test('跟著改字', () => {
  for (const id of ['cover', 's1-outline', 's1', 's2', 's3', 's3-recap', 'qa']) assert.ok(listen.OVERRIDES[id], id);
  assert.notEqual(page('cover').subtitle, base.pages.find((p) => p.id === 'cover').subtitle);
  assert.ok(!JSON.stringify(page('s3-recap')).includes('上傳'));
});

test('第三節頁序', () => {
  assert.deepEqual(ids.slice(ids.indexOf('s3')), ['s3', 'l-quiz-s3-1', 'l-localhost', 'v-ways', 's3-drop', 'v-cli', 'v-github', 'jp-bridge', 'l-pk-first', 'jp-why', 'jp-loop', 'jp-skills', 'jp-scene', 'jp-map', 'l-your-turn', 's3-recap', 'jp-pk', 'qa']);
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

test('日文對回今天（動畫頁）', () => {
  assert.equal(page('jp-map').layout, 'opDemo');
  const t = slide('jp-map').elements[0].html;
  assert.ok(t.includes('id="jpm"') && t.includes('__SYNORA_CAPTURE__') && !t.includes('infinite'));
  for (const w of ['基本資料', 'Skill', 'Context', 'japanes-pk.littleyao.me']) assert.ok(t.includes(w), w);
  const link = slide('jp-map').elements.find((e) => e.type === 'link');
  assert.equal(link.linkUrl, 'https://japanes-pk.littleyao.me');
});

test('頁首節次編號跟著聽課版節次', () => {
  const pids = listen.pages.map((p) => p.id);
  const nth = (id) => (pids.indexOf(id) < pids.indexOf('s2') ? '01' : pids.indexOf(id) < pids.indexOf('s3') ? '02' : '03');
  for (const p of listen.pages) {
    const m = (p.section ?? '').match(/^(0\d) /);
    if (m) assert.equal(m[1], nth(p.id), `${p.id}：${p.section}`);
  }
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
    const src = listen.pages.find((x) => x.id === p.id || p.id.startsWith(`${x.id}-`));
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
  assert.ok(ids.indexOf('s2-typhoon-poll') === ids.indexOf('s2-typhoon') + 1);
  assert.ok(!JSON.stringify(page('s3-drop').items).includes('自己網站'));
});

test('付費 AI 頁改回投票，細節現場問', () => {
  assert.match(page('s1-paid').notes, /現場問幾位/);
});

test('颱風短片換新連結', () => {
  assert.equal(page('s2-typhoon-video').link[0], 'https://www.youtube.com/shorts/qJVypjZNBF8');
});

// Prompt ② 卡片保留一句「Gemini、ChatGPT 用 Canvas」給回家用別家的人，其餘不得出現
test('預設操作說明一律是 Claude：整份只剩第 5 頁提到 Gemini', () => {
  for (const s of deck.slides) {
    if (s.id === 's1-login' || s.id === 's1-paid') continue; // 付費 AI 投票的選項本來就列各家
    const t = JSON.stringify(s).replaceAll('（Gemini、ChatGPT 用 Canvas）', '').replace(/data:[a-z]+\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, '');
    assert.ok(!/Gemini|Canvas（Claude/.test(t), s.id);
  }
  assert.match(page('s2-prompt-2').prompt, /^請用 Artifact/);
  assert.equal(page('s2-skill-save').demo, 'skill-save-demo-claude');
});

test('資安頁：標題點明資安，多一點「貼給 AI 的資料也要挑」', () => {
  const p = page('s3-public');
  assert.match(p.heading, /^資安/);
  const t = JSON.stringify(p.cards);
  for (const w of ['不要貼給 AI', '密碼', '身分證', '作品連結']) assert.ok(t.includes(w), w);
  assert.match(p.notes, /^10:26 資安提醒\(4\)/);
});

test('日文動線改成互動圖：我、Agent、Skills、Obsidian 資料', () => {
  const p = page('jp-loop');
  assert.equal(p.layout, 'opDemo');
  const html = slide('jp-loop').elements[0].html;
  for (const w of ['<title>Obsidian</title>', '<title>Claude</title>', '我', 'Agent', 'Skills', '複習清單', '__SYNORA_CAPTURE__']) assert.ok(html.includes(w), w);
  assert.match(p.notes, /^11:18 /);
});

test('聽課版沒有無限循環動畫', () => {
  for (const s of deck.slides) assert.ok(!/infinite/.test(s.elements[0].html), s.id);
});

test('互動圖有 MCP 連到 Google Drive', () => {
  const html = slide('jp-loop').elements[0].html;
  for (const w of ['<title>Google Drive</title>', 'MCP', '考古題']) assert.ok(html.includes(w), w);
});

test('第 2 頁講師自我介紹：四段經歷各一張真照片＋身份與學員數', () => {
  assert.equal(ids[1], 'intro');
  const p = page('intro');
  assert.equal(p.layout, 'photoWall');
  assert.match(p.notes, /^09:00 講師自我介紹\(2\)/);
  assert.equal(p.photos.length, 4);
  for (const ph of p.photos) assert.match(ph.src, /^data:image\/jpeg;base64,/);
  const html = slide('intro').elements[0].html;
  for (const w of ['David（CrazyYao）', '安東社大', '開南大學', '聰電站', '超級聰電站', '後端工程師 7+ 年', '49+'])
    assert.ok(html.includes(w), w);
});

test('Prompt ① 拆成兩頁：技巧拆解動畫＋下一頁複製卡', () => {
  const p = page('s1-interview');
  assert.equal(p.layout, 'opDemo');
  assert.equal(p.demo, 'prompt-anatomy-demo');
  const s = slide('s1-interview');
  assert.equal(s.elements.some((e) => e.type === 'copycard'), false);
  assert.equal(ids[ids.indexOf('s1-interview') + 1], 's1-interview-card');
  const card = slide('s1-interview-card').elements.find((e) => e.type === 'copycard');
  assert.equal(card.content, base.pages.find((x) => x.id === 's1-interview').prompt);
  assert.doesNotMatch(page('s1-interview-card').notes, /^\d\d:\d\d/);
  const html = s.elements[0].html;
  for (const w of ['角色', '用途', '一次問一題', '附範例', '追問', '「？」', '隱私', '欄位', '先確認', 'Markdown', '__SYNORA_CAPTURE__'])
    assert.ok(html.includes(w), w);
  assert.equal(html.includes('infinite'), false);
});

test('發現問題頁：強調「一開始只打一句目的，就讓 Agent 跑」', () => {
  const p = page('s1-problem');
  assert.match(p.caption, /AI Agent/);
  assert.match(p.after, /讓它/);
  assert.match(p.notes, /^09:11 發現問題\(4\)/);
});

test('「但同一招」頁改圖示對照＋結論條', () => {
  const p = page('s1-gf-3');
  assert.equal(p.layout, 'sameMove');
  assert.equal(p.give, undefined); // 三個條件改口述（attention-review 第 8 條）
  assert.match(p.notes, /發生什麼事、要什麼結果、怎樣算做好/);
  assert.equal(p.equation, undefined);
  assert.equal(p.left.ok, false);
  assert.equal(p.right.ok, true);
});

test('時間重分配：第一節留 2 分緩衝、Skill 6 分、CLI 6 分、日文示範 9 分', () => {
  const n = (id) => listen.pages.find((p) => p.id === id).notes;
  assert.match(n('s2-style'), /^09:39 找風格\(2\)/);
  assert.match(n('s2-skill-1'), /^10:04 Skill\(6\)/);
  assert.ok(n('s2-skill-7').length < 250);
  assert.match(n('s2-qa'), /^10:41 舉手 QA\(9\)/);
  assert.match(n('v-cli'), /^11:10 工程師怎麼上線：CLI\(2\)/);
  assert.match(n('jp-scene'), /^11:22 專屬練習情境\(5\)/);
});

test('Prompt ③ 聽課版：限一兩句、只挑一處、不叫 AI 寫 fix:', () => {
  const p = listen.pages.find((x) => x.id === 's3-review');
  const text = p.lines.map((l) => l[1]).join('');
  assert.match(text, /30 份應徵資料/);
  assert.match(text, /只挑一處/);
  assert.doesNotMatch(text, /fix:/);
});

test('CLI 頁改成操作動畫：終端機打三行指令、網址上線', () => {
  assert.equal(page('v-cli').layout, 'opDemo');
  const html = slide('v-cli').elements[0].html;
  for (const w of ['id="vcd"', 'npm i -g vercel', 'vercel login', 'vercel --prod', '.vercel.app', '__SYNORA_CAPTURE__']) assert.ok(html.includes(w), w);
  assert.equal(html.includes('infinite'), false);
});

test('GitHub 頁改成操作動畫：推上 GitHub，Vercel 自動上線', () => {
  assert.equal(page('v-github').layout, 'opDemo');
  const html = slide('v-github').elements[0].html;
  for (const w of ['id="vgh"', 'git push', 'Building', 'Ready', 'CI/CD', '__SYNORA_CAPTURE__']) assert.ok(html.includes(w), w);
  assert.equal(html.includes('infinite'), false);
});

test('日檢動機頁改成動畫：目標、弱點、時間、所以，不出現分數', () => {
  assert.equal(page('jp-why').layout, 'opDemo');
  const html = slide('jp-why').elements[0].html;
  for (const w of ['id="jpw"', 'N3', '聽力', '8 小時', '已經會', '__SYNORA_CAPTURE__']) assert.ok(html.includes(w), w);
  assert.doesNotMatch(html, /\d+\s*分|及格|N4/);
  assert.equal(html.includes('infinite'), false);
});

test('attention-review 精簡：Skill 3 張、回顧只留帶走 3 條', () => {
  assert.equal(page('jp-skills').tiles.length, 3);
  assert.equal(page('s3-recap').layout, 'three');
  assert.equal(page('s3-recap').cards.length, 3);
});

test('動畫步驟卡合併成 3 張', () => {
  for (const id of ['v-github', 'jp-why', 'jp-loop', 'jp-map']) {
    const html = slide(id).elements[0].html;
    assert.equal((html.match(/class="rc[^"]*" data-step=/g) ?? []).length, 3, id);
    assert.ok(!/setStep\(5\)/.test(html), id);
  }
});

test('第三節最後是跟講師 PK', () => {
  const p = page('jp-pk');
  assert.match(p.notes, /^11:35 PK\(10\)/);
  assert.equal(p.link[0], 'https://japanes-pk.littleyao.me');
});

test('讀者審稿與 fix: 標題回應短片「沒有人看過內容」', () => {
  assert.equal(page('s3-review').heading, 'Prompt ③：這次，我先看過');
  assert.equal(page('s3-fix').heading, '看懂了，改哪裡我決定');
});

test('資安頁前先播直播漏金鑰，只留這一支', () => {
  assert.equal(ids[ids.indexOf('s3-public') - 1], 'v-token');
  assert.ok(!ids.includes('v-env') && !ids.includes('v-gitignore'));
  assert.match(page('v-token').notes, /^10:25 .*猜猜/);
  assert.equal(page('v-token').link[0], 'https://www.youtube.com/shorts/WhC6iSFDtZk');
});

test('概念段先出大標題頁，再進例子', () => {
  for (const [title, first, h] of [['l-desc-title', 's1-drink', '具體描述'], ['l-reader-title', 's2-typhoon-video', '給誰看'], ['l-skill-title', 'v-exact', 'Skill'], ['l-ctx-title', 's3-ctx-classes', 'Context']]) {
    assert.equal(ids[ids.indexOf(first) - 1], title, first);
    assert.equal(page(title).heading, h);
  }
});

test('Skill 段先播照字面做三明治，再進咖啡店', () => {
  assert.equal(ids[ids.indexOf('s2-skill-1') - 1], 'v-exact');
  assert.equal(page('v-exact').link[0], 'https://youtu.be/7vZ9bGW5WoI');
});

test('節奏複查：付費 AI 4 選項、短片後投票（日文投票講師決定刪除）', () => {
  assert.equal(page('s1-paid').options.length, 4);
  assert.equal(ids[ids.indexOf('s3-reel') + 1], 'l-reel-poll');
  assert.ok(!ids.includes('l-jp-poll'));
  assert.equal(page('intro').facts.length, 2);
});

test('第三節改成先看成品、再講方法、最後換學員想', () => {
  assert.ok(ids.indexOf('l-pk-first') < ids.indexOf('jp-why'));
  assert.ok(!ids.includes('jp-need'));
  assert.ok(ids.indexOf('jp-pk') < ids.indexOf('qa'));
  assert.ok(slide('l-your-turn').elements.some((e) => e.type === 'wordcloud'));
  assert.ok(!page('jp-scene').items[0].includes('ちゃ'));
});

test('QA 最後附 Instagram 聯絡方式（內嵌 QR，不用上傳圖片）', () => {
  const html = slide('qa').elements[0].html;
  assert.ok(html.includes('@david.jhang.3979'));
  assert.ok(html.includes('<svg') && !html.includes('data:image'));
  assert.equal(ids.at(-1), 'qa');
});

test('學生端動畫後接學員期待一頁，講稿有聊天室備案', () => {
  assert.equal(ids[ids.indexOf('l-synora') + 1], 'l-expect');
  for (const e of slide('l-expect').elements.filter((x) => x.type === 'opentext')) assert.ok(e.question && e.x + e.width <= 960 && e.y + e.height <= 540);
  assert.match(slide('l-expect').notes, /Meet 聊天室/);
});

test('課綱後先播學生端操作動畫，再進開放問答', () => {
  assert.deepEqual(ids.slice(ids.indexOf('s1-outline'), ids.indexOf('s1-outline') + 3), ['s1-outline', 'l-synora', 'l-expect']);
  assert.match(slide('l-synora').elements[0].html, /id="sjd"/);
  assert.match(slide('l-synora').notes, /AIORRCFD/);
});

// 2026-11-25 手機端：學生手機看到的是等比縮小的整張投影片，操作動畫字幕與步驟卡、複製卡頁步驟晶片要放大
const DEMO_BIG = { 's1-save': 'cpd', 's1-interview': 'pan', 's2-skill-save': 'sks', 's2-skill-find': 'skf', 'v-cli': 'vcd', 'v-github': 'vgh', 'jp-why': 'jpw', 'jp-loop': 'alp', 'jp-map': 'jpm' };
test('手機端：操作動畫字幕 18px、按鈕 13px', () => {
  for (const [id, box] of Object.entries(DEMO_BIG)) {
    const h = slide(id).elements[0].html;
    assert.ok(h.includes(`#${box} .caption{font-size:18px}`), id);
    assert.ok(h.includes(`#${box} .btn{font-size:13px}`), id);
  }
});
test('手機端：複製卡頁步驟晶片放大到 17px', () => {
  for (const id of ['s1-interview-card', 's2-skill-make', 's3-newchat']) assert.ok(slide(id).elements[0].html.includes('.chips span{font-size:17px'), id);
});
test('開放問答合成一頁：兩個問題共用一個輸入框、輸入框夠寬', () => {
  const qs = slide('l-expect').elements.filter((e) => e.type === 'opentext');
  assert.equal(qs.length, 1);
  assert.ok(qs[0].width >= 800);
  assert.match(qs[0].question, /最想帶走什麼/);
  assert.match(qs[0].question, /讓 AI 幫忙/);
  assert.ok(!ids.includes('l-expect-1') && !ids.includes('l-expect-2'));
});
test('學員期待頁顯示學生端連結，電腦也能加入作答', () => {
  const links = slide('l-expect').elements.filter((e) => e.type === 'link');
  assert.equal(links.length, 1);
  assert.equal(links[0].linkUrl, 'https://synora.biz/app/student/AIORRCFD');
  assert.match(links[0].linkLabel, /synora\.biz\/app\/student\/AIORRCFD/);
  const [q] = slide('l-expect').elements.filter((e) => e.type === 'opentext');
  assert.ok(q.y + q.height <= links[0].y && links[0].y + links[0].height <= 540);
});
test('學員端動畫頁一律建議用電腦：預設播電腦版、提示放學生端網址', () => {
  const h = slide('l-synora').elements[0].html;
  assert.match(h, /mode='desktop'/);
  assert.match(h, /<button data-mode="desktop" class="on">用電腦<\/button>/);
  assert.match(h, /建議用電腦：(\n|\\n)synora\.biz\/app\/student\/AIORRCFD/);
  assert.ok(!h.includes('手機橫著拿'));
  assert.match(page('l-synora').heading, /建議用電腦/);
  assert.match(slide('l-synora').notes, /作答中/);
  assert.match(h, /id="phoneNotice"[^>]*>[^<]*手機暫時無法使用互動功能[^<]*平台還在修正 bug/);
});

test('學員端動畫：手機／電腦切換，演加入、作答、自行瀏覽、複製，按鈕名稱照 Synora 學員端', () => {
  const h = slide('l-synora').elements[0].html;
  for (const w of ['用手機', '用電腦', '加入課堂', '課堂代碼', '你的姓名', '送出', '自行瀏覽', '回到講師', '複製']) assert.ok(h.includes(w), w);
  assert.match(slide('l-synora').notes, /自行瀏覽/);
  assert.match(slide('l-synora').notes, /全螢幕/);
});
test('學員端動畫裡的頁碼與實際頁序一致', () => {
  const h = slide('l-synora').elements[0].html;
  const no = (id) => ids.indexOf(id) + 1;
  assert.ok(h.includes(`第 ${no('s1-paid')} 頁`), 's1-paid');
  assert.ok(h.includes(`setBrowse(${no('s1-login')},'登入聊天 AI'`), 's1-login');
  assert.ok(h.includes(`setBrowse(${no('s1-gf-2')},`), 's1-gf-2');
  assert.ok(h.includes(`第 ${no('s2-prompt-2')} 頁`), 's2-prompt-2');
  assert.ok(h.includes(`/ ${ids.length}`), 'total');
});
test('手機／電腦切換一律電腦在前、預設電腦', () => {
  for (const id of ['l-synora', 's1-save']) {
    const h = slide(id).elements[0].html;
    const seg = h.match(/<button data-mode="(\w+)" class="on">[^<]*<\/button>\s*<button data-mode="(\w+)">/);
    assert.deepEqual(seg && [seg[1], seg[2]], ['desktop', 'phone'], id);
    assert.match(h, /mode='desktop'/, id);
  }
  assert.match(slide('s1-save').elements[0].html, /class="device desktop"/);
});
