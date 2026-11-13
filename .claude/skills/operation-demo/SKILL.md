---
name: operation-demo
description: 把「學員要動手操作」的投影片做成游標示範動畫（選取 → 按鈕 → 飛過去 → 貼上 → 打字 → 完成打勾），右側步驟卡同步亮起。Use when a slide teaches an on-screen operation — 複製貼上、存檔、切換 App、點按鈕、填表、登入、上傳、截圖、開新對話 — or the user says "做成操作動畫"、"像存副本那頁那樣"、"操作示範"、"copy paste demo". Applies to Synora decks built by docs/ntut-ai-course/synora (html layouts), not to open-slide React slides.
---

# operation-demo

講師認可的操作示範樣式：一個舞台演出真實操作，旁邊三張步驟卡跟著亮。學員看一次就知道手要點哪裡。

## 參考實作（先讀）

- 原始示範：`docs/ntut-ai-course/synora/assets/copy-paste-demo.source.html`（講師提供，整頁版）
- 簡報片段：`docs/ntut-ai-course/synora/assets/copy-paste-demo.fragment.html`（縮成 960×540、CSS 全部 scope 在 `#cpd`）
- 版型：`html-layouts.mjs` 的 `opDemo`（內容檔寫 `layout: 'opDemo', demo: '<檔名>'`，讀 `assets/<檔名>.fragment.html`；要外部連結就加 `link`，原生按鈕放在右下 644,412）
- 範例：`s1-save`（copy-paste-demo，單一流程三步）、`s2-rescue`（rescue-demo，四種情況依序示範，自己手寫 scoped CSS）

## 畫面結構（960×540）

| 區塊 | 位置 | 內容 |
|---|---|---|
| 標題 | `title(p.heading)`，top 58 | 一句話講要做什麼 |
| 舞台 | left 44, top 112, 576×288（原 960×480 用 `zoom:.6`） | 來源視窗（聊天 AI）→ 目的裝置（手機／電腦） |
| 字幕 | 舞台下方 top 406 | 「步驟 N：……」逐步換字 |
| 控制列 | top 446 | 裝置切換（手機／電腦）、自動循環、重播 |
| 步驟卡 | right，left 644 | 三到四張：圖示或編號＋一句話＋說明；`active` 亮框、完成打勾 |

## 動畫腳本元素

照參考實作的 `run()` 時間軸組合，每一步都要有：
1. `setStep(n)` ＋ `setCap('步驟 n：…')`
2. 游標移動 `move()` → 按下 `click()`（手機用觸控圓點與長按漣漪，電腦用箭頭與右鍵選單）
3. 被操作元件的回饋：選取高亮、按鈕變「已複製」、toast、飛行卡片、逐行出現、打字、`已存好` 徽章
4. 結尾 `setStep(最後+1)` 全部打勾，停 3 秒再循環

## 必守規則

- **CSS 全部 scope**：選擇器前加容器 id（如 `#cpd`）；先刪 CSS 註解，用括號深度解析 `@keyframes`，不要用簡單正規式切規則
- **避開 html-kit 的同名 class**：`.done`、`.in`、`.card`、`.t`、`.cap` 會被全域樣式蓋掉，改名（參考實作用 `.fin`、`.vis`）
- **不能有 `infinite`**：測試「全份：沒有循環動畫頁」會擋；閃爍游標用有限次數（例如 `steps(1) 40`），循環交給 JS
- **縮放用 `zoom`，不要用 `transform: scale`**：截圖模式 `.cap *{transform:none!important}` 會把 transform 關掉
- **截圖模式顯示最終狀態**：`window.__SYNORA_CAPTURE__` 或 `prefers-reduced-motion` 時呼叫 `finalState()`，並把 toast、飛行卡、游標、選單、控制列 `display:none`（kit 的 `.cap *{opacity:1}` 會讓它們全部浮出來）
- **範例資料用課程情境**：例如學生的「我的基本資料」，不要用與課程無關的人設
- 新版型加進 `build-deck-html.test.mjs` 的 `NEW_LAYOUTS`（舊產生器沒有它）

## 驗收

1. `node --test synora/*.test.mjs` 全過
2. headless Chrome 各截一張：播放中（`--virtual-time-budget=9000`）與截圖模式（注入 `window.__SYNORA_CAPTURE__=1`），兩張都不能有元素蓋住標題或跑出畫面
3. `preview <deck> --view=both` 用 Chrome 給講師看；Safari 有已知的載入卡住問題（Synora 回報 FB-84E2881B），不要用 Safari 驗
4. 講師看過效果才推 Synora

## 注意

- 舞台裡沒有定位的元素會被 `.stage::before` 的漸層蓋住變淡，側欄要加 `position:relative`
- headless Chrome 的 `--virtual-time-budget` 對 CSS transition 不準，播放中截圖會有半透明殘影；以截圖模式和講師在真 Chrome 看到的為準
