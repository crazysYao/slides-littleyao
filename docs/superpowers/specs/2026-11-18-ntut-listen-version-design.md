# 北科大求職網站課：聽課版 設計

基準：main `9416e39`，原版 62 頁（Synora 專案 `aef695ce…`，saveSeq 12）。

## 目標

另產一份「聽課版」簡報：學員只聽不做，講師示範全部操作。原版簡報與原 Synora 專案完全不動。

## 已定決策（2026-11-18 與講師討論）

| 項目 | 決定 |
|---|---|
| 學員角色 | 只聽不做；講師示範所有操作 |
| Synora | 學員仍用手機加入，只用來跟著翻頁、複製 Prompt 帶回家；不按任何統計按鈕 |
| 統計互動 | 投票 6、7、26，搶答 20–22 → 現場舉手頁（大問題＋舉手圖示，選項 A/B/C 依序舉手） |
| 完成確認 17、32 | 刪除 |
| 上傳 42、51 | 刪除 |
| 網站牆 52 | 改成靜態頁：講師示範的 v1 → v2 前後對照 |
| 操作頁 | 改講師示範口吻（標題＋講稿）；Prompt 卡保留複製按鈕；「卡住了怎麼辦」31、「換你做一次」50 刪除 |
| 長度 | 維持原長度（三節＋QA） |
| Vercel | 擴成約 25 分：Drop 拖拉上架 → Agent（Claude Code）改網站並一句話部署 → 改一次就自動更新 |
| 日文分享 | 「我怎麼用 Agent＋Obsidian 學日文」約 25 分，取代原「應用②：Obsidian」；素材講師提供 |
| 節次 | 重切三節（見下），剩餘時間由第二節末的舉手 QA 吸收 |
| 版本做法 | 內容檔共用；聽課版是一份「變換檔」，build 時套用。之後改原版，聽課版自動跟著更新 |

## 新時間表（草案）

### 第一節 09:00–09:50｜講清楚＋做出 v1
| 分 | 內容 |
|---|---|
| 4 | 封面、三節、終點 |
| 3 | 加入 Synora（只為了帶走 Prompt）＋講師用的聊天 AI |
| 2 | 舉手：用 AI 做過哪些事、有沒有付費 AI |
| 12 | 自我介紹的空泛 → 手搖飲 → 女朋友「好煩喔」 |
| 10 | 講師示範：讓 AI 訪問我 → 存副本 |
| 5 | 颱風天找師傅（短片、屋頂、兩個網站、舉手、揭曉） |
| 1 | 面試官在想什麼 |
| 3 | 找風格 |
| 7 | 講師示範：Prompt ② 做出網站 v1 |
| 3 | 緩衝 |

### 第二節 10:00–10:50｜Skill＋改更好＋Context
| 分 | 內容 |
|---|---|
| 3 | 暖身舉手搶答 3 題 |
| 11 | Skill 咖啡店 7 頁＋示範做 Skill、收好、去哪找 |
| 9 | 短片：全部丟給 AI → 讀者審稿 → 自己寫 fix:（講師示範出 v2） |
| 4 | v1 → v2 前後對照＋分享就是公開 |
| 11 | Context 4 頁＋示範開新對話做面試自介 |
| 12 | 舉手 QA＋緩衝 |

### 第三節 11:00–12:00｜上架＋我的學習系統
| 分 | 內容 |
|---|---|
| 25 | Vercel：Drop → Agent 部署 → 改一次自動更新 |
| 25 | 分享：我怎麼用 Agent＋Obsidian 學日文 |
| 1 | 回顧 |
| 9 | QA |

## 頁面對照（原版 → 聽課版）

- 刪除：`s1-save-poll`、`s2-rescue`、`s2-v1-poll`、`s2-skill-upload`、`s3-try`、`s3-v2-upload`、`s3-obsidian`
- 改舉手：`s1-ai-exp`、`s1-paid`、`s2-typhoon-poll`、`s2-quiz-warmup`（整組 3 題）
- 改靜態對照：`s3-v2-wall`
- 改示範口吻：`s1-login`、`s1-interview`、`s1-save`、`s2-prompt-2`、`s2-skill-make`、`s2-skill-save`、`s3-review`、`s3-fix`、`s3-newchat`
- 搬節次：颱風、面試官、找風格、Prompt ② 移到第一節；`break1` 移到 Prompt ② 之後
- 跟著改字：封面副標、`s1-outline`、`s1-goal`、三個節次分隔頁、`s3-public`、`s3-recap`、`qa`
- 新增：Vercel 約 4 頁（取代並擴充 `s3-drop`）、日文分享約 4 頁骨架、第二節末 QA 頁

## 技術做法

- 新檔 `synora/listen-content.mjs`：從 `job-site-content.mjs` 匯入，用「頁面順序 id 清單＋逐頁覆寫＋新頁」組出聽課版
- 新版型 `handRaise`：大問題＋選項 A/B/C＋舉手圖示；搶答題答案寫在講稿
- build：`node synora/build-deck-html.mjs $S/deck-listen.json synora/listen-content.mjs`
- 三條測試：
  1. 原版 build 結果與改動前完全相同
  2. 聽課版沒有 poll、quiz、checkpoint、homework、showcase 這些統計元件
  3. 聽課版引用的每個原版 id 都存在（`s2-quiz-warmup` 以展開前的 id 為準）

## 待講師提供（排練 11/19、凍結 11/23）

- 日文分享的內容與截圖（流程、Obsidian 畫面、Agent 對話）
- 講師示範用的網站 v1、v2 截圖（`synora/assets/` 目前沒有）
- Agent → Vercel 部署流程要先實跑一次，確認現場可行

## 不做的事

- 不改原版內容、不動原 Synora 專案 `aef695ce…`
- 聽課版要建新的 Synora 專案；建立與推送都等講師說「推上去」
