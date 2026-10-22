# 北科大 AI 新秀課(11/26 09:00–12:00)備課

## 主題候選
| 代號 | 主題 | 狀態 | 檔案 |
|---|---|---|---|
| A | 問對問題的人：AI 時代最值錢的能力 | 需求定案稿 | [topic-a-ask-better-questions.md](topic-a-ask-better-questions.md) |
| B | 用工程師的腦袋學任何東西 | 需求定案稿 | [topic-b-engineer-mindset-learning.md](topic-b-engineer-mindset-learning.md) |
| F | 筆記變作品：AI Agent × 知識庫 × 個人網站(Obsidian＋OpenCode Desktop＋Vercel) | 候選，教案定稿，Synora deck 已建(2026-10-22) | [topic-f-agent-knowledge-resume.md](topic-f-agent-knowledge-resume.md) |
| C–E | 見下方 | 已快速評估，未採用 | — |
| **採用** | 為什麼、為什麼不、有沒有更好的：AI 時代的提問力 | 主題＋時間表已定稿 | [core-viewpoint.md](core-viewpoint.md) |

## 跨主題已定案
- 時間骨架：50＋休10＋55＋休10＋55，含 QA 10 分鐘
- 互動：改用 Synora 原生投票(poll)與搶答(quiz)，取代 Slido(2026-10-19)
- 課前影片：不提供
- 學員實作：任一免費 AI

## 2026-10-16 討論紀錄：C–E 快速評估
| 代號 | 核心一句話 | 初步判斷 |
|---|---|---|
| C｜把煩人的事做成小工具 | 不爽就是需求，需求寫清楚 AI 就做得出來 | 唯一跟 A、B 拉開差異(學員做出東西) |
| D｜從一個想法到可討論的產品 | 想法不值錢，能被討論的想法才值錢 | 偏 PM 職能，與 A 高度重疊 |
| E｜這堂課是怎麼備出來的 | AI 不是幫你做完，是陪你想清楚 | 是 A 的實戰版，與 A 高度重疊 |

- 素材現況：實習生歡送簡報在 `slides/intern-farewell/`；SiftBuddy、`2026_ai_teaching` 本機 `~/github` 下找不到，需確認位置
- **結論：A–E 都不是講師想要的**
  - 原因：不夠「是我」。都在教「怎麼用 AI」，換個講師換掉案例也講得出來，缺少講師獨有的觀點

## 2026-10-16 留下的討論起點：先挖觀點，再定主題

> 2026-10-19 已依此討論，結果見 [core-viewpoint.md](core-viewpoint.md)
不再從案例或方法出發，先回答：

- 關於 AI、工作或學習，有什麼是講師相信、但多數人不這麼想的？
- 提示角度
  - 常跟同事或實習生爭的一件事
  - 看到大學生或新人用 AI 時最想吐槽的地方
  - 自己用 AI 後被翻轉過的想法
  - 台下只能記住一句話時，希望是哪句

A–E 的案例與素材保留，觀點定下來後再挑合適的當佐證。

## 簡報現況(2026-10-19)
- 簡報改在 **Synora** 製作，不再用 open-slide 的 `slides/ntut-three-questions/`
- 舊版 open-slide 簡報＋自製互動系統(`live/`)保存在分支 `backup/ntut-live-f4b9be9`
  - 內容來源：`slides/ntut-three-questions/content.tsx`(頁面)與 `teacher-slides/ntut-three-questions/index.tsx`(Demo 頁、講稿、搶答正解)
  - 取用：`git show backup/ntut-live-f4b9be9:slides/ntut-three-questions/content.tsx`
- 簡報內容核心：[synora/content.mjs](synora/content.mjs)，每頁文字、講稿、投票與搶答都在這裡，改字只改這支
- 版面產生器：[synora/build-deck.mjs](synora/build-deck.mjs)，只管排版，讀 content.mjs 產生 deck
  - 產生：`node synora/build-deck.mjs /tmp/deck.json`(需 Node 22+)
  - 重推前先 `pull` 線上版比對，避免蓋掉在 Synora 編輯器裡做的手動修改
- Synora 專案 ID `2eb9c054-226a-4337-86e3-93c0d970d29d`，學員加入碼 `AIF3FUEC`

## 進度
- [x] 教案 [lesson-plan.md](lesson-plan.md)
- [x] Synora deck 產生器(53 頁：36 頁內容＋Demo＋10 題搶答＋2 個排行榜＋4 頁揭曉拆頁；2026-10-20 依 attention-review 修正後重推)
- [x] 建立 Synora 專案並 push、設定上課日 11/26
- [x] 教案「課前準備」改寫為 Synora 操作
- [x] 安裝 Synora 官方 Claude Code Plugin(0.8.8)並完成 OAuth 登入，`doctor` ready(2026-10-19)
- [ ] 學員存取仍是 `draft`：classroom-preflight 判定 blocked，待決定開放時間
- [ ] 第二節關鍵字改版(情境 → 揭曉)：Prompt、Context 已定案，Skill／MCP／Agent 待續，見 [設計稿](../superpowers/specs/2026-10-20-ntut-section2-terms-design.md)
- [ ] 講師在 Synora 編輯器逐頁檢查、改字
- [ ] 真實課堂互動(投票、搶答計分)尚未在 Presenter／Student 實測
