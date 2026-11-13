---
name: deck-review-loop
description: 講師逐頁看 Synora 本機預覽時，把疑問或修改需求記進 md、依模式回答或只記不改、收斂成一張結果表，並把預覽直接開到指定頁。Use when the instructor says 「開始記錄我的疑問」「記錄我要修改的內容」「不要動工」「先修這些」「看是不是都解決了」「開預覽」「開到第 N 頁」, or sends slide screenshots one by one with comments, for decks under docs/ntut-ai-course/synora.
---

# deck-review-loop

講師邊看邊丟，Claude 邊記邊答，最後一次收斂。講師不用記自己問過什麼。

## 兩種紀錄檔（放 `docs/ntut-ai-course/`）

| 模式 | 檔名 | 觸發 | 每筆做什麼 |
|---|---|---|---|
| 疑問 | `preview-questions-YYYY-MM-DD.md` | 「開始記錄我的疑問」 | 當下回答＋寫建議；要改的標「待講師決定」 |
| 修改 | `edit-requests-YYYY-MM-DD.md` | 「記錄我要修改的內容，不要動工」 | **只記不改**，狀態「待改」；需要選方案的寫推薦 |

表頭：`| # | 頁 | 內容 | 狀態 |`。開頭一行寫基準版本（Synora saveSeq、git hash）。

## 頁碼對照

講師說的頁碼是 **Synora 頁碼**，不是內容檔陣列索引（`quizSet` 一筆展開成多頁、加刪頁會位移）。先用 build 出的 deck 查：
`node -e "const d=require('<deck.json>');d.slides.forEach((s,i)=>console.log(i+1,s.id,s.title))"`
回報時寫新頁碼，紀錄檔寫「頁碼（slide id）」。

## 記錄模式規則

- 講師說「不要動工」期間：不改內容檔、不 build 新版、不推。可以做「給講師看的樣張」（scratchpad 裡的獨立 HTML 或圖），但不放進簡報
- 講師說「開工／先修這些」：一次改完所有「待改」，未決定的照自己的推薦做並在回報寫明
- 每項改完把狀態改成「已改：…」；講師認可後改「講師已認可」

## 分流（開工時）

- 操作步驟 → `operation-demo`
- 需要圖片或場景 → Codex 生圖（場景＋配色 #F5B400／#16161A／#FBFAF7＋圖內不要任何文字＋虛構人物），轉 JPEG 進 `synora/assets/`，用 `photo` 版型
- 只看完成比例 → `checkpoint` 版型
- 影片／梗 → 先藏再揭曉：影片頁只放問題＋按鈕，下一頁 `reveal`
- 講稿 → 四段式：播放前／先問／點出重點／銜接下一頁，最後附「避開」；寫明時間算在哪個環節

## 預覽

```
$N $Y preview <deck.json> --view=both --no-open      # 背景執行
open -a "Google Chrome" "<url>&page=<N>"              # 直接開到要看的頁
```
- 用 Chrome，不用 Safari（Synora 已知 Safari 載入卡住，回報 FB-84E2881B）
- 改完重 build → 停掉舊 preview → 重開 → 開到剛改的那頁

## 收斂

講師問「是不是都解決了」：逐筆檢查狀態；沒解決的直接做完；最後給一張表（頁、疑問、處理）＋驗證結果＋仍未驗證的事。推 Synora 交給 `synora-safe-push`。
