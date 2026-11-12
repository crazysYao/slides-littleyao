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
| 09:04 | 4 | 「幫我寫自我介紹」→ 揭曉 |
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
  - 產生：`node synora/build-deck-html.mjs /tmp/deck-job.json synora/job-site-content.mjs`（Node 22+；每頁一塊 HTML 底圖含版面與動畫，互動元件為原生，設計見 [清楚版面＋動畫](../superpowers/specs/2026-11-12-ntut-deck-clear-layout-design.md)）
  - 測試：`node --test 'synora/*.test.mjs'`
  - 檢查：`node synora/check-deck.mjs /tmp/deck-job.json --sections --expect-pages=50`，再跑 Synora 本機 `doctor /tmp/deck-job.json --json`（schema 檢查，兩個都要過）
  - Synora 專案尚未建立，等講師看過本機預覽後另外下指令
- 網站範本：[job-site-template/site/index.html](job-site-template/site/index.html)（虛構人物林小晴）；下載用 [job-site-template.zip](job-site-template/job-site-template.zip)
- 保底網頁：[job-site-template/fallback/index.html](job-site-template/fallback/index.html)，跟範本一起打包在 zip 裡；v1 做不出來就蓋掉 `site/index.html`

## 講師課前準備
### 實測（結果回寫本檔與 content.mjs）
- [ ] 乾淨 Win11、Win10：跑 winget 那一行，計時；確認裝完 Node 後 OpenCode 要重開
- [ ] 乾淨 Mac（無 brew、無 Node）：官方安裝檔 → OpenCode → 打招呼卡
- [ ] OpenCode 裡跑 `npx vercel@latest login`：網址是否顯示、是否自動開瀏覽器、授權後是否回到 OpenCode
- [ ] 全新 Email 註冊 Vercel Hobby：是否要手機、信用卡、GitHub，總耗時
- [x] 確認 `deploy site --prod --yes --project 名稱 --create-if-missing`（在 my-site 跑）能建立新專案、網址格式、名稱被用走時的網址，結果回寫 Prompt ④
  - 範圍：只驗證這行部署指令本身，用講師已登入的帳號跑；全新帳號註冊與 OpenCode 內 `vercel login` 是上面另外兩項，還沒測，全新帳號從註冊到上線的整段流程要等那兩項做完才算驗證
  - 2026-11-12 實測（Vercel CLI 65.14.0，測試 my-site 內放 `site/index.html` 與假的 `我的基本資料.md`）：指令一次成功，輸出有 `✓ Created`、`Production`（帶亂碼的部署網址）、`▲ Aliased`（正式網址）三行
  - 正式網址格式：`https://<專案名稱>.vercel.app`
  - 名稱被別人用走（測 `my-site`）：一樣建立成功，正式網址變成 `https://my-site-xi-ochre.vercel.app` 這種多一段的形式，仍以 Aliased 那行為準
  - 同一個專案名稱再跑一次：網址不變、內容更新；剛跑完第一次打開可能還是舊版，重新整理即可
  - 只上傳 site：部署檔案清單只有 `index.html`，`/我的基本資料.md` 回 404
  - `project ls` 只列自己帳號的專案，查不到別人用走的名稱；被用走時看 Aliased 那行即可
- [ ] 用沒登入的手機分別打開正式網址與帶亂碼的部署網址，確認哪個要登入（實機手機還沒測）
  - 2026-11-12 已用無登入的 HTTP 請求，以及全新瀏覽器環境（等同無痕視窗，桌面與 iPhone 模擬各一次）實測：正式網址直接看得到網站；帶亂碼的部署網址被導到 Vercel 登入頁（新專案預設開 Vercel Authentication）
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
