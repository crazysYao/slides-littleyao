# 北科大 AI 新秀課 新課綱：讓 AI 一開口就懂你（求職網站上線版）

> 狀態：採用（2026-11-11 定案）。設計見 [spec](../superpowers/specs/2026-11-11-ntut-new-syllabus-design.md)。
> 取代已採用的「提問力」與候選 F，兩者封存不再更新。

## 課程資訊
- 2026-11-26（四）09:00–12:00；學員約 20 人，多數剛畢業、求職中，多數無付費 AI
- 自帶筆電（Mac、Windows）；助教 1 位；全班動手，**每人下課都有公開網址**
- 主線：問題迴圈。發現問題 → ① 具體描述 → ② 執行 → ③ 驗證 → ↺ 優化
- 口訣：說清楚、給誰看、跑一輪、再說得更細

## 時間表
| 時間 | 分 | 內容 |
|---|---|---|
| 09:00 | 2 | 秀終點：講師上線網址 |
| 09:02 | 2 | 多選：你用 AI 做過哪些事？ |
| 09:04 | 4 | 「幫我寫自我介紹」→ 投票 → 揭曉 |
| 09:08 | 4 | ① 女朋友「好煩喔」三頁 |
| 09:12 | 2 | 今天的脈絡：迴圈＋三站 |
| 09:14 | 14 | 聊天 AI 訪問你 → `my-site/我的基本資料.md` |
| 09:28 | 8 | 安裝 Node → OpenCode Desktop（裝完重開） |
| 09:36 | 4 | 打招呼卡＝全班檢查點 |
| 09:40 | 4 | 助手／主廚／大廚＋AI Studio Key（依實測去留） |
| 09:44 | 6 | 註冊 Vercel＋`npx vercel login` |
| 09:50 | 10 | 休息：助教補裝 |
| 10:00 | 4 | 暖身搶答 |
| 10:04 | 5 | 聊天 AI vs Agent |
| 10:09 | 12 | Prompt ① Agent 訪問你 |
| 10:21 | 4 | ② 颱風天：給誰看 |
| 10:25 | 4 | 找風格＋文字雲 |
| 10:29 | 14 | 網站 v1：範本＋Prompt ②（8 分停損→保底網頁） |
| 10:43 | 8 | 上傳截圖 → 網站牆互投 |
| 10:51 | 4 | v1 滿意度 |
| 10:55 | 10 | 休息 |
| 11:05 | 3 | 回顧搶答 |
| 11:08 | 13 | 讀者審稿＋自己寫 `fix:`（v2） |
| 11:21 | 2 | 上線就是公開 |
| 11:23 | 16 | Prompt ④ Vercel 上線 |
| 11:39 | 5 | 交網址 → 上線牆互投 |
| 11:44 | 4 | 講師 Obsidian 示範：同一份資料 → 履歷、面試稿 |
| 11:48 | 3 | 搶答：迴圈四步＋口訣 |
| 11:51 | 5 | QA |
| 11:56 | 4 | 回扣開場：全班上線牆＋金句 |

## 檔案
- 簡報內容（每頁文字、講稿、Prompt 原文）：[synora/job-site-content.mjs](synora/job-site-content.mjs)
  - 產生：`node synora/build-deck.mjs /tmp/deck-job.json synora/job-site-content.mjs`（Node 22+）
  - 檢查：`node synora/check-deck.mjs /tmp/deck-job.json --sections`
  - Synora 專案尚未建立，等講師看過本機預覽後另外下指令
- 網站範本：[job-site-template/site/index.html](job-site-template/site/index.html)（虛構人物林小晴）；下載用 [job-site-template.zip](job-site-template/job-site-template.zip)
- 保底網頁：[job-site-template/fallback/index.html](job-site-template/fallback/index.html)

## 講師課前準備
### 實測（結果回寫本檔與 content.mjs）
- [ ] 乾淨 Win11、Win10：跑 winget 那一行，計時；確認裝完 Node 後 OpenCode 要重開
- [ ] 乾淨 Mac（無 brew、無 Node）：官方安裝檔 → OpenCode → 打招呼卡
- [ ] OpenCode 裡跑 `npx vercel@latest login`：網址是否顯示、是否自動開瀏覽器、授權後是否回到 OpenCode
- [ ] 全新 Email 註冊 Vercel Hobby：是否要手機、信用卡、GitHub，總耗時
- [ ] 確認 `--project` 指定專案名稱的指令與網址格式，改寫 Prompt ④
- [ ] OpenCode 內建免費模型跑「訪問 → v1 → 上線」，決定主廚 Key 兩頁去留
- [ ] Flash Lite 跑網站 v1：次數、時間、會不會截斷；跑到額度用完，看換 NVIDIA 要多久
- [ ] 學校網路或熱點：AI Studio、NVIDIA、Vercel 連得上
- [ ] 隨身碟放 Node、OpenCode 的 Win、Mac 安裝檔

### 素材
- [ ] 用這套流程做出自己的上線版，換掉封面後「終點」頁的連結
- [ ] 「今天的脈絡」三站截圖：我的基本資料.md、網站 v1、手機上的 vercel.app
- [ ] 兩個假師傅網站截圖（颱風頁），不用真實店家
- [ ] 「幫我寫自我介紹」結果截圖（網路出狀況的備案）
- [ ] 自己的 Obsidian 關係圖可現場展示
- [ ] 另備 2–3 組自己的 AI Studio Key
