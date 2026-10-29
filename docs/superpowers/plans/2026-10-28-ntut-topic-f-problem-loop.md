# 主題 F 問題迴圈改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把主題 F 的教案與 Synora 簡報改成以「問題迴圈」為核心：刪上線與舊核心句、新增發現問題三頁與兩張迴圈頁、工具頁 icon 化，最後推上 Synora(38 頁)。

**Architecture:** 文字與頁序只改 `topic-f-content.mjs`；新版型加在共用的 `build-deck.mjs` 的 `layouts` 物件裡，不動既有版型，確保已採用主題(`content.mjs`)產出不變。驗收靠 build 頁數、Synora `doctor`、`render` 截圖目視，以及對已採用主題的 byte 比對。

**Tech Stack:** Node 24(`~/.nvm/versions/node/v24.20.0/bin/node`)、Synora Plugin runtime 0.9.1(`~/.claude/plugins/cache/synora-official/synora/0.9.1/scripts/synora.mjs`)、ES modules。

**Spec:** `docs/superpowers/specs/2026-10-28-ntut-topic-f-problem-loop-design.md`(視覺草稿在 `.superpowers/brainstorm/7088-1793173802/content/`)

## Global Constraints
- 只改 `docs/ntut-ai-course/synora/topic-f-content.mjs`、`docs/ntut-ai-course/synora/build-deck.mjs`、`docs/ntut-ai-course/topic-f-agent-knowledge-resume.md`；不碰 `content.mjs`、`package.json`、`slides/`
- 配色只用 `topic-f-content.mjs` 的 `palette`：`YELLOW #f5b400`、`INK #16161a`；黃色只當填色，上面一律黑字
- 版面座標系 960×540，`PAD = 70`
- 「工具是租來的，資料是自己的」不可出現在簡報或教案
- 推送 Synora 是對外動作：推送前停下來問講師
- Commit：Conventional Commits，type 英文、正文繁中，結尾 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## 共用指令(下文簡寫)
```bash
N=~/.nvm/versions/node/v24.20.0/bin/node
S=~/.claude/plugins/cache/synora-official/synora/0.9.1/scripts/synora.mjs
OUT=/private/tmp/claude-501/-Users-yao-orca-workspaces-slides-littleyao------/7f64f32e-c7f4-4f73-9b28-763458bbda8a/scratchpad
cd docs/ntut-ai-course/synora
BUILD_F="$N build-deck.mjs $OUT/deck-f.json topic-f-content.mjs"
BUILD_A="$N build-deck.mjs $OUT/deck-a.json"            # 已採用主題，必須不變
```

## Review Focus
- 新版型文字溢出卡片(中文長句在 960 寬換行)→ 每個新版型都要 `render` 截圖目視，溢出就縮字或改寫
- 已採用主題 deck 被共用產生器改動波及 → 每個 checkpoint 跑 `BUILD_A` 並和基準檔 `cmp`
- 線上版在實作期間又被講師手改(`saveSeq` > 83)→ 推送前重新 `pull`，`saveSeq` 變了就停下比對
- 投票／搶答元件 id 重複或選項 id 衝突 → `doctor` 必須 0 error
- 講者備註裡講師親手寫的內容(如 `s3-why-not` 的「大型的抽抽樂」段落)被覆蓋 → 改 notes 時只增不刪講師原句

---

## Checkpoint 0：基準

### Task 0: 存基準檔
- [ ] `$BUILD_A && cp $OUT/deck-a.json $OUT/deck-a.base.json`
- [ ] `$N $S pull de37b7f0-b4f1-4597-aff0-f3103ae4a90a $OUT/deck-f-online.json --json`，確認 `saveSeq` 為 83；不是 83 就停下回報(講師又改過，需先把差異併回 `topic-f-content.mjs`)

---

## Checkpoint 1：內容調整(只用既有版型)

### Task 1: 刪頁、章節改名、文字改寫

**Files:** Modify `docs/ntut-ai-course/synora/topic-f-content.mjs`

- [ ] 刪除 pages：`s1-traits`、`s1-example-reuse`、`s3-deploy`、`s3-showcase`、`closing-1`、`closing-2`；刪頁後未被引用的常數一併移除
- [ ] 章節頁：
  - `s1` → `title: '第一節：發現問題，具體描述'`、`heading: '發現問題，具體描述'`、`sub: '收穫：知識庫 v1'`
  - `s2` → `title: '第二節：執行'`、`heading: '執行'`、`sub: '收穫：補齊的知識庫＋網站 v1'`
  - `s3` → `title: '第三節：驗證與優化'`、`heading: '驗證與優化'`、`sub: '收穫：網站 v3＋你自己的指令'`
- [ ] 第三節所有頁的 `section: '03 上線'` 改 `'03 驗證與優化'`
- [ ] `blueprint`：`sections` 第三段改 `['03 驗證與優化', '11:05–12:00', 4, 4]`；`nodes[4]` 改 `['v2 → v3', '讀者審稿\n第一直覺', 'opt']`；`arrows[3]` 改 `'驗證'`；`loop` 改 `'↺ 不滿意就把落差講具體，再跑一輪'`；`note` 改 `'網站是練習題，迴圈才是你帶走的方法。'`；notes 拿掉「網址是加分題」
- [ ] `s2-quiz-warmup.items` 換成兩題(正解 index 0)：
  - `['AI 給的結果很空泛，迴圈的下一步是什麼？', ['把狀況講得更具體', '換一個更貴的 AI', '重按一次重新產生', '放棄自己寫'], 0]`
  - `['網站做出來後，「驗證」要做什麼？', ['檢查結果對不對、哪裡要改', '馬上上線', '請 AI 再做一個', '截圖分享'], 0]`
- [ ] `s3-why-not.note` 改 `'一次做完是抽抽樂；跑迴圈，每一輪都更接近你要的。'`；notes 在原文前加一行 `'11:05 判斷時刻(5)。用迴圈回答：先具體描述，再執行、驗證、優化。'`，講師原本的「大型的抽抽樂」段落保留
- [ ] `s3-my-prompt`：notes 的時間不變；內容沒有挑工具三標準，維持
- [ ] 每頁 notes 裡出現「上線」「Vercel」「工具是租來的」的句子刪掉

- [ ] **驗證**：`$BUILD_F` 印出 `34 頁`；`grep -nE '工具是租來的|Vercel|上線' topic-f-content.mjs` 只剩 0 筆；`$N $S doctor $OUT/deck-f.json --json` 無 error；`$BUILD_A && cmp $OUT/deck-a.json $OUT/deck-a.base.json` 無輸出
- [ ] Commit：`feat: 主題 F 改以問題迴圈為核心，移除上線與舊核心句`

---

## Checkpoint 2：新版型與新頁

每個新版型都是 `layouts` 裡的新 key，參數 `p` 為 page 物件、回傳元素陣列，沿用既有 helper(`text`、`box`、`H`、`pill`、`poll`、`link`、`taskHeader`、`note`)。卡片與文字尺寸以草稿為準，實作者決定確切座標。

### Task 2: 發現問題三頁

**Files:** Modify `build-deck.mjs`(新增 `bigPrompt`、`reveal` 版型)、`topic-f-content.mjs`(`s1-example-intro` 換成三頁)

**Interfaces — Produces:**
- `layouts.bigPrompt(p: { caption: string, prompt: string })`：置中小字 caption ＋ 黑底對話泡泡大字 prompt
- `layouts.reveal(p: { ask: string, lead: string, punch: string, sub: string })`：灰色小字 ask、大字 lead ＋ 黃底 punch、下方 sub

- [ ] `topic-f-content.mjs` 把 `s1-example-intro` 換成：
  - `{ id: 's1-problem', layout: 'bigPrompt', section: '01 資料', title: '發現問題：幫我寫自我介紹', caption: '講師現場只打這一句', prompt: '幫我寫自我介紹', notes: '09:07 發現問題(3)。切到 AI 畫面，只打「幫我寫自我介紹」，不給任何資料。現場出狀況就放事先產生的結果截圖。' }`
  - `{ id: 's1-problem-poll', layout: 'poll', section: '01 資料', title: '投票：這在講你嗎', question: '這段自我介紹在講你嗎？', options: ['這在講我', '不是我'], notes: '唸出 AI 的結果再開投票。長條圖一面倒時接：所以這是在座每一個人的自我介紹。' }`(poll 欄位依既有 `s1-poll-note` 寫法)
  - `{ id: 's1-problem-reveal', layout: 'reveal', section: '01 資料', title: '揭曉：空泛是我造成的', ask: '問題出在誰？', lead: 'AI 的空泛，', punch: '是我造成的', sub: '它不認識你，因為你什麼都沒說', notes: '先口頭問「問題出在誰？AI 不夠強嗎？」再翻到這頁。收尾：覺得哪裡怪怪的，就是發現問題 → 下一頁迴圈。' }`
- [ ] **驗證**：`$BUILD_F` 印出 `36 頁`；`$N $S render $OUT/deck-f.json $OUT/r2 --view=presenter --pages=8-10` 後用 Read 看三張 PNG：文字無溢出、黃底只配黑字
- [ ] Commit：`feat: 主題 F 新增發現問題三頁(現場指令、投票、揭曉)`

### Task 3: 迴圈頁＋回顧頁

**Files:** Modify `build-deck.mjs`(新增 `loop` 版型)、`topic-f-content.mjs`

**Interfaces — Produces:**
- `layouts.loop(p: { heading: string, start: string, steps: [title, sub][4], center: string, cards: [title, body][], compare: [bad, good] })`：左側起點膠囊箭頭進入環狀四節點(上 ① 右 ② 下 ③ 左 ↺，前三個黃底黑字、↺ 黑底淺字)、圓心 `center`、右側欄 `cards`(黑底卡)＋ `compare` 對照框。環狀箭頭用 Synora `svg` 元件或 `line`／`shape` 組合，實作者決定

- [ ] 在 `s1-problem-reveal` 後插入 `s1-loop`：
  - `heading: '問題迴圈：講得越具體，改得越好'`、`start: '發現問題'`
  - `steps: [['① 具體描述', '現在的狀況＋感受'], ['② 執行', '交給 AI 動手'], ['③ 驗證', '結果對不對？'], ['↺ 優化', '把落差講得更具體']]`、`center: '一輪不夠\n就再跑一輪'`
  - `cards: [['選拔面試', '講不太出來，還是硬把自己進球的過程講給福田聽 → 講出來，才被看見'], ['升上 A 隊', '「言語化的次元不一樣！」→ 講得越細，進步越快']]`，卡片上方小標 `'《青之蘆葦》葦人的兩個階段'`
  - `compare: ['「不好看」→ 改不動', '「標題太小、第一眼看不出我會什麼」→ AI 改得動']`
  - notes(7 分鐘)：照 spec「迴圈頁內容」的講者備註五段時間軸寫入
- [ ] 在 `s3-pair` 後插入 `s3-loop-review`：同上資料(可共用同一個常數物件展開)，`section: '03 驗證與優化'`、`title: '回到迴圈：今天跑了幾輪'`，notes：`'11:33 回到迴圈(7)。問台下今天跑了哪幾步、哪一輪改最多；同一個迴圈換到寫履歷、準備面試。'`
- [ ] **驗證**：`$BUILD_F` 印出 `38 頁`；render `--pages=11` 與 `--pages=36` 目視：四節點與箭頭不重疊、右側欄不溢出
- [ ] Commit：`feat: 主題 F 新增問題迴圈頁與第三節迴圈回顧`

### Task 4: 工具頁 icon 化

**Files:** Modify `build-deck.mjs`(新增 `iconSplit`、`iconLinks`、`whoDoes` 版型)、`topic-f-content.mjs`

**Interfaces — Produces:**
- `layouts.iconSplit(p: { kicker, heading, tagline?, cards: [icon, title, desc][], dark: [icon, title, desc, chips?: string[]], link?: [url, label, desc] })`：左黃底 kicker／heading／tagline；右側 2 欄 icon 卡＋跨兩欄黑卡；有 `link` 時第一張改成連結卡(用既有 `link` helper)
- `layouts.iconLinks(p: { tag, heading, links: [icon, url, label, desc][], dark: [icon, title, desc] })`：任務標頭＋並排 icon 下載卡(每張含 `link` 元素)＋黑卡
- `layouts.whoDoes(p: { heading, task, left: { icon, name, count, steps: [who, text][] }, right: 同左, bottom: [lead, punch] })`：左灰底、右黃框；每步前 `你`／`AI` 小標籤

- [ ] 依 spec「工具介紹頁改版」逐頁改資料，文字照 spec 原句：
  - `s1-obsidian` → `iconSplit`(四卡＋黑卡；logo 不放，tagline 用文字)
  - `s1-install` → `iconLinks`(保留原兩個下載網址)
  - `s2-what-agent` → `iconSplit`(四步卡＋黑卡 chips `['OpenCode', 'Claude Code', 'Codex', 'Gemini CLI']`)
  - `s2-agent` → `whoDoes`(標題「同一個任務，誰在動手？」、count `'你動手 4 次'`／`'你動手 1 次'`)
  - `s2-style` → `iconSplit` 帶 `link`(保留原 Pinterest 網址)
- [ ] 舊 notes 保留；`s1-obsidian` notes 加「講到 🔗 可切講師 vault 秀關係圖 5 秒；最後扣回具體描述的倉庫」
- [ ] **驗證**：`$BUILD_F` 仍 `38 頁`；`$N $S render $OUT/deck-f.json $OUT/r4 --view=both` 對這五頁目視(presenter 與 student 都看)；emoji 正常顯示、卡片不溢出
- [ ] Commit：`feat: 主題 F 工具介紹頁改成 icon 卡片`

### Checkpoint 2 收尾
- [ ] `$N $S doctor $OUT/deck-f.json --json` 0 error；`$BUILD_A && cmp $OUT/deck-a.json $OUT/deck-a.base.json` 無輸出
- [ ] `$N $S contact-sheet $OUT/deck-f.json $OUT/sheet` 產生總覽，給講師看

---

## Checkpoint 3：教案文件

### Task 5: 改 `topic-f-agent-knowledge-resume.md`
- [ ] 「主題與核心」：主線改「問題迴圈：發現問題 → 具體描述 → 執行 → 驗證 → 優化」；刪核心句；成品刪上線
- [ ] 工具表刪 Vercel 列；刪「挑工具三標準」
- [ ] 三節時間軸換成 spec 新時間表(含發現問題三頁、09:10 迴圈頁、11:33 回顧)
- [ ] 「簡報(Synora)」頁數改 38、刪學員存取 `draft` 的過時描述(線上已 `open`)
- [ ] 「講師課前準備」刪 Vercel Drop 待辦；新增「對照原作確認青之蘆葦台詞」「確認 Obsidian logo 與 vault 關係圖」
- [ ] **驗證**：`grep -nE '工具是租來的|Vercel|挑工具三標準' docs/ntut-ai-course/topic-f-agent-knowledge-resume.md` 0 筆
- [ ] Commit：`docs: 主題 F 教案改以問題迴圈為核心`

---

## Checkpoint 4：推送 Synora(對外動作)

### Task 6: 推送
- [ ] 重新 `pull` 到 `$OUT/deck-f-online2.json`，確認 `saveSeq` 仍 83；變了就停下回報
- [ ] 依 README 慣例：把 `$OUT/deck-f.json` 的 `slides` 放進拉下來的檔案(保留 `_saveSeq` 等欄位)存成 `$OUT/deck-f-push.json`
- [ ] `$N $S diff de37b7f0-b4f1-4597-aff0-f3103ae4a90a $OUT/deck-f-push.json --json` 與 `push ... --dry-run --expected-save-seq=83 --json`
- [ ] **停下來**：把 contact sheet 與 dry-run 摘要給講師，取得同意
- [ ] 正式 `push`(帶 `--expected-save-seq=83`)，再 `inspect` 確認 38 頁、`saveSeq` 遞增
- [ ] 教案「簡報(Synora)」記錄推送日期；Commit：`chore: 主題 F 問題迴圈版推上 Synora`
