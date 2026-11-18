# 北科大求職網站課 聽課版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 從現有求職網站課內容，多產一份「聽課版」Synora deck。學員只聽不做，統計互動改成現場舉手，第三節換成 Vercel 三種上線方式＋日文學習分享。

**Architecture:** 原版內容檔 `job-site-content.mjs` 一字不動。新增變換檔 `listen-content.mjs`：匯入原版 pages，用「頁序清單＋逐頁覆寫＋新頁」組出聽課版，並匯出同樣的 `{ brand, palette, pages }`。產生器 `build-deck-html.mjs` 不用改，直接吃這個檔。新增一個版型 `handRaise`。

**Tech Stack:** Node 24（`~/.nvm/versions/node/v24.22.2/bin/node`，以下記為 `$N`）、`node:test`、Synora CLI（`$Y`＝synora plugin 0.9.3 的 `scripts/synora.mjs`）。

**Spec:** `docs/superpowers/specs/2026-11-18-ntut-listen-version-design.md`

## Global Constraints

- 所有路徑相對於 `docs/ntut-ai-course/`；暫存檔放 scratchpad，記為 `$S`
- 不改 `synora/job-site-content.mjs`，也不動原 Synora 專案 `aef695ce…`
- 聽課版不得出現 `poll`、`quiz`、`checkpoint`、`homework`、`showcase`、`webProject`、`wordcloud` 元件；`copycard`（複製 Prompt）保留
- 不揭露：N4 分數、及格與否、學習中斷天數
- 第三節「彈性 10 分」沒有頁面，等講師看完佈局再決定
- 講稿開頭維持 `HH:MM 名稱(分)` 格式，`check-deck --sections` 才算得到時間
- 新頁文案依 spec 內容自擬；版型只用既有版型＋`handRaise`
- 沒有素材的截圖一律用 `n.shotFrame` 佔位框，說明寫「待講師提供：…」
- Commit：Conventional Commits，正文繁中，結尾 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Review Focus

1. 原版 build 結果要和改動前逐位元相同（`cmp`），因為兩版共用 `html-layouts.mjs` → Task 1 Step 6
2. 之後在原版新增統計頁，聽課版要擋得住；做法是用白名單頁序，不用黑名單刪除 → Task 2 測試「頁序以外的原版頁不會混進來」
3. 搬到第一節的頁面（颱風、找風格、Prompt ②）講稿還留著原版時間，`--sections` 會算錯 → Task 3 測試「有時間前綴的頁都被覆寫過」
4. 示範頁還留著「全班實作」「上傳」「換你」這類要學員動手的字 → Task 3 字詞掃描
5. 舉手頁選項超過 4 個（`s1-ai-exp` 有 8 個）會擠出畫面 → Task 1 測試 8 個選項全部渲染＋Task 5 出圖目視

---

### Task 1: `handRaise` 版型

**Files:**
- Modify: `synora/html-layouts.mjs`（在 `layouts` 物件加 `handRaise`；Task 2 再加 `shotPair`）
- Test: `synora/html-layouts.test.mjs`

**Interfaces:**
- Produces: 頁面物件 `{ layout: 'handRaise', heading: string, options?: string[], answer?: number }`，回傳 `{ body, natives: [] }`。有 `options` 時每項前面標 A、B、C…；`answer` 只用在講稿，畫面不顯示。

- [ ] **Step 1: 寫失敗測試** `handRaise：問題、選項字母、舉手圖示、不出原生元件`
  - `heading: '你用 AI 做過哪些事？'`、8 個選項 → `body` 含問題、含 `A`～`H` 各一、含 `class="hand"`；`natives` 長度 0
  - 沒有 `options` 時 `body` 仍含問題與舉手圖示
- [ ] **Step 2:** `$N --test synora/html-layouts.test.mjs` → FAIL（沒有版型 handRaise）
- [ ] **Step 3: 實作** `handRaise: (p, { palette: P }) => ({ body, natives: [] })`。問題用 `title()`；選項用兩欄格線（超過 4 項自動兩欄），字級不低於 20px；右下角放一個 inline SVG 舉手圖示（`class="hand"`、accent 色）。
- [ ] **Step 4:** 同上指令 → PASS
- [ ] **Step 5:** `$N --test synora/*.test.mjs` 全過
- [ ] **Step 6: 原版不變** `$N synora/build-deck-html.mjs $S/deck-job-after.json synora/job-site-content.mjs && cmp $S/deck-job.json $S/deck-job-after.json` → 無輸出（`$S/deck-job.json` 是本次 session 開頭 build 的基準）
- [ ] **Step 7: Commit** `feat: 新增 handRaise 舉手版型`

### Task 2: 聽課版骨架（頁序、刪頁、舉手頁、v1→v2 對照）

**Files:**
- Create: `synora/listen-content.mjs`
- Test: `synora/listen-content.test.mjs`

**Interfaces:**
- Consumes: `import * as base from './job-site-content.mjs'`；`buildDeck` from `./build-deck-html.mjs`
- Produces: `export const brand, palette, pages`（同原版形狀）；另匯出 `export const ORDER`（字串 id 或新頁物件的陣列）與 `export const OVERRIDES`（`{ [id]: Partial<Page> }`），給 Task 3～4 往裡面加。組裝規則：字串 id → `{ ...base 頁, ...OVERRIDES[id] }`；物件 → 原樣使用。

- [ ] **Step 1: 寫失敗測試**（`listen-content.test.mjs`）
  - `頁序引用的原版 id 都存在`：`ORDER` 裡每個字串都在 `base.pages` 的 id 中
  - `沒有統計元件`：`buildDeck(listen).slides` 所有 element 的 type 都不在 `['poll','quiz','checkpoint','homework','showcase','webProject','wordcloud']`
  - `刪掉的頁不在`：build 後的 id 不含 `s1-save-poll`、`s2-rescue`、`s2-v1-poll`、`s2-skill-upload`、`s3-try`、`s3-v2-upload`、`s3-obsidian`
  - `頁序以外的原版頁不會混進來`：build 後每個 id 若出現在 `base.pages`，就一定在 `ORDER` 裡
  - `舉手頁`：`s1-ai-exp`、`s1-paid`、`s2-typhoon-poll`、`s2-quiz-warmup-1`～`-3` 的 layout 都是 `handRaise`；三題搶答的 `notes` 含「正解：」＋原版正確選項文字
  - `v1→v2 對照`：`s3-v2-wall` 有兩個 `shotFrame` 原生元件（說明含「待講師提供」），沒有 `showcase`
  - `複製卡保留`：`s1-interview`、`s2-prompt-2`、`s2-skill-make`、`s3-newchat` 各有一個 `copycard`
- [ ] **Step 2:** `$N --test synora/listen-content.test.mjs` → FAIL（檔案不存在）
- [ ] **Step 3: 實作** `listen-content.mjs`
  - `ORDER` 照 spec「頁面對照」：第一節＝原第一節去掉 `s1-save-poll`，接 `s2-typhoon-video`、`s2-roof`、`s2-typhoon`、`s2-typhoon-poll`、`s2-typhoon-reveal`、`s2-interview`、`s2-style`、`s2-prompt-2`，再接 `break1`；第二節＝`s2` 分隔頁、三題舉手搶答、Skill 七頁、`s2-skill-make`、`s2-skill-save`、`s2-skill-find`、`s3-reel`、`s3-reel-reveal`、`s3-review`、`s3-fix`、`s3-v2-wall`、`s3-public`、Context 四頁、`s3-newchat`、新頁 `s2-qa`（`layout: 'qa'`），接 `break2`；第三節＝`s3` 分隔頁、`s3-drop`（Task 4 擴充）、`s3-recap`、`qa`
  - 搶答：讀 `base.pages` 裡 `s2-quiz-warmup` 的 `items`，展開成三個 `handRaise` 新頁物件，id 沿用 `s2-quiz-warmup-1..3`
  - `s3-v2-wall`：`OVERRIDES['s3-v2-wall'] = { layout: 'shotPair', heading: '講師示範：v1 → v2', … }`。在 `html-layouts.mjs` 加 `shotPair` 版型（標題＋左右兩個 `n.shotFrame`，說明分別為「待講師提供：網站 v1 截圖」「待講師提供：網站 v2 截圖」），並在 `html-layouts.test.mjs` 加一則測試：回傳兩個 type 為 `svg` 的原生元件、都在 960×540 內
- [ ] **Step 4:** 同上指令 → PASS
- [ ] **Step 5:** `$N --test synora/*.test.mjs` 全過；Task 1 Step 6 的 `cmp` 再跑一次仍無輸出
- [ ] **Step 6: Commit** `feat: 聽課版骨架（頁序、舉手頁、刪除學員操作頁）`

### Task 3: 示範口吻、節次與時間

**Files:**
- Modify: `synora/listen-content.mjs`（`OVERRIDES`）
- Modify: `synora/check-deck.mjs`（新增 `--ranges=`）
- Test: `synora/listen-content.test.mjs`

**Interfaces:**
- Produces: `check-deck.mjs` 接受 `--ranges=09:00-09:50=47,10:00-10:50=50,11:00-12:00=50`；沒給時用原本的三段（原版行為不變）

- [ ] **Step 1: 寫失敗測試**
  - `沒有要學員動手的字`：掃描所有頁的 `title`、`heading`、`tag`、`notes`、`description`，不得含 `全班實作`、`上傳你的`、`換你做`、`存好了`、`互投`、`助教`、`走動看大家`
  - `有時間前綴的頁都被覆寫過`：凡是原版 `notes` 以 `HH:MM` 開頭、且出現在聽課版的頁，`OVERRIDES[id].notes` 必須存在
  - `示範頁標題`：`s1-interview`、`s2-prompt-2`、`s2-skill-make`、`s3-newchat` 的 `tag` 以「講師示範」開頭
  - `跟著改字`：`cover.subtitle`、`s1-outline`、三個分隔頁（`s1`、`s2`、`s3`）、`s3-recap`、`qa` 都有覆寫，且 `s3-recap` 不含「上傳」
- [ ] **Step 2:** `$N --test synora/listen-content.test.mjs` → FAIL
- [ ] **Step 3: 實作覆寫**。時間依 spec「新時間表」：第一節頁面加總 47（另 3 分緩衝無頁）、第二節 50（含 `s2-qa` 12）、第三節 50（Vercel 25、日文 15、回顧 1、QA 9；彈性 10 不算）。`s1-login` 改成「加入 Synora 帶走 Prompt＋講師用的聊天 AI」；`s1-interview` 等示範頁的講稿改成講師操作、學員看投影。
- [ ] **Step 4: `check-deck.mjs` 加 `--ranges=`**，解析後取代預設 `ranges`
- [ ] **Step 5:** `$N --test synora/*.test.mjs` 全過
- [ ] **Step 6: 驗證時間** `$N synora/build-deck-html.mjs $S/deck-listen.json synora/listen-content.mjs && $N synora/check-deck.mjs $S/deck-listen.json --sections --ranges=09:00-09:50=47,10:00-10:50=50,11:00-12:00=50` → `OK：N 頁`（此時第三節尚缺 Vercel 與日文，預期失敗訊息只剩第三節；Task 4 完成後才全過）
- [ ] **Step 7: 原版不變** `$N synora/check-deck.mjs $S/deck-job-after.json --sections --expect-pages=62` → OK
- [ ] **Step 8: Commit** `feat: 聽課版改講師示範口吻與新時間表`

### Task 4: Vercel 三種上線方式＋日文分享

**Files:**
- Modify: `synora/listen-content.mjs`（`ORDER` 第三節插入新頁、覆寫 `s3-drop`）
- Test: `synora/listen-content.test.mjs`

- [ ] **Step 1: 寫失敗測試**
  - `第三節頁序`：從 `s3` 到 `qa` 的 id 依序為 `s3`、`v-ways`、`s3-drop`、`v-cli`、`v-github`、`jp-why`、`jp-need`、`jp-flow`、`jp-skills`、`jp-scene`、`jp-map`、`s3-recap`、`qa`
  - `Vercel`：`v-cli` 文字含 `vercel --prod`；`v-github` 講稿含「口述」且頁面沒有原生元件
  - `日文不揭露`：所有 `jp-*` 頁的序列化文字不含 `77`、`未及格`、`沒過`、`中斷`、`19 天`
  - `日文對回今天`：`jp-map` 的文字同時含「基本資料」「Skill」「Context」，且含 `japanes-pk.littleyao.me`
- [ ] **Step 2:** `$N --test synora/listen-content.test.mjs` → FAIL
- [ ] **Step 3: 實作新頁**（文案依 spec「Vercel」列與「日文分享」表）
  - `v-ways`（`three`）：Drop／CLI／GitHub 自動上線，約 3 分
  - `s3-drop` 覆寫：講稿改成第三節 Drop 示範，約 8 分
  - `v-cli`（`steps`）：`npm i -g vercel` → `vercel login` → `vercel --prod`，約 9 分
  - `v-github`（`rows`）：push → Vercel 自動部署 → 網址更新，口述約 5 分
  - `jp-why`、`jp-need`（`story`）：動機 3 分；只講「已報名 12/6 N3、聽力是弱點、每週 8 小時」
  - `jp-flow`（`steps`）：每日 60 分 → 打卡 → 測驗 → 複習清單 → Anki；`jp-skills`（`grid`）：7 個 Skill 各管一件事。合計 5 分
  - `jp-scene`（`split`＋一個 shotFrame「待講師提供：Agent 出題畫面」）：卡點 ちゃ／ちゃう、貯める／稼ぐ；講稿寫現場示範提示詞與「網路出狀況改播錄影」，6 分
  - `jp-map`（`compare`）：求職網站 vs 學日文對照＋PK 遊戲網址，1 分
- [ ] **Step 4:** `$N --test synora/*.test.mjs` 全過
- [ ] **Step 5:** Task 3 Step 6 的 build＋check 指令 → `OK：N 頁`（三節都對）
- [ ] **Step 6: Commit** `feat: 聽課版第三節加入 Vercel 上線與日文學習分享`

### Task 5: 出圖、預覽、文件

**Files:**
- Modify: `job-site-syllabus.md`（新增「聽課版」一節：時間表＋產生指令）
- Modify: `README.md`（一行連到聽課版）

- [ ] **Step 1:** `$N $Y doctor $S/deck-listen.json --json` → 無 error
- [ ] **Step 2: 出圖** `$N $Y render $S/deck-listen.json $S/render-listen --view=both`，逐頁看所有 `handRaise`、`s3-v2-wall`、`v-*`、`jp-*`：字不裁切、不出界、8 選項那頁可讀
- [ ] **Step 3:** 文件更新；`git diff --stat` 確認沒有 `job-site-content.mjs`
- [ ] **Step 4: Commit** `docs: 聽課版時間表與產生指令`
- [ ] **Step 5: 預覽** 停掉舊 preview，`tail -f /dev/null | $N $Y preview $S/deck-listen.json --view=both --no-open`（背景），`open -a "Google Chrome" "<url>&page=1"`，交講師逐頁看（停點：動畫與版面定稿前）

## 不在本計畫內

- 建立聽課版 Synora 專案與推送：等講師說「推上去」，走 `synora-safe-push`（新專案版本）
- 講師提供的截圖與示範錄影：到了再換掉 shotFrame
- 第三節彈性 10 分的用途
