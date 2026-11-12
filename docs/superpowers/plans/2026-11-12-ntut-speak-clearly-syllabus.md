# 北科大求職網站課改版（講清楚 → 做出來 → 改更好＋應用）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `job-site-content.mjs` 從 OpenCode＋Vercel 版的 50 頁，改成核准設計的 58 頁（學員只用聊天 AI、名詞只講 Prompt／Skill／Context），並同步教案與檢查工具。

**Architecture:** 內容仍集中在 `job-site-content.mjs`，能沿用的頁面沿用現有版型。新增兩個版型檔：`html-skill.mjs` 把咖啡店 Skill 章節 7 頁（1920×1080 單頁 HTML）轉成 Synora 的 960×540 HTML；`html-context.mjs` 放 Context 的「八堂課」與互動示意圖。兩者在 `html-layouts.mjs` 結尾併入 `layouts`。共用的舊產生器 `build-deck.mjs` 不動。

**Tech Stack:** Node 22（`node`，本機 v22.15.0）、`node:test`、純 HTML／CSS／少量內嵌 JS，不加任何依賴。Synora runtime 0.9.3。

**Spec:** `docs/superpowers/specs/2026-11-12-ntut-speak-clearly-syllabus-design.md`（講師 2026-11-12 核准）。Prompt、講稿重點、時間表的文字都以它為準，本計畫只引用小節名稱，不重抄。

指令中的變數（都在 repo 根目錄執行）：

```bash
SYN=docs/ntut-ai-course/synora
SY=/Users/yao/.claude/plugins/cache/synora-official/synora/0.9.3/scripts/synora.mjs
OUT=<本次 session 的 scratchpad>   # 暫存輸出，不進 repo
```

## Global Constraints
- 畫布 960×540；每頁第一個元件是 `type: 'html'`、`x:0,y:0,width:960,height:540`，id 為 `${slideId}-bg`
- HTML 不載入任何外部資源（無 `http` 的 `<link>`、`<script src>`、`url(http`）；圖片一律 data URI；只用系統字體
- `prefers-reduced-motion: reduce` 與 `window.__SYNORA_CAPTURE__ === true` 時顯示有內容的最終畫面
- 沿用頁面的配色只用 `palette`；咖啡店 7 頁保留自己的配色（講師已看過並採用）
- 講稿開頭「`HH:MM 名稱(分)`」只寫在每個環節的第一頁；三節加總必須是 50、50、57（第三節含 QA 10 分，另有 3 分緩衝沒有頁面）
- 學員看得到的文字與講稿不得出現：`OpenCode`、`npx`、`site/index.html`、`my-site`、`AI Studio`、`job-site-template`、`Context Engineering`、`MCP`
- `Agent` 只可以出現在咖啡店 7 頁（`s2-skill-1` 到 `s2-skill-7`）
- 不動 `build-deck.mjs`、`content.mjs`、`topic-f-content.mjs`、`package.json`、`slides/`
- 不推送 Synora 遠端、不開放學員入口
- Commit：Conventional Commits，正文繁中，結尾 `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`

## Review Focus
1. 舊工具鏈字眼殘留在講稿或 Prompt 裡（例如 fix 還寫「只改 site/index.html」）→ 學員照做會卡住。測試在 Task 4（全份掃描，Task 5、6 持續生效）
2. Context 互動示意圖在截圖、PDF、關閉動畫時是空白 → 伺服端先畫出一步，測試在 Task 2
3. 咖啡店頁轉檔後留下 Synora 不認得的 `<x-icon>`、`<x-shape>` 或 `/_blob/` 圖片路徑 → 圖示與照片消失。測試在 Task 3
4. 展示牆連到不存在的作業、三節分鐘數加總不對 → `check-deck.mjs --sections`，Task 6
5. 文字太長被 `overflow:hidden` 裁掉、照片讓 deck 過大被 Synora 拒收 → `doctor` 與 `render` 逐頁看圖，Task 3、Task 8

## 檔案結構
| 檔案 | 動作 | 責任 |
|---|---|---|
| `$SYN/html-context.mjs` | 新增 | `contextLayouts = { ctxClasses, ctxWindow }` |
| `$SYN/html-context.test.mjs` | 新增 | 上面兩個版型的測試 |
| `$SYN/html-skill.mjs` | 新增 | `toSynora()`、`skillSlides`、`skillNotes`、`skillLayouts = { skillSlide }` |
| `$SYN/html-skill.test.mjs` | 新增 | 轉檔測試 |
| `$SYN/html-layouts.mjs` | 修改 | 結尾併入兩組新版型；`skillTemplate` 的視窗標題改成可設定 |
| `$SYN/job-site-content.mjs` | 修改 | 58 頁內容 |
| `$SYN/job-site-content.test.mjs` | 新增 | 頁序、禁用字、Prompt 關鍵句 |
| `$SYN/build-deck-html.test.mjs`、`$SYN/html-layouts.test.mjs` | 修改 | 全份測試的數字；`copyMock` 測試改用 fixture |
| `$SYN/check-deck.mjs` | 修改 | 三節時間範圍 |
| `docs/ntut-ai-course/skill-chapter/slides/*.html` | 修改 | 用詞統一、補銜接句 |
| `docs/ntut-ai-course/skill-chapter/assets/*.jpg` | 新增 | 兩張照片的壓縮版 |
| `docs/ntut-ai-course/job-site-syllabus.md`、`README.md` | 修改 | 教案與狀態 |

---

## Task 0：分支基底
這個分支目前從 main 開出，但訪問卡 5 題版與 8 種風格頁在 PR #41（`origin/crazysYao/ntut-interview-5q`，head `ff68d5e`）。

- [ ] **Step 1**：`git fetch origin`。若 PR #41 已合併，`git rebase origin/main`；否則 `git rebase origin/crazysYao/ntut-interview-5q`，把本分支的文件 commit 疊在它上面
- [ ] **Step 2**：把 spec〈留給 builder〉最後一行改成：「PR #41 未合併時，實作分支疊在 `crazysYao/ntut-interview-5q` 上；它合併後用 `git rebase --onto origin/main ff68d5e` 移回 main，再開 PR」。〈Claude 的判斷〉裡對應那一條同步改
- [ ] **Step 3**：`node --test "$SYN/*.test.mjs"`，預期全部通過（基準線）
- [ ] **Step 4**：commit `docs: 改版設計註明實作分支疊在 PR #41 上`

---

# Checkpoint A：新版型（高風險，完成即送審）

## Task 1：Synora HTML 元件探針
要先知道兩件事，Task 2、3 的做法才定得下來：HTML 元件裡的按鈕在簡報模式能不能點；內嵌 data URI 圖片過不過得了 `doctor`。

- [ ] **Step 1**：在 `$OUT/probe.json` 寫一份單頁 deck。唯一元件是滿版 `html`，內容有一顆按鈕（點一下數字加 1 的內嵌 script）和一張 `<img src="data:image/jpeg;base64,…">`。圖片用 `sips -s format jpeg -s formatOptions 80 -Z 1200 docs/ntut-ai-course/skill-chapter/assets/latte-heart.png --out $OUT/heart.jpg` 產生
- [ ] **Step 2**：`node $SY doctor $OUT/probe.json --json`，預期 `ok: true`
- [ ] **Step 3**：背景執行 `node $SY preview $OUT/probe.json`，用 Playwright 開它印出的網址，在簡報畫面點按鈕，讀回數字。預期變成 1；圖片的 `naturalWidth` 大於 0
- [ ] **Step 4**：把結果寫進本檔結尾〈執行紀錄〉：
  - `CLICK=yes|no`
  - `DATA_URI=ok|rejected`（rejected 時記下錯誤訊息與大小）
- [ ] **Step 5**：commit `docs: 記錄 Synora HTML 元件探針結果`

決策規則（後面兩個 Task 會用到）：
- `CLICK=no` → `ctxWindow` 改成每 2.5 秒自動前進、播完停在最後一步 3 秒再重來
- `DATA_URI=rejected` → 照片改成原生 `svg` 佔位框（`n.shotFrame`），講師課前在 Synora 換成照片；在完成報告列為未驗證項

## Task 2：Context 版型 `html-context.mjs`

**Files:**
- Create: `$SYN/html-context.mjs`、`$SYN/html-context.test.mjs`
- Modify: `$SYN/html-layouts.mjs`（結尾 `Object.assign(layouts, contextLayouts)`）

**Interfaces:**
- Consumes: `esc`（`html-kit.mjs`）；版型簽名與現有相同 `(p, { palette, n }) => ({ body, natives, loop? })`
- Produces: `export const contextLayouts = { ctxClasses, ctxWindow }`
  - `ctxClasses` 吃 `p.heading`、`p.classes: [label, 'clear'|'faint'|'lost'][]`、`p.note`
  - `ctxWindow` 吃 `p.heading`、`p.capLabel`、`p.disclaimer`、`p.steps: { used: number(0–100), event: string, msgs: [kind, label, text][] }[]`，`kind` 是 `'me'|'ai'|'big'|'cut'|'sum'`

- [ ] **Step 1：寫失敗的測試**（`html-context.test.mjs`，用測試內的 fixture，不依賴內容檔）

```js
const P = { text: '#16161a', accent: '#f5b400', muted: '#62646b', line: '#ebe7de', dark: '#16161a', darkSub: '#c9c6bd', bg: '#fbfaf7' };
const win = { heading: 'H', capLabel: '這一輪 AI 看得到的內容', disclaimer: '示意圖', steps: [
  { used: 10, event: '貼上訪問卡', msgs: [['me', '訪問卡', '一次問我一題']] },
  { used: 100, event: '塞滿了', msgs: [['cut', '訪問問答', '沒有送進這一輪'], ['big', '網站 v2', '<html>']] },
  { used: 14, event: '開新對話', msgs: [['me', '基本資料副本', '…']] },
] };

test('ctxWindow：資料完整內嵌，可還原', () => {
  const { body, natives } = contextLayouts.ctxWindow(win, { palette: P });
  const json = body.match(/<script type="application\/json" id="cw-data">([\s\S]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(json), win.steps);
  assert.deepEqual(natives ?? [], []);
});
test('ctxWindow：沒有 JS 也看得到「塞滿」那一步', () => {
  const { body } = contextLayouts.ctxWindow(win, { palette: P });
  const stat = body.replace(/<script[\s\S]*?<\/script>/g, '');
  assert.match(stat, /訪問問答/);
  assert.match(stat, /100%/);
  assert.match(stat, /示意圖/);
});
test('ctxWindow：內容跳脫、不載外部資源、認得截圖模式', () => {
  const { body } = contextLayouts.ctxWindow(win, { palette: P });
  assert.doesNotMatch(body.replace(/<script[\s\S]*?<\/script>/g, ''), /<html>/);
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
```

`CLICK=no` 時，把「有下一步與重設」那個測試換成 `assert.match(body, /setInterval|setTimeout/)`，並讓版型回傳 `loop: true`。

- [ ] **Step 2**：`node --test $SYN/html-context.test.mjs`，預期 FAIL（找不到模組）
- [ ] **Step 3：實作**
  - `ctxWindow` 的畫面照 `docs/ntut-ai-course/references/llm-context-window-interactive.html`：一個框、右上角顯示 `used%`、訊息由下往上疊、`cut` 是虛線紅框、`sum` 是綠色、`big` 高度是一般訊息的兩倍以上；下方「下一步」「重設」兩顆按鈕與進度點
  - 伺服端先畫出 `used` 最大的那一步（靜態 HTML），script 啟動後才回到第一步；截圖模式與 `prefers-reduced-motion` 維持靜態那一步
  - JSON 內嵌時把 `<` 換成 `<`
  - `ctxClasses`：八個等大的方格排一列，`clear` 實色、`faint` 半透明、`lost` 虛線框加「？」；不畫高低長條
- [ ] **Step 4**：`node --test "$SYN/*.test.mjs"`，預期全部通過
- [ ] **Step 5：看圖**。在 `$OUT/probe-content.mjs` 轉出 `brand`、`palette`，`pages` 放一頁 `ctxWindow`、一頁 `ctxClasses`（內容先用 spec〈Context〉的八步與八堂課）。`node $SYN/build-deck-html.mjs $OUT/ctx.json $OUT/probe-content.mjs`，再用 `node $SY render`（旗標以 `node $SY help render --json` 為準）出圖逐頁看：沒有裁字、塞滿那一步看得出最舊的被擠出去
- [ ] **Step 6**：commit `feat: Context 版型（八堂課方格、互動示意圖）`

## Task 3：咖啡店 Skill 章節 `html-skill.mjs`

**Files:**
- Create: `$SYN/html-skill.mjs`、`$SYN/html-skill.test.mjs`、`docs/ntut-ai-course/skill-chapter/assets/latte-spill.jpg`、`latte-heart.jpg`
- Modify: `$SYN/html-layouts.mjs`（結尾 `Object.assign(layouts, skillLayouts)`）、`docs/ntut-ai-course/skill-chapter/slides/s1-what.html`、`s5-flow.html`

**Interfaces:**
- Produces:
  - `export const toSynora = (html: string, images: Record<string, string>) => { body: string, notes: string }`：`images` 的 key 是 `/_blob/…` 路徑，value 是 data URI
  - `export const skillSlides: Record<slideName, string>`、`export const skillNotes: Record<slideName, string>`，`slideName` 是 `deck.json` 的 `order`：`s1-what`、`s2-compare`、`s2-compare-b`、`s3-folder`、`s4-skillmd`、`s5-flow`、`s6-uses`
  - `export const skillLayouts = { skillSlide: (p) => ({ body: skillSlides[p.slide], natives: [] }) }`

- [ ] **Step 1：改原始檔的用詞**
  - `s1-what.html` 講稿「客人點的單是 Prompt」→「客人的點餐單是 Prompt」
  - `s5-flow.html` 講稿結尾的銜接語前加一句：「今天大家用的聊天 AI 不會自己去書架找手冊，所以等一下要你親手把手冊遞給它。」
- [ ] **Step 2**：用 Task 1 的 `sips` 指令把兩張 PNG 轉成寬 1200 的 JPEG，放進 `assets/`
- [ ] **Step 3：寫失敗的測試**

```js
test('toSynora：拿掉 Slides 專用標籤與路徑', () => {
  for (const [name, body] of Object.entries(skillSlides)) {
    assert.doesNotMatch(body, /<x-icon|<x-shape|<section|<aside|\/_blob\//, name);
    assert.doesNotMatch(body, /https?:\/\//, name);
    assert.match(body, /width:1920px;height:1080px/, name);
    assert.match(body, /scale\(\.5\)/, name);
  }
});
test('七頁都在，順序照 deck.json', () => {
  assert.deepEqual(Object.keys(skillSlides), ['s1-what', 's2-compare', 's2-compare-b', 's3-folder', 's4-skillmd', 's5-flow', 's6-uses']);
});
test('兩張照片內嵌成 JPEG', () => {
  assert.match(skillSlides['s2-compare'], /src="data:image\/jpeg;base64,/);
  assert.match(skillSlides['s2-compare-b'], /src="data:image\/jpeg;base64,/);
});
test('圖示換成 svg，數量不變', () => {
  assert.equal((skillSlides['s5-flow'].match(/<svg/g) ?? []).length, 11); // 6 個圖示＋5 個箭頭
  assert.equal((skillSlides['s6-uses'].match(/<svg/g) ?? []).length, 3);
});
test('講稿抽出來，含秒數與銜接', () => {
  for (const [name, notes] of Object.entries(skillNotes)) {
    assert.match(notes, /^（約 \d+ 秒）/, name);
    assert.match(notes, /銜接：/, name);
  }
  assert.match(skillNotes['s1-what'], /點餐單/);
  assert.match(skillNotes['s5-flow'], /親手把手冊遞給它/);
});
test('skillSlide 版型回傳該頁', () => {
  assert.equal(skillLayouts.skillSlide({ slide: 's3-folder' }).body, skillSlides['s3-folder']);
});
```

`DATA_URI=rejected` 時，把「兩張照片」那個測試換成：兩頁的 body 不含 `<img`，且 `skillSlide` 對這兩頁回傳一個 `svg` 原生元件。

- [ ] **Step 4**：`node --test $SYN/html-skill.test.mjs`，預期 FAIL
- [ ] **Step 5：實作 `toSynora`**
  - `<section …>` 換成 `<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform:scale(.5);transform-origin:0 0;…原本的 style">`
  - `<aside>…</aside>` 抽成 `notes`（純文字，保留段落換行）
  - `<x-icon name>` 換成同尺寸、同顏色的內嵌線條 svg。用到的名稱：`Users`、`Chat`、`Search`、`Book`、`Tool`、`CheckCircle`、`Home`、`PaperPlane`、`Code`；遇到清單外的名稱直接 throw
  - `<x-shape kind="ellipse">` 換成圓形 `<span>`；`kind="arrow-right"` 換成箭頭 svg；其他 kind 直接 throw
  - `src="/_blob/…"` 換成 `images` 對應的 data URI；找不到直接 throw
  - 字體堆疊換成 `html-kit.mjs` 用的系統字體與等寬字體
  - 補上清單樣式：外層加 `<style>` 讓該頁的 `ul{padding-left:1.2em}`（`html-kit` 的全域樣式把 padding 歸零了）
  - 模組載入時用 `readFileSync` 讀 `../skill-chapter/deck.json` 的 `order` 與 7 個 HTML、2 張 JPEG
- [ ] **Step 6**：`node --test "$SYN/*.test.mjs"`，預期全部通過
- [ ] **Step 7：看圖與體檢**。`$OUT/probe-content.mjs` 改成 7 頁 `skillSlide`（`section` 留空，才不會出現頁首色帶），build 後跑 `node $SY doctor … --json`（預期 `ok: true`）與 `render`。逐頁對照 <https://claude.ai/artifact/RocLz8n8xJKdn94GvFDBis>：版面一致、照片出現、沒有裁字
- [ ] **Step 8**：commit `feat: 咖啡店 Skill 章節轉成 Synora 頁面`

**Checkpoint A 收尾**：`node --test "$SYN/*.test.mjs"` 全過後，派一隻 reviewer 審 Task 1–3 的增量 diff（分「spec 符合度」「code quality」兩段）。

---

# Checkpoint B：內容

共用規則：
- 每頁的字照 spec 對應小節；講稿寫講師要說的重點，環節第一頁用「`HH:MM 名稱(分)。`」開頭
- 版型欄位照 `html-layouts.mjs` 現有版型的用法（括號內是版型名）
- 拿掉的頁直接刪；刪到沒人用的常數（`TEMPLATE_URL`、`PILLS` 裡的「Agent」「上線」）一起處理，`cover` 的三顆膠囊改成「講清楚」「做出來」「改更好」

## Task 4：第一節（19 頁）

**Files:**
- Create: `$SYN/job-site-content.test.mjs`
- Modify: `$SYN/job-site-content.mjs`、`$SYN/build-deck-html.test.mjs`、`$SYN/html-layouts.test.mjs`

頁序（`cover` 到 `break1`）：

| id | 版型 | 講稿開頭 | 內容 |
|---|---|---|---|
| `cover` | cover | | 沿用，改膠囊 |
| `s1` | divider | | `time: '09:00–09:50'`，標題「講清楚」 |
| `s1-outline` | three | `09:00 課綱簡介＋秀終點(4)。` | 三張卡：講清楚／做出來／改更好＋應用，各一句做什麼；講稿說下課帶走三樣 |
| `s1-goal` | goalShot | | 沿用 |
| `s1-login` | iconLinks | `09:04 加入＋登入＋兩題多選(5)。` | 一列三個連結：Gemini（主線）、ChatGPT、Claude；深色卡講第一次省額度；講稿寫「Gemini 用個人 Gmail」 |
| `s1-ai-exp` | multiChoice | | 沿用，拿掉「有付費 AI」選項 |
| `s1-paid` | multiChoice | | 「你現在有付費的 AI 服務嗎？」選項照 spec〈互動與上傳〉 |
| `s1-problem` | bigPrompt | `09:09 發現問題(4)。` | 沿用 |
| `s1-problem-reveal` | reveal | | 沿用 |
| `s1-drink` | steps | `09:13 手搖飲(4)。` | 三步：一杯奶茶／半糖少冰／珍珠換椰果，各附拿到什麼 |
| `s1-drink-reveal` | reveal | | Prompt＝點餐單；副標：一次次調得更好，就是提示詞工程 |
| `s1-gf-1`、`s1-gf-2`、`s1-gf-3` | story、story、rows | `09:17 女朋友(4)。`（只在第一頁） | 沿用；第三頁講稿結尾改成接訪問卡 |
| `s1-interview` | copyFull | `09:21 訪問卡(15)。` | spec〈Prompt 變動〉訪問卡；`cardTitle: '讓 AI 訪問你 → 複製 → 貼到聊天 AI'` |
| `s1-prompt-1` | copyPrompt | `09:36 追問補齊(11)。` | 由 `s2-prompt-1` 移來並改寫；`cardTitle: '照貼就好 → 複製 → 貼在同一個對話'` |
| `s1-save` | steps | `09:47 存副本(3)。` | 三步：整段複製／貼到手機備忘錄或 Google Keep／命名「我的基本資料」 |
| `s1-save-poll` | poll | | 「基本資料副本存好了嗎？」存好了／還在存／找不到整段資料 |
| `break1` | break | | 講稿拿掉「補裝」 |

- [ ] **Step 1：寫失敗的測試**（`job-site-content.test.mjs`）

```js
const ids = buildDeck(content).slides.map((s) => s.id);
const S1 = ['cover', 's1', 's1-outline', 's1-goal', 's1-login', 's1-ai-exp', 's1-paid', 's1-problem', 's1-problem-reveal',
  's1-drink', 's1-drink-reveal', 's1-gf-1', 's1-gf-2', 's1-gf-3', 's1-interview', 's1-prompt-1', 's1-save', 's1-save-poll', 'break1'];

test('第一節頁序', () => assert.deepEqual(ids.slice(0, S1.length), S1));

const BANNED = ['OpenCode', 'npx', 'site/index.html', 'my-site', 'AI Studio', 'job-site-template', 'Context Engineering', 'MCP'];
const text = (p) => JSON.stringify(p);
test('第一節沒有舊工具鏈字眼', () => {
  for (const p of content.pages.slice(0, content.pages.findIndex((x) => x.id === 'break1') + 1))
    for (const w of [...BANNED, 'Agent']) assert.ok(!text(p).includes(w), `${p.id} 出現 ${w}`);
});
test('訪問卡與追問是聊天版', () => {
  const page = (id) => content.pages.find((p) => p.id === id);
  assert.match(page('s1-interview').prompt, /我的基本資料/);
  assert.match(page('s1-prompt-1').prompt, /重新輸出完整的/);
  assert.doesNotMatch(page('s1-prompt-1').prompt, /寫回|檔案/);
});
```

- [ ] **Step 2**：`node --test $SYN/job-site-content.test.mjs`，預期 FAIL
- [ ] **Step 3：改 `job-site-content.mjs`** 第一節；檔頭註解的設計連結改成本次 spec
- [ ] **Step 4：改既有測試**
  - `html-layouts.test.mjs`：凡是用 `run('<被刪的頁>')` 的測試都改用 fixture。把 `s1-install-win`、`s1-hello`、`s1-vercel-login`（copyMock）、`s1-aistudio`（linkTask）、`s1-roadmap`（loop）五頁的物件從 `git show origin/crazysYao/ntut-interview-5q:$SYN/job-site-content.mjs` 原樣搬進測試檔，`run` 改成先查 fixture 再查內容檔
  - `build-deck-html.test.mjs`：頁數 `50` → `47`；`assert.equal(now.length, all.length - 1)` 改成 `assert.equal(now.length, old.length)`；循環動畫頁改成 `[]`；截圖佔位拿掉 `s1-roadmap`；copycard 標題拿掉三頁安裝卡、`s2-prompt-1` 改成 `s1-prompt-1`
- [ ] **Step 5**：`node --test "$SYN/*.test.mjs"`，預期全部通過
- [ ] **Step 6**：commit `feat: 第一節改成講清楚（登入提前、手搖飲、存副本）`

## Task 5：第二節（23 頁）

**Files:** Modify `$SYN/job-site-content.mjs`、`$SYN/job-site-content.test.mjs`、`$SYN/build-deck-html.test.mjs`、`$SYN/html-layouts.mjs`

頁序（`s2` 到 `break2`）：

| id | 版型 | 講稿開頭 | 內容 |
|---|---|---|---|
| `s2` | divider | | `time: '10:00–10:50'`，標題「做出來」 |
| `s2-quiz-warmup-1..3` | quizSet（3 題） | `firstNote: '10:00 暖身搶答(3)。'` | 自我介紹為何空泛（沿用）；手搖飲三次點餐叫什麼（新）；聊天 AI 何時會追問（沿用） |
| `s2-typhoon`、`-poll`、`-reveal` | 沿用 | `10:03 給誰看(4)。` | 沿用 |
| `s2-style`、`s2-style-poll` | 沿用 | `10:07 找風格(4)。` | 沿用 |
| `s2-prompt-2` | copyFull | `10:11 網站 v1(20)。` | spec〈Prompt 變動〉Prompt ②；講稿：同一個對話、停損從貼出起算 8 分鐘 |
| `s2-rescue` | rows | | 三列：8 分鐘沒出來／額度用完／沒有 Canvas，各一句做法（spec〈停損與保底〉） |
| `s2-v1-poll` | poll | `10:31 v1 好了嗎(3)。` | 做好了／快好了／卡住了；講稿：做好的人截一張圖留著 |
| `s2-skill-1`..`s2-skill-7` | skillSlide | `10:34 Skill(5)。`（只在第 1 頁） | `slide` 依序是 `deck.json` 的 `order`；`section: ''`；`notes` 用 `skillNotes[slide]`，第 1 頁前面接時間標記；第 7 頁講稿後面加第二次省額度 |
| `s2-skill-make` | copyFull | `10:39 做自己的 Skill(8)。` | spec〈動手做自己的 Skill〉的 Skill Prompt；`cardTitle: '整理成 Skill → 複製 → 貼在做網站的對話'`；講稿點出三欄對應咖啡店第 5 頁的 Metadata、Instructions、Rules |
| `s2-skill-save` | compare | | 左卡「所有人：存成文字，放在基本資料副本旁邊」；右卡「Gemini 個人帳號再多做一步：自訂 → Skills → 建立 → 手動建立」；`note`：打 `/名稱`，問它會照哪些規則做 |
| `s2-skill-upload` | homework | `10:47 上傳 Skill(3)。` | `hwId: 'job-skill-up'`；說明：貼三欄文字，可附截圖 |
| `break2` | break | | `back` 改成 11:00 |

- [ ] **Step 1：加失敗的測試**：`S2` 頁序接在 `S1` 後面比對；禁用字掃描擴到 `break2`（`Agent` 只豁免 `s2-skill-*`）；再加

```js
const S2 = ['s2', 's2-quiz-warmup-1', 's2-quiz-warmup-2', 's2-quiz-warmup-3', 's2-typhoon', 's2-typhoon-poll', 's2-typhoon-reveal',
  's2-style', 's2-style-poll', 's2-prompt-2', 's2-rescue', 's2-v1-poll',
  's2-skill-1', 's2-skill-2', 's2-skill-3', 's2-skill-4', 's2-skill-5', 's2-skill-6', 's2-skill-7',
  's2-skill-make', 's2-skill-save', 's2-skill-upload', 'break2'];
test('第二節頁序', () => assert.deepEqual(ids.slice(S1.length, S1.length + S2.length), S2));
test('Prompt ② 是 Canvas 版', () => {
  const p = content.pages.find((x) => x.id === 's2-prompt-2').prompt;
  for (const s of ['Canvas', '給誰看', '風格', '最想讓對方記住的一件事', '單一 HTML', '不要放身分證、住址、私人手機']) assert.ok(p.includes(s), s);
});
test('Skill Prompt 輸出三欄且不重做網站', () => {
  const p = content.pages.find((x) => x.id === 's2-skill-make').prompt;
  for (const s of ['名稱', '說明', '指示', '不要重做網站']) assert.ok(p.includes(s), s);
});
test('咖啡店七頁照順序', () => {
  const order = content.pages.filter((p) => p.layout === 'skillSlide').map((p) => p.slide);
  assert.deepEqual(order, ['s1-what', 's2-compare', 's2-compare-b', 's3-folder', 's4-skillmd', 's5-flow', 's6-uses']);
});
```

- [ ] **Step 2**：跑測試，預期 FAIL
- [ ] **Step 3：改內容**；刪 `s2-agent`、`s2-template`、`s2-v1-upload`、`s2-v1-wall`、`s2-poll-v1`
- [ ] **Step 4：改既有測試**：`build-deck-html.test.mjs` 頁數 `47` → `54`；`NEW_LAYOUTS` 加 `'skillSlide'`；copycard 標題加 `s2-skill-make`
- [ ] **Step 5**：`node --test "$SYN/*.test.mjs"`，預期全部通過
- [ ] **Step 6**：commit `feat: 第二節改成做出來（Canvas 版 v1、咖啡店 Skill、自己做 Skill）`

## Task 6：第三節（16 頁）與時間檢查

**Files:** Modify `$SYN/job-site-content.mjs`、`$SYN/html-layouts.mjs`（`skillTemplate`）、`$SYN/check-deck.mjs`、三個測試檔

頁序（`s3` 到 `qa`）：

| id | 版型 | 講稿開頭 | 內容 |
|---|---|---|---|
| `s3` | divider | | `time: '11:00–11:50'`，標題「改更好＋應用」 |
| `s3-review` | skillTemplate | `11:00 讀者審稿 v2(13)。` | spec〈Prompt 變動〉Prompt ③；`app: 'Gemini'`；講稿明講這是迴圈的「驗證 → 優化」 |
| `s3-fix` | skillTemplate | | `fix:` 聊天版；講稿第三次省額度 |
| `s3-v2-upload` | homework | `11:13 上傳 v2＋互投(8)。` | `hwId: 'job-v2-up'`；截圖＋一句「我改了哪裡」 |
| `s3-v2-wall` | showcase | | `linkHomework: 'job-v2-up'` |
| `s3-v2-html` | webProject | | `methods: ['upload']`；選做：有 HTML 檔的人上傳 |
| `s3-public` | compare | `11:21 公開提醒(2)。` | 改寫：上傳的作品與分享連結別人都看得到；分享連結選做 |
| `s3-ctx-classes` | ctxClasses | `11:23 Context(7)。` | 八堂課；`note` 用 spec 改過的說法 |
| `s3-ctx-teachers` | compare | | A 老師／B 老師 |
| `s3-ctx-window` | ctxWindow | | 八步，內容照 spec〈Context〉互動示意圖；最後一步是新對話 |
| `s3-ctx-reveal` | reveal | | Context＝AI 在這段對話裡看得到的所有內容；一個對話只做一件事；講稿第四次省額度 |
| `s3-newchat` | copyFull | `11:30 開新對話(6)。` | spec 的面試自介 Prompt；講稿回扣 09:09；`cardTitle: '面試自介 → 開新對話 → 複製 → 填空格 → 貼上基本資料副本'` |
| `s3-drop` | linkTask | `11:36 上架示範(4)。` | 連結 `https://vercel.com/drop`；三步：把 HTML 檔拖進去／拿到網址／註冊認領才保留 |
| `s3-obsidian` | split | `11:40 Obsidian(6)。` | 沿用；講稿加 spec 的銜接句 |
| `s3-recap` | loop | `11:46 回顧(1)。` | 照 `git show origin/crazysYao/ntut-interview-5q:$SYN/job-site-content.mjs` 的 `s1-roadmap` 改：迴圈四步不變，三站改成基本資料／網站 v2／自己的 Skill |
| `qa` | qa | `11:50 QA(10)。` | 沿用 |

- [ ] **Step 1：加失敗的測試**

```js
const S3 = ['s3', 's3-review', 's3-fix', 's3-v2-upload', 's3-v2-wall', 's3-v2-html', 's3-public',
  's3-ctx-classes', 's3-ctx-teachers', 's3-ctx-window', 's3-ctx-reveal', 's3-newchat', 's3-drop', 's3-obsidian', 's3-recap', 'qa'];
test('全份 58 頁，頁序完整', () => { assert.equal(ids.length, 58); assert.deepEqual(ids, [...S1, ...S2, ...S3]); });
test('全份沒有舊工具鏈字眼', () => { /* 同第一節的掃描，範圍改成全部頁；Agent 只豁免 s2-skill-* */ });
test('fix 與審稿是聊天版', () => {
  const t = (id) => JSON.stringify(content.pages.find((p) => p.id === id));
  assert.ok(t('s3-review').includes('看上面這個網站'));
  assert.ok(t('s3-fix').includes('其他地方不要動'));
});
test('Context 示意圖最後一步是新對話，而且最空', () => {
  const steps = content.pages.find((p) => p.id === 's3-ctx-window').steps;
  assert.equal(steps.length, 8);
  assert.equal(Math.max(...steps.map((s) => s.used)), steps.at(-2).used);
  assert.ok(steps.at(-1).used < 20);
  assert.ok(steps.at(-2).msgs.some(([kind]) => kind === 'cut'));
  assert.doesNotMatch(JSON.stringify(steps), /token|RAG|Transformer/i);
});
test('八堂課不是固定由淡到深', () => {
  const st = content.pages.find((p) => p.id === 's3-ctx-classes').classes.map(([, s]) => s);
  assert.equal(st.length, 8);
  assert.ok(st.indexOf('clear') < st.lastIndexOf('faint'));
});
test('面試自介 Prompt', () => {
  const p = content.pages.find((x) => x.id === 's3-newchat').prompt;
  for (const s of ['30 秒', '不要編造', '基本資料']) assert.ok(p.includes(s), s);
});
test('skillTemplate 視窗標題可設定', () => {
  const r = layouts.skillTemplate({ tag: 't', heading: 'h', lines: [], app: 'Gemini' }, { palette: content.palette });
  assert.match(r.body, /<\/i>Gemini</);
});
```

- [ ] **Step 2**：跑測試，預期 FAIL
- [ ] **Step 3：改內容與版型**
  - `skillTemplate`：視窗標題用 `p.app ?? '聊天 AI'`
  - 刪 `s3-quiz-recap`、`s3-deploy`、`s3-live`、`s3-quiz-loop`、`closing`、`s1-roadmap` 的殘留
- [ ] **Step 4：改 `check-deck.mjs`**：`ranges` 改成 `[['09:00', '09:50', 50], ['10:00', '10:50', 50], ['11:00', '12:00', 57]]`，註解寫明第三節含 QA、3 分緩衝沒有頁面
- [ ] **Step 5：改既有測試**：頁數 `54` → `58`；`NEW_LAYOUTS` 加 `'ctxClasses'`、`'ctxWindow'`；截圖佔位加 `s3-recap: 3`；copycard 標題加 `s3-newchat`、拿掉 `s3-deploy`；`CLICK=no` 時循環動畫頁是 `['s3-ctx-window']`；`html-layouts.test.mjs` 的 linkTask 與 loop 測試從 fixture 換回內容檔的 `s3-drop`、`s3-recap`，並刪掉那兩個 fixture
- [ ] **Step 6：驗證**

```bash
node --test "$SYN/*.test.mjs"
node $SYN/build-deck-html.mjs $OUT/deck-job.json $SYN/job-site-content.mjs
node $SYN/check-deck.mjs $OUT/deck-job.json --sections --expect-pages=58
```

預期：測試全過；`58 頁 → …`；`OK：58 頁`
- [ ] **Step 7**：commit `feat: 第三節改成改更好＋應用（v2、Context、面試自介、上架示範）`

**Checkpoint B 收尾**：派一隻 reviewer 審 Task 4–6 的增量 diff，對照 spec 的三張時間表、〈Prompt 變動〉、〈互動與上傳〉、〈省額度〉四處。

---

# Checkpoint C：文件與驗收

## Task 7：教案與說明

**Files:** Modify `docs/ntut-ai-course/job-site-syllabus.md`、`docs/ntut-ai-course/README.md`

- [ ] **Step 1**：`job-site-syllabus.md`
  - 標題下的狀態與設計連結改成本次 spec；主線、口訣那幾行照 spec〈講師決定的事〉改寫
  - 時間表換成 spec 的三張表（不含「對應現版」欄）
  - 〈檔案〉：頁數指令改 `--expect-pages=58`；拿掉網站範本與保底網頁兩條，改寫一條「`job-site-template/` 已不使用」；加上咖啡店章節與 Context 參考檔的位置；「Synora 專案尚未建立」改成專案 id 與「本次未推送」
  - 〈講師課前準備〉的實測清單換成 spec〈課前必測〉8 項；已完成的 Vercel CLI 實測紀錄整段移除
  - 〈素材〉：三站截圖改成基本資料／網站 v2／自己的 Skill；加「講師自己網站的 HTML 檔（Vercel Drop 示範用）」；拿掉 AI Studio Key 與隨身碟兩條
- [ ] **Step 2**：`README.md` 的狀態說明指向本次 spec 與 58 頁
- [ ] **Step 3**：`grep -n "OpenCode\|npx\|AI Studio\|--expect-pages=50\|51 頁\|50 頁" docs/ntut-ai-course/job-site-syllabus.md docs/ntut-ai-course/README.md`，預期沒有輸出（歷史紀錄段落若必須保留，逐條在完成報告說明）
- [ ] **Step 4**：commit `docs: 教案與說明改成講清楚版（58 頁）`

## Task 8：全份驗收

- [ ] **Step 1**：重跑 Task 6 Step 6 的三個指令，貼輸出
- [ ] **Step 2**：`node $SY doctor $OUT/deck-job.json --json`，預期 `ok: true`
- [ ] **Step 3**：`render` 全份出圖，58 頁逐頁看：沒有裁字、互動元件沒被底圖蓋住、咖啡店 7 頁與 Context 3 頁正常。有問題就回到對應 Task 修，修完重跑本 Task
- [ ] **Step 4**：`CLICK=yes` 時，用 `preview` 實際點一次 `s3-ctx-window` 的「下一步」到最後一步與「重設」
- [ ] **Step 5**：`verification-before-completion`，把 Step 1–4 的實跑輸出整理進完成報告，並列出未驗證項（至少包含 spec〈課前必測〉8 項，那些要講師本人測）

**Checkpoint C 收尾**：PR 前做一次總體 review，只看 Checkpoint B 審查之後的增量。

## 開 PR
- PR 規模：單一 PR。只有一個可出貨單位、不跨 repo；高風險段已排在 Checkpoint A 提前送審
- PR #41 合併後：`git rebase --onto origin/main ff68d5e`，重跑 Task 8 Step 1，再 push 開 PR
- PR #41 還沒合併：停在本機，回報「因 PR #41 未合併而未開 PR」

## 完成報告要列的事（不自行處理）
- `s1-login` 沿用 `iconLinks`，連結圖示是下載圖示
- 不再被任何頁使用的版型（`copyMock`、`iconLinks` 以外的 `taskDownload`、`whoDoes`、`closing`、`iconSplit`）留在 `html-layouts.mjs` 沒刪
- `docs/ntut-ai-course/job-site-template/` 留在 repo 沒刪
- 兩張照片的 PNG 原檔與 JPEG 都在 repo

## 執行紀錄
### Task 1 探針（2026-11-12，Synora runtime 0.9.3 本機檢視器，簡報畫面）
- `CLICK=yes`：HTML 元件在 `sandbox="allow-scripts allow-forms"` 的 iframe 裡執行；Playwright 實際點按鈕，數字從 0 變成 1
- `DATA_URI=ok`：內嵌 88 KB 的 JPEG（寬 1200），`doctor` 回 `ok: true`，圖片 `naturalWidth` 是 1200
- 只在本機檢視器驗過；正式站的簡報模式要等推送後由講師點一次確認
