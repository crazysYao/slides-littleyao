# 主題候選 B：用工程師的腦袋學任何東西(需求定案稿)

> 狀態：候選中，尚未決定採用。與主題 A 的關係(二選一或融合)未定。

## 課程資訊
同主題 A：北科大 AI 新秀課，11/26 09:00–12:00，實體電腦教室，人數未定，學員多數無付費 AI。

## 主題與核心
- **主題**：用工程師的腦袋學任何東西
- **副標**：一個工程師用 AI 學日語的 175 次 commit
- **核心一句話**：重複就自動化，複雜就拆模組
- **定位**：日語只是主案例，真正教的是可套用到任何技能的學習方法
- **技術概念掛在思維下**
  - Skill ＝ 重複就自動化
  - Skill 單一職責 ＝ 解耦
  - AnkiConnect ＝ 工具串接(MCP 的概念)
  - Claude Code 操作 vault ＝ Agent
- **工具會變、觀念不變**：Obsidian 只是 .md 的載體，純文字筆記換任何工具、任何 AI 都讀得懂
- **不提**：N3 考試(12/06)

## 講師素材(已查證)
- **JapaneseVault**(iCloud Obsidian vault)
  - 2026-03-25 ～ 09-15，175 個 commit(infra 35、auto 34、study 30、quiz 29…)
  - 107 則單字、47 則文法筆記
  - 自製 skill：japanese-vocabulary、japanese-grammar、japanese-quiz、daily-study、japanese-mc-explain、japanese-sentence-check、anki-deck
  - Leitner 複習清單 `Inbox/review-list.md`(L1–L5 分級，到期才進測驗)
  - CLAUDE.md 定義 skill 單一職責與「每個共享檔案只有一個 owner」
  - `.claude/prompt-versions/` 版本快照＋CHANGELOG
- **japanes-pk**：N5 日文雙人即時對戰遊戲(1398 題)
  - 題型抽成 registry(`renderers.js`)＝模組化、解耦案例

## 時間表(50＋休10＋55＋休10＋55，含 QA 10)

### 第一節 09:00–09:50｜拆模組
- 09:00 PK 遊戲破冰(10)：學員兩兩 N5 對戰
- 09:10 揭曉＋動機(8)：「這是我用 AI 做的」；工程師思維也能用在學習
- 09:18 Slido 投票(4)：「最近想學什麼？」「學習最常卡在哪？」
- 09:22 我的 vault 怎麼拆(13)：單字／文法／複習／聽讀寫，各自獨立又能串起來
- 09:35 實作 1(15)：用任一免費 AI，把自己想學的技能拆成模組

**休息 09:50–10:00**

### 第二節 10:00–10:55｜重複就自動化
- 10:00 Wayground 暖身搶答(5)
- 10:05 找出每天重複的事(8)：同樣的指令打了十次的痛點
- 10:13 Skill 概念(10)：把重複的流程寫成可重用的能力
- 10:23 講師 Demo(10)：現場打開 JapaneseVault，用 Claude Code 跑測驗 skill
- 10:33 實作 2(15)：寫第一個學習 Skill，貼進免費 AI 實測
- 10:48 兩兩互測＋Slido 投票最佳 Skill(7)

**休息 10:55–11:05**

### 第三節 11:05–12:00｜系統怎麼越來越好
- 11:05 Slido 投票(3)
- 11:08 單一職責與解耦(8)：skill 互相打架 → owner 規則；PK 遊戲題型 registry
- 11:16 工具串接與 Agent(8)：AnkiConnect 當 MCP 例子；Claude Code 操作 vault 當 Agent 例子
- 11:24 工具會變，.md 留下來(6)：prompt 版本快照與 CHANGELOG
- 11:30 實作 3(12)：組合成個人學習系統圖
- 11:42 總複習搶答(5)
- 11:47 收尾(3)
- 11:50 QA(10)

## 其他決定
| 項目 | 決定 |
|---|---|
| 學員實作 | 設計自己的學習系統(拆模組 → 找重複 → 寫 Skill) |
| 學員帶走 | 學習系統圖＋第一個學習 Skill 指令 |
| 實作工具 | 任一免費 AI |
| 講師展示 | 現場打開 vault 並跑一個 skill |
| 互動 | PK 遊戲破冰＋Slido 投票＋Wayground 搶答 |
| 課前影片 | 不提供 |
| 簡報風格 | Obsidian 筆記風：深色編輯器底、紫色強調、[[雙向連結]] 與關係圖視覺 |

## 待確認
- PK 遊戲的即時連線服務(Ably)免費額度能否容納全班同時連線
- 與主題 A 是二選一還是融合
