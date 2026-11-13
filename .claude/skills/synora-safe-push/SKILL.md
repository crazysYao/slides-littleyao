---
name: synora-safe-push
description: 把本機 build 的求職網站課 deck 安全推上 Synora：拉遠端、逐頁比對、沒改的頁沿用遠端（保留已上傳圖片）、只上傳新圖、dry-run 差異核對、推送、讀回驗證。Use when the instructor says 「推上去」「推 Synora」「更新線上版」「push to Synora」 for decks under docs/ntut-ai-course/synora. Never push without that instruction.
---

# synora-safe-push

目標：線上版只出現講師要的改動，不重複上傳圖片，推完有讀回證據。

## 前提

- 講師明確說「推上去」才做。動畫或插圖要先經講師看過。
- Node 22+：`N=~/.nvm/versions/node/v24.22.2/bin/node`
- CLI：`Y=<synora plugin>/scripts/synora.mjs`（從已載入的 synora skill 的 `PLUGIN_DIR/scripts/synora.mjs` 取得）
- 專案 id 從內容檔或 memory 讀，不要猜。
- 暫存檔一律放 scratchpad，以下以 `$S` 代表。

## 步驟

1. **本機驗證**：`node --test synora/*.test.mjs` 全過 → `node synora/build-deck-html.mjs $S/deck-job.json synora/job-site-content.mjs` → `node synora/check-deck.mjs $S/deck-job.json --sections --expect-pages=<頁數>` → `$N $Y doctor $S/deck-job.json --json`
2. **拉遠端**：`$N $Y pull <id> $S/remote.json --json`，記下 `_saveSeq`
3. **合併**：`node synora/merge-for-push.mjs $S/remote.json $S/deck-job.json $S/push.json`
   - 輸出的 `changed / added / removed` 必須剛好等於這次要改的頁；多出任何一頁就停下查原因（遠端可能有人手改）
4. **處理圖片**：`$N $Y media-inspect --file=$S/push.json --json`
   - 列出的大圖如果遠端某頁已有同一張的上傳網址（頁面互換順序時常見），直接把 data URI 換成那個網址，不要重傳
   - 剩下真正的新圖：先 `media-prepare <id> $S/push2.json --file=$S/push.json --dry-run --json`，**問講師同意公開**後才加 `--confirm=public-assets` 正式上傳
5. **dry-run**：`$N $Y push <id> $S/push2.json --dry-run --json`，把 `semanticDiff` 的 added／modified／deleted 給自己核對一次，必須與步驟 3 一致
6. **推送**：同一檔案正式 `push`；exit code 4（版本衝突）就回到步驟 2 重拉，不重播舊檔
7. **讀回**：再 `pull` 一次，確認 `_saveSeq` 加一、頁數正確、新圖頁的 html 含 https 圖片網址
8. **收尾**：commit 內容檔（訊息註明 saveSeq）、更新紀錄檔與 memory 的 saveSeq

## 回報給講師

一句結論（saveSeq、頁數）＋新增／修改／刪除各列頁名＋上傳了哪些公開圖片＋仍未驗證的事。
