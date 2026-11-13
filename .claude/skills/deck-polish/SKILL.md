---
name: deck-polish
description: 求職網站課 Synora deck 的總流程：講師逐頁看預覽提意見 → 記錄 → 分流改版（操作動畫、插圖、講稿、互動）→ 測試與截圖 → 講師看過 → 安全推 Synora。Use when the instructor starts a review-and-revise session on the deck — 「一起看簡報」「我要逐頁改」「開預覽我們來改」「備課改簡報」 — or when it is unclear which of deck-review-loop / operation-demo / synora-safe-push applies.
---

# deck-polish

串起三個技能。每個階段讀對應技能，不在這裡重複細節。

```
講師逐頁看預覽 ──► deck-review-loop（記錄：疑問 or 修改）
                         │ 講師說「開工」
                         ▼
                  逐項分流改版
                  ├─ 操作步驟 → operation-demo
                  ├─ 圖片／場景 → Codex 生圖（見 deck-review-loop 分流）
                  ├─ 講稿／串場 → 四段式講稿
                  └─ 其他版面 → slide-authoring 既有版型
                         │
                         ▼
          測試先行 → build → check-deck → 截圖（播放中＋截圖模式）
                         │
                         ▼
          預覽開到改過的頁 → 講師認可
                         │ 講師說「推上去」
                         ▼
                  synora-safe-push → 讀回 → 更新紀錄與 memory
```

## 停點（要講師決定，其他自主）

1. 記錄模式期間不改簡報
2. 新圖片要上傳成公開網址前
3. 動畫、插圖定稿前（給講師看效果）
4. 推 Synora 前（講師說「推上去」）

## 每次改完都做

- `node --test synora/*.test.mjs` 全過
- commit（Conventional Commits，正文繁中）並推到目前分支
- 紀錄檔狀態更新
- 回報：先講結論，列改了哪幾頁（新頁碼）、驗證證據、仍未驗證的事

## 參考

本流程的來源與證據：`docs/ntut-ai-course/session-distill-2026-11-13.md`
