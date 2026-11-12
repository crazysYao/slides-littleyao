# 北科大新課綱（求職網站上線版）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依 spec 產出新課綱的 Synora deck 內容檔（本機產生、本機預覽）、求職網站範本＋保底網頁＋zip、新教案與 README 更新。

**Architecture:** 沿用現有「內容檔 `*-content.mjs` ＋ 版面產生器 `build-deck.mjs`」：新內容寫在 `job-site-content.mjs`，`build-deck.mjs` 只補缺的版型。驗證靠產生器輸出、Synora runtime 本機 `doctor`（schema 檢查）與本機 `preview` 截圖；不碰 Synora 遠端寫入。

**Tech Stack:** Node 22+（ESM .mjs）、Synora Agent Runtime 0.8.8 本機指令、純 HTML/CSS 範本、`zip`。

**Spec:** `docs/superpowers/specs/2026-11-11-ntut-new-syllabus-design.md`

## Global Constraints
- 不對任何 Synora 專案寫入（push、create、patch、改名一律禁止）；只允許 `pull` Eric 專案 `c95b010d-57ae-4430-b105-f1c9592664e7` 到 scratchpad 唯讀取用
- 不改 `package.json`、`open-slide.config.ts`、`slides/` 下其他簡報；不加依賴
- `build-deck.mjs` 的改動不得改變 `topic-f-content.mjs`、`content.mjs` 的輸出（回歸：兩者產生的 JSON 與改動前逐字相同）
- 視覺沿用 F 版 palette（黃 `#f5b400`、墨 `#16161a`），黃色只當填色，上面一律黑字
- 每頁 `notes` 開頭寫時間與分鐘數，格式 `HH:MM 名稱(分)`，對齊 spec 時間表 v6
- spec 寫明的台詞、Prompt、金句逐字照抄
- Runtime 路徑：`S=/Users/yao/.claude/plugins/cache/synora-official/synora/0.8.8/scripts/synora.mjs`

## Review Focus
1. 長 Prompt 的 copycard 文字超出卡片高度被截 → Task 3 預覽截圖逐頁檢查 copycard 頁
2. showcase 的 `linkedHomeworkId` 對不上 homework 元素 id → Task 1 驗證腳本斷言
3. 範本在手機寬度 375px 破版、或 AI 改內容時需要動 HTML 結構 → Task 4 截圖檢查＋範本用 `data-slot` 標註可替換處
4. zip 在 Windows 解壓檔名亂碼 → Task 4 用 `zip -UN=UTF8` 並以 `unzip -Z` 檢查旗標
5. 時間表總長偏差（某節不是 50／55／55）→ Task 2 驗證腳本加總 notes 分鐘數

---

## Checkpoint 1：簡報內容與畫面

### Task 1: build-deck.mjs 補版型

**Files:**
- Modify: `docs/ntut-ai-course/synora/build-deck.mjs`
- Create: `docs/ntut-ai-course/synora/check-deck.mjs`（驗證腳本：讀 deck JSON 做斷言，失敗 exit 1）

**Interfaces:**
- Produces（內容檔可用的新 layout 與欄位）：
  - `multiChoice`：`{ id, question, options: string[] }` → poll 元素 `multiSelect: true`
  - `homework`：`{ hwId, heading, title, description }` → homework 元素，`id` 固定為 `hwId`
  - `showcase`：`{ title, linkHomework }` → showcase 元素 `points:5, focusMode:false, showVoting:true, peerVoteCount:3, linkedHomeworkId: linkHomework`
  - `webProject` 新增可選欄位 `methods`（預設維持 `['upload','url']`），新課綱傳 `['url']`
  - `story`：`{ heading, beats: [who, line][], punch? }` → 女朋友故事用的對話＋揭曉列（可用現有 `bubbles` 實作）
  - `siteMock`：`{ heading, sites: [{ name, hero, lines: string[], cta? }] }` → 兩欄假網站手機截圖樣式（颱風 A/B 師傅）
- `check-deck.mjs <deck.json> [--expect-pages=N]`：斷言每個 showcase 的 `linkedHomeworkId` 存在於同 deck 的 homework id；元素座標不超出 960×540；每頁有 notes

- [ ] **Step 1:** 改動前先存基準：`node build-deck.mjs /tmp/base-f.json topic-f-content.mjs && node build-deck.mjs /tmp/base-a.json content.mjs`
- [ ] **Step 2:** 寫 `check-deck.mjs`，對 `/tmp/base-f.json` 跑，Expected: PASS（建立腳本可用的基線）
- [ ] **Step 3:** 實作上列 6 項；Eric 欄位格式照 spec「Eric 元件與頁面參考」
- [ ] **Step 4:** 回歸：重產兩份 JSON，`diff` 與 Step 1 基準，Expected: 無差異
- [ ] **Step 5:** commit `feat: build-deck 補 homework／showcase／multiChoice／story／siteMock 版型`

### Task 2: job-site-content.mjs 全部頁面

**Files:**
- Create: `docs/ntut-ai-course/synora/job-site-content.mjs`

**Interfaces:**
- Consumes: Task 1 的 layout；既有 layout（cover、divider、bigPrompt、poll、reveal、loop、copyPrompt、iconLinks、compare、whoDoes、quizSet、wordcloud、break、qa、closing、steps、split）
- Produces: `export const brand`、`palette`（照抄 F 版）、`pages`

頁面依 spec 時間表 v6 與「各環節內容」逐段做；不確定版型時用最接近的既有 layout。必備對應：
- 09:02 multiChoice 選項照 spec；09:04 bigPrompt＋poll＋reveal（揭曉 sub 用 spec 的「1 到 10 分」那句）
- 09:08 story 三頁；09:12 loop 版（core 版＋三站卡片）
- 09:14、09:36、09:44、10:09、10:29、11:23 的 Prompt 用 copyPrompt，內容逐字照 spec
- 09:28 安裝：iconLinks（Mac 官方連結）＋ copyPrompt（winget 一行）＋「裝不起來？」頁
- 10:21 siteMock A/B ＋ poll「你會打給哪一位？」＋ reveal
- 10:43 homework（hwId `job-v1-up`）＋ showcase（linkHomework `job-v1-up`）；11:39 webProject `methods:['url']`
- 11:08 骨架與 fix: 格式用不可複製的版型（例如 `split` 或 `list`），不用 copycard
- 範本 zip 下載連結：`https://github.com/crazysYao/slides-littleyao/raw/main/docs/ntut-ai-course/job-site-template/job-site-template.zip`
- 搶答：10:00、11:05、11:48 各一組 quizSet，題目範圍照 spec

- [ ] **Step 1:** 在 `check-deck.mjs` 加 `--sections` 模式：依 notes 開頭的 `HH:MM` 與 `(分)` 加總，斷言第一節 50、第二節 55、第三節 55（休息頁不計）
- [ ] **Step 2:** 寫內容檔
- [ ] **Step 3:** `node build-deck.mjs /tmp/job.json job-site-content.mjs && node check-deck.mjs /tmp/job.json --sections && node $S doctor /tmp/job.json --json`，Expected: 全部 PASS、doctor `ok:true`
- [ ] **Step 4:** commit `feat: 新課綱 Synora 內容檔 job-site-content.mjs`

### Task 3: 本機畫面預覽（給講師看）

**Files:** 無（輸出放 scratchpad）

- [ ] **Step 1:** `node $S preview /tmp/job.json --no-open` 開本機預覽；用瀏覽器工具逐頁截圖到 scratchpad `job-preview/`
- [ ] **Step 2:** 逐頁檢查 Review Focus 1（copycard 截字）、文字溢出、黃底非黑字；有問題回 Task 1／2 修並重跑
- [ ] **Step 3:** 產生一頁縮圖總覽 HTML，推到 brainstorm companion 給講師看
- [ ] **Checkpoint 1 review:** 一隻 Sonnet reviewer 看 CP1 增量 diff，分「spec 符合度」與「code quality」兩段

## Checkpoint 2：網站範本

### Task 4: 範本、保底網頁、zip

**Files:**
- Create: `docs/ntut-ai-course/job-site-template/site/index.html`（虛構範例人物、單檔 CSS、區塊＝關於我／方向／學歷／專題／經歷／技能／亮點／聯絡，可替換處標 `data-slot`）
- Create: `docs/ntut-ai-course/job-site-template/fallback/index.html`（保底版：通用內容、可直接上線）
- Create: `docs/ntut-ai-course/job-site-template/job-site-template.zip`（內容：`site/index.html`）

- [ ] **Step 1:** 寫範本與保底網頁
- [ ] **Step 2:** 用瀏覽器工具在 1280 與 375 寬各截一張，Expected: 無水平捲動、文字不重疊
- [ ] **Step 3:** `cd job-site-template && zip -r -UN=UTF8 job-site-template.zip site && unzip -l job-site-template.zip`，Expected: 只有 `site/` 與 `site/index.html`
- [ ] **Step 4:** commit `feat: 求職網站範本、保底網頁與 zip`
- [ ] **Checkpoint 2 review:** 低風險，自檢截圖即可，併入 CP3 一起送審

## Checkpoint 3：教案與 README

### Task 5: 教案與 README

**Files:**
- Create: `docs/ntut-ai-course/job-site-syllabus.md`（時間表 v6、各環節重點、Prompt 原文、講師課前準備＝spec 實測清單＋素材清單）
- Modify: `docs/ntut-ai-course/README.md`（主題表加新課綱「採用」；「提問力」與 F 標「封存（Synora 改名待講師指示）」；簡報現況段落指向新內容檔與產生指令）

- [ ] **Step 1:** 寫兩份文件；Prompt 原文與 `job-site-content.mjs` 一致（用 grep 抽對確認）
- [ ] **Step 2:** commit `docs: 新課綱教案與 README 更新`
- [ ] **Checkpoint 3 review:** 一隻 Sonnet reviewer 看 CP2＋CP3 增量 diff
- [ ] **Step 3:** 推分支、開 PR（PR 描述列出：本次未做 Synora 遠端、待講師實測項目）
