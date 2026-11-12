# 北科大求職網站課簡報：清楚版面＋動畫 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> 2026-11-12 更新：講師刪除第 6 頁 `s1-problem-poll`，簡報現為 **50 頁**。本文的 51 頁與頁碼為改版當時的紀錄；循環示意頁現在是第 14、16、20 頁，檢查指令改用 `--expect-pages=50`。

**Goal:** 為 `job-site-content.mjs` 另寫一支產生器，輸出「每頁一塊滿版 HTML 底圖＋原生互動元件疊上」的 51 頁 Synora deck，套用典範頁的清楚版面與動畫。

**Architecture:** `html-kit.mjs` 放共用 CSS、跳脫與膠囊拆解；`native.mjs` 放原生互動元件的建構函式（從 `build-deck.mjs` 複製，不 import，因為它載入即執行）；`html-layouts.mjs` 每個版型回傳 `{ body, natives }`；`build-deck-html.mjs` 組裝成 deck JSON。共用的 `build-deck.mjs` 不動。

**Tech Stack:** Node 22+（用 `/Users/yao/.nvm/versions/node/v24.22.2/bin/node`），`node:test`，純 HTML／CSS，不加任何依賴。Synora runtime：`/Users/yao/.claude/plugins/cache/synora-official/synora/0.9.2/scripts/synora.mjs`（以下簡稱 `SY`）。

**Spec:** `docs/superpowers/specs/2026-11-12-ntut-deck-clear-layout-design.md`

指令中的變數：

```bash
NODE=/Users/yao/.nvm/versions/node/v24.22.2/bin/node
SY=/Users/yao/.claude/plugins/cache/synora-official/synora/0.9.2/scripts/synora.mjs
SCRATCH=/private/tmp/claude-501/-Users-yao-orca-workspaces-slides-littleyao-------4/174e8955-6d07-4dba-adae-99fd5868a626/scratchpad
```

## Global Constraints
- 畫布 960×540；每頁第一個元件是 `type: 'html'`、`x:0,y:0,width:960,height:540`，id 為 `${slideId}-bg`
- 配色只用 `job-site-content.mjs` 匯出的 `palette`；黃 `#f5b400` 只當填色、上面放黑字
- 文字、講稿、題目、頁數、頁序不變；唯一文字變動是膠囊拆解與複製卡標題（見 Task 1、Task 3）
- 只有第 15、17、21 頁（`s1-install-win`、`s1-hello`、`s1-vercel-login`）可以有 `infinite` 動畫；其他頁進場動畫總長 ≤ 1 秒
- `prefers-reduced-motion: reduce` 與 `window.__SYNORA_CAPTURE__ === true` 時顯示最終狀態
- HTML 只用系統字體、不載入任何外部資源（無 `http` 的 `<link>`、`<script src>`、`url(http`）
- 截圖佔位框（`s1-goal`、`s1-roadmap` 三站、`s2-typhoon` 兩個假網站）維持原生 `svg` 元件
- 滿版互動元件（poll、multiChoice、quiz、wordcloud、showcase、webProject）大小與位置不變
- 不動 `build-deck.mjs`、`content.mjs`、`topic-f-content.mjs`、`package.json`
- Commit：Conventional Commits，正文繁中，結尾 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Review Focus
1. 內容含 `<`、`>`、`&`（例如 `PS C:\Users\你>`）→ HTML 裡原樣顯示、不破版。測試在 Task 1
2. 內容含 `\n` → 顯示為換行。測試在 Task 1
3. 文字太長被 HTML `overflow:hidden` 默默裁掉 → `render` 逐頁看圖抓（Task 5、Task 8），HTML 內不設固定高度的文字容器
4. 截圖／PDF 截到動畫第一格（空白或半透明）→ 測試 capture 腳本存在（Task 2），`render` 截圖驗證（Task 5、Task 8）
5. 互動元件被 HTML 底圖蓋住 → 測試 html 永遠是 `elements[0]`、原生互動元件數量與舊產生器一致（Task 2、Task 7）

---

## 檢查點一：骨架＋6 頁試作（完成後停下，給講師看）

### Task 1: html-kit（跳脫、膠囊拆解、頁面外框與 CSS）

**Files:**
- Create: `docs/ntut-ai-course/synora/html-kit.mjs`
- Test: `docs/ntut-ai-course/synora/html-kit.test.mjs`

**Interfaces:**
- Produces:
  - `esc(s: string): string`：跳脫 `& < > "`，並把 `\n` 換成 `<br>`
  - `splitSteps(cardTitle: string, fallbackLabel: string): { label: string, steps: string[] }`
  - `chips(steps: string[]): string`：編號膠囊列 HTML
  - `pageHtml({ brand, section, palette, body, loop = false }): string`：完整 `<!doctype html>` 文件，含共用 CSS、頁首色帶（有 `section` 時）、進場動畫 class、reduced-motion 規則與 capture 腳本

- [ ] **Step 1: 寫失敗測試**

```js
test('esc 跳脫特殊字元並轉換行', () => {
  assert.equal(esc('PS C:\\Users\\你> a&b "x"\n下一行'), 'PS C:\\Users\\你&gt; a&amp;b &quot;x&quot;<br>下一行');
});
test('splitSteps：第一段是「複製」時沒有卡名，用 fallback', () => {
  assert.deepEqual(splitSteps('複製 → 開始鍵輸入 PowerShell → 右鍵貼上 → Enter', '安裝 · Windows'),
    { label: '安裝 · Windows', steps: ['複製', '開始鍵輸入 PowerShell', '右鍵貼上', 'Enter'] });
});
test('splitSteps：第一段不是「複製」就當卡名', () => {
  assert.deepEqual(splitSteps('打招呼 → 複製 → 貼到 OpenCode → 傳送', 'x'),
    { label: '打招呼', steps: ['複製', '貼到 OpenCode', '傳送'] });
  assert.deepEqual(splitSteps('讓 AI 訪問你 → 貼到 ChatGPT 或 Gemini → 一題一題回答', 'x'),
    { label: '讓 AI 訪問你', steps: ['貼到 ChatGPT 或 Gemini', '一題一題回答'] });
});
test('splitSteps：沒有箭頭就原樣當卡名、無步驟', () => {
  assert.deepEqual(splitSteps('複製後，先填好三個空格再送出', 'x'), { label: '複製後，先填好三個空格再送出', steps: [] });
});
test('chips 依序編號', () => {
  const h = chips(['複製', '傳送']);
  assert.match(h, /<b>1<\/b>複製/); assert.match(h, /<b>2<\/b>傳送/);
});
test('pageHtml：有 reduced-motion、capture、無外部資源、非 loop 頁沒有 infinite', () => {
  const h = pageHtml({ brand: 'B', section: 'S', palette: { accent: '#f5b400' }, body: '<h1>t</h1>' });
  assert.match(h, /prefers-reduced-motion:\s*reduce/);
  assert.match(h, /__SYNORA_CAPTURE__/);
  assert.doesNotMatch(h, /<link|<script[^>]+src|url\(\s*["']?http/);
  assert.doesNotMatch(h, /infinite/);
  assert.match(h, /B · S/);
});
test('pageHtml：loop 頁才帶 infinite', () => {
  assert.match(pageHtml({ brand: 'B', section: 'S', palette: {}, body: '', loop: true }), /infinite/);
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `cd docs/ntut-ai-course/synora && $NODE --test html-kit.test.mjs`
Expected: FAIL（模組不存在）

- [ ] **Step 3: 實作 `html-kit.mjs`**

CSS 構件照典範頁 `jj-setup1`（參考檔 `/private/tmp/claude-501/-Users-yao-orca-workspaces-slides-littleyao-------4/174e8955-6d07-4dba-adae-99fd5868a626/scratchpad/ref/jj-setup1.html`；若不存在，用 `node SY pull c95b010d-57ae-4430-b105-f1c9592664e7 <file>` 取第 20 頁 html）：頁首色帶、`h1.t` 粗大標題、`.chips`、白卡＋上緣色條、深色示意視窗、箭頭。顏色改用 `palette` 變數。進場用 `.in` class（`opacity:0` → 1、上浮 12px，`animation-fill-mode: both`），以 `--d` 變數錯開；整頁最後一個元素結束 ≤ 1 秒。只有 `loop: true` 時輸出循環用的 keyframes（`infinite`）。Capture 腳本放在 `<head>` 最前面：

```html
<script>if (window.__SYNORA_CAPTURE__) document.documentElement.classList.add('cap')</script>
```

`.cap *` 與 `@media (prefers-reduced-motion: reduce) { * }` 都設 `animation: none !important; opacity: 1 !important; transform: none !important;`。

- [ ] **Step 4: 跑測試確認通過**（同 Step 2 指令，Expected: PASS）
- [ ] **Step 5: Commit** `feat: 求職網站簡報 html-kit（跳脫、膠囊、頁面外框）`

### Task 2: 原生元件與產生器骨架

**Files:**
- Create: `docs/ntut-ai-course/synora/native.mjs`
- Create: `docs/ntut-ai-course/synora/html-layouts.mjs`（本 task 只放空的 `layouts = {}` 匯出）
- Create: `docs/ntut-ai-course/synora/build-deck-html.mjs`
- Test: `docs/ntut-ai-course/synora/build-deck-html.test.mjs`

**Interfaces:**
- Consumes: Task 1 的 `pageHtml`
- Produces:
  - `native.mjs`：`makeNative(slideId)` 回傳 `{ poll, quiz, link, copycard, fileDownload, wordcloud, webProject, homework, showcase, shotFrame }`，欄位與 `build-deck.mjs:150-198`、`:303-309` 產出的完全相同，但每個函式都多吃 `x, y, width, height`（滿版互動元件預設維持 `70,54,820,476`）；元件 id 規則 `${slideId}-${type}-${n}` 不變
  - `html-layouts.mjs`：`export const layouts`，每個版型 `(p, ctx) => ({ body: string, natives: object[], loop?: boolean })`；`ctx = { palette, n: makeNative(p.id) }`
  - `buildDeck(contentModule, { only?: string[] }): { sections: [], slides: Slide[] }`；CLI：`node build-deck-html.mjs <輸出> [內容檔] [--only=id,id]`
  - 每頁輸出：`{ id, slideNumber, title, description: '', background, notes, elements: [htmlBg, ...natives] }`；`htmlBg = { id: \`${id}-bg\`, type: 'html', x: 0, y: 0, width: 960, height: 540, html }`；`quizSet` 展開規則照 `build-deck.mjs` 的 `expand`

- [ ] **Step 1: 寫失敗測試**

```js
// 用一個只有 test 版型的假內容檔測組裝規則
test('每頁第一個元件是滿版 html，原生元件在後', () => {
  const deck = buildDeck(fakeContent);           // fakeContent 的版型在測試內注入 layouts
  for (const s of deck.slides) {
    assert.deepEqual(pick(s.elements[0], ['id','type','x','y','width','height']), { id: `${s.id}-bg`, type: 'html', x: 0, y: 0, width: 960, height: 540 });
  }
});
test('quizSet 展開成多頁且講稿附正解', () => { /* 兩題 → 兩頁，id `${id}-1`、`${id}-2`，notes 含「正解：」 */ });
test('--only 只輸出指定頁且 slideNumber 從 1 連號', () => { /* only=['b'] → 1 頁，slideNumber 1 */ });
test('版型不存在時丟錯並帶出頁 id', () => { assert.throws(() => buildDeck(badContent), /s-x.*nope/); });
```

- [ ] **Step 2: 跑測試確認失敗**：`$NODE --test build-deck-html.test.mjs`，Expected: FAIL
- [ ] **Step 3: 實作三個檔案**（`buildDeck` 讓 `layouts` 可由參數注入，方便測試）
- [ ] **Step 4: 跑測試確認通過**：Task 1、Task 2 測試全 PASS
- [ ] **Step 5: Commit** `feat: 求職網站簡報 HTML 產生器骨架`

### Task 3: 操作頁 copyMock（第 15、17、21 頁）

**Files:**
- Modify: `docs/ntut-ai-course/synora/html-layouts.mjs`
- Test: `docs/ntut-ai-course/synora/html-layouts.test.mjs`

**Interfaces:**
- Consumes: `esc`、`splitSteps`、`chips`、`ctx.n.copycard`
- Produces: `layouts.copyMock`，回傳 `loop: true`

版面照典範：標題 → 膠囊列（`splitSteps(p.cardTitle, p.tag).steps`）→ 左：原生 `copycard`（`title` = `splitSteps(...).label`，`content` = `p.prompt`）→ 中：箭頭（輕推，循環）→ 右：深色示意視窗（`p.mockTitle`，右上「示意畫面」）。示意視窗逐行顯示 `p.mock`：第一行的 `'y'` 色片段做成「貼上格」（虛線框 → 亮起），其餘行依序出現，最後一行用完成提示樣式；約 9 秒一輪。不畫游標去按複製。

- [ ] **Step 1: 寫失敗測試**

```js
test('copyMock：膠囊、複製卡標題、loop', () => {
  const p = pages.find((x) => x.id === 's1-install-win');
  const r = layouts.copyMock(p, ctx(p));
  assert.equal(r.loop, true);
  assert.match(r.body, /<b>1<\/b>複製[\s\S]*<b>4<\/b>Enter/);
  const cc = r.natives.filter((e) => e.type === 'copycard');
  assert.equal(cc.length, 1);
  assert.equal(cc[0].title, '安裝 · Windows');
  assert.equal(cc[0].content, p.prompt);
  assert.match(r.body, /PS C:\\Users\\你&gt;/);
  assert.match(r.body, /示意畫面/);
});
test('copyMock：s1-hello、s1-vercel-login 的卡名', () => {
  // s1-hello → '打招呼'；s1-vercel-login → '登入'
});
test('copyMock：複製卡在畫面內且不壓到示意視窗', () => { /* copycard x+width <= 示意視窗左緣（從 body 的 inline style 或常數取） */ });
```

- [ ] **Step 2: 跑測試確認失敗**
- [ ] **Step 3: 實作 `layouts.copyMock`**
- [ ] **Step 4: 跑測試確認通過**
- [ ] **Step 5: Commit** `feat: 操作頁改為步驟膠囊＋左右對照＋循環示意`

### Task 4: 代表頁 cover、rows、linkTask

**Files:**
- Modify: `docs/ntut-ai-course/synora/html-layouts.mjs`
- Test: `docs/ntut-ai-course/synora/html-layouts.test.mjs`

**Interfaces:**
- Consumes: Task 1、Task 2 的介面
- Produces: `layouts.cover`、`layouts.rows`、`layouts.linkTask`（代表頁：`cover`、`s1-gf-3`、`s1-aistudio`）

欄位照 `build-deck.mjs` 同名版型讀取。`cover` 背景用 `palette.bgFor.cover`；`rows` 每列做成白卡＋左色條、依序進場；`linkTask` 的 `link` 維持原生，`items` 改成編號膠囊列或編號卡（實作者選），不再是一段純文字清單。

- [ ] **Step 1: 寫失敗測試**：每個代表頁的所有文字欄位都出現在 `body`（經 `esc`）；`linkTask` 的 natives 只有一個 `link`，`linkUrl` 與內容檔相同；三者都不是 `loop`
- [ ] **Step 2: 跑測試確認失敗**
- [ ] **Step 3: 實作三個版型**
- [ ] **Step 4: 跑測試確認通過**
- [ ] **Step 5: Commit** `feat: 封面、條列、連結任務頁改為清楚版面`

### Task 5: 檢查點一驗收（停下給講師看）

- [ ] **Step 1: 產生試作 deck**

```bash
cd docs/ntut-ai-course/synora
$NODE build-deck-html.mjs $SCRATCH/cp1.json job-site-content.mjs --only=cover,s1-gf-3,s1-install-win,s1-hello,s1-aistudio,s1-vercel-login
$NODE check-deck.mjs $SCRATCH/cp1.json --expect-pages=6
$NODE $SY doctor $SCRATCH/cp1.json --check-assets --json
$NODE $SY layout $SCRATCH/cp1.json $SCRATCH/cp1-layout --view=both --json
$NODE $SY render $SCRATCH/cp1.json $SCRATCH/cp1-render --view=both --json
```
Expected: `OK：6 頁`、doctor `"ok":true`、layout 無問題回報、12 張截圖都是最終畫面（無空白、無半透明）

- [ ] **Step 2: 逐張 Read 截圖**；有裁字、重疊、空白就回 Task 3／4 修
- [ ] **Step 3: `preview --view=both` 開給講師**，確認：動畫會跑、切換頁回來動畫是否重播（記錄結果）、複製卡與連結按得到
- [ ] **Step 4: 停下。** 把截圖路徑、preview 網址、重播觀察結果交給講師，等講師說可以才進檢查點二

---

## 檢查點二：其餘頁面、全份驗收、交付

### Task 6: 靜態內容版型

**Files:** Modify `html-layouts.mjs`；Test `html-layouts.test.mjs`

**Interfaces:** Produces `layouts` 的 `divider, story, reveal, bigPrompt, three, compare, grid, steps, loop, split, whoDoes, iconSplit, skillTemplate, break, qa, closing`

`loop`（`s1-roadmap`）與 `iconSplit` 的截圖框、圖示若是佔位框，維持原生 `svg`（用 `n.shotFrame`）。`DARK` 版型（`break`、`qa`）背景照舊用 `palette.dark`。

- [ ] **Step 1: 寫失敗測試**：對 `job-site-content.mjs` 中用到這些版型的每一頁，所有字串欄位（遞迴取 `p` 內除 `id, layout, section, title, notes` 外的字串）經 `esc` 後都出現在 `body`；`s1-roadmap` 的原生 `svg` 數量 = 3
- [ ] **Step 2–4: 失敗 → 實作 → 通過**
- [ ] **Step 5: Commit** `feat: 靜態內容頁改為清楚版面＋進場動畫`

### Task 7: 疊原生元件的版型

**Files:** Modify `html-layouts.mjs`；Test `html-layouts.test.mjs`

**Interfaces:** Produces `goalShot, iconLinks, copyFull, copyPrompt, taskDownload, siteMock, poll, multiChoice, quiz, wordcloud, homework, showcase, webProject`

`copyFull`、`copyPrompt` 用 `splitSteps` 規則（膠囊＋複製卡標題改卡名）；`s2-prompt-2`（第 484 行，無箭頭）標題維持原樣。`siteMock`（`s2-typhoon`）兩個假網站維持原生 `svg`。

- [ ] **Step 1: 寫失敗測試**

```js
test('全份：原生互動元件與舊產生器一致', () => {
  // 用 child_process 跑 build-deck.mjs 產生舊 deck；新舊逐頁比對
  // 互動型別 ∈ {poll,quiz,link,copycard,fileDownload,wordcloud,webProject,homework,showcase}
  // 每頁型別多重集合相同；每個元件除 x,y,width,height,id 與 copycard.title 外欄位相同
  // 滿版型別（poll,quiz,wordcloud,webProject,showcase）x,y,width,height 也相同
});
test('全份：只有 3 頁 loop，其他頁 html 不含 infinite', () => {});
test('全份：截圖佔位框 svg：s1-goal 1、s1-roadmap 3、s2-typhoon 2', () => {});
test('全份：copycard 標題', () => {
  // s1-interview '讓 AI 訪問你'、s1-install-win '安裝 · Windows'、s1-hello '打招呼'、
  // s1-vercel-login '登入'、s2-prompt-1 '照貼就好'、s2-prompt-2 '複製後，先填好三個空格再送出'、s3-deploy '上線'
});
```

- [ ] **Step 2–4: 失敗 → 實作 → 通過**
- [ ] **Step 5: Commit** `feat: 互動頁改為 HTML 底圖＋原生元件`

### Task 8: 全份驗收與文件

**Files:** Modify `docs/ntut-ai-course/job-site-syllabus.md`（「檔案」段的產生指令改成 `build-deck-html.mjs`）

- [ ] **Step 1: 全份產生與檢查**

```bash
$NODE build-deck-html.mjs $SCRATCH/deck-html.json job-site-content.mjs
$NODE check-deck.mjs $SCRATCH/deck-html.json --sections --expect-pages=51
$NODE $SY doctor $SCRATCH/deck-html.json --check-assets --json
$NODE $SY media-inspect --file=$SCRATCH/deck-html.json --json
$NODE $SY layout $SCRATCH/deck-html.json $SCRATCH/full-layout --view=both --json
$NODE $SY render $SCRATCH/deck-html.json $SCRATCH/full-render --view=both --json
$NODE --test *.test.mjs
```
Expected: `OK：51 頁`、doctor ok、media-inspect `count: 0`、layout 無問題、測試全過

- [ ] **Step 2: 逐張看 102 張截圖**（講師端＋學員端），修到沒有裁字、空白、遮擋
- [ ] **Step 3: 更新教案「檔案」段，commit** `docs: 教案改用 HTML 產生器`
- [ ] **Step 4: checkpoint review**：一隻 reviewer 看 `ae7d1c2..HEAD`，分「spec 符合度」與「code quality」兩段
- [ ] **Step 5: push、開 PR**，跑 `adversarial-review`（只審本分支 diff），依 CLAUDE.md 條件式 merge

### Task 9: 推 Synora 與實機驗證

- [ ] **Step 1:** `SY inspect aef695ce-dd63-4375-a02a-d134f3100159`：`saveSeq` 仍為 2 才繼續；不是 2 → `pull` 比對差異，停下問講師
- [ ] **Step 2:** `pull` → 把 `slides`、`sections` 換成新 deck（保留遠端 `_saveSeq`）→ `push --dry-run`（Expected：51 頁、`expectedSaveSeq` 2）→ `push` → `inspect` 讀回 51 頁
- [ ] **Step 3:** 講師端與學員端實際打開，確認切到第 15 頁動畫會播、其他頁進場會播、互動元件可操作、換頁不受影響。無法開學員端時，在報告標成未驗證
