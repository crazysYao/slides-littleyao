# 修改清單（2026-11-13，第二輪）

講師逐條提出要改的內容，先記錄、不動工。基準版本：Synora saveSeq 11（60 頁）、git 5b2ba84。

| # | 頁 | 要改的內容 | 狀態 |
|---|---|---|---|
| 1 | 16（s1-save「把我的基本資料存一份副本」） | 改成 easyread 動畫效果，用 HTML 做；先做樣張給講師看效果，定稿後才放進簡報 | 講師改指定 /Users/yao/Downloads/copy-paste-demo.html 的動畫：已改成 copyPasteDemo 版型（原檔存 synora/assets/copy-paste-demo.source.html，縮放成 960×540 片段；範例資料改成學生版）。講師已認可 |
| 2 | 17（s1-save-poll「副本存好了嗎」） | 改成簡答，講師只要看到「完成的人」占全班的比例；不用三個選項 | 已改成 Synora checkpoint（按「存好了」，講師端看完成人數／比例） |
| 3 | 23–24（短片、屋頂照） | 講師請 Claude 判斷更好的呈現方式。建議：23 拿掉三張填充卡，只留問題＋影片按鈕（同第 43 頁做法）；24 改成「照片＋三句故事依序出現」，最後一句接「那天你會打給誰？」帶到第 25 頁 | 已照方案 A 改：23 只留「颱風天，你最怕什麼？」＋「看短片」；24 改 photoStory（照片＋三句依序出現） |
| 4 | 27（s2-typhoon-reveal「做錯讀者」）之後 | 補充「面試總要做功課」：新增示意圖頁（看職缺說明 → 看公司在做什麼 → 猜面試官想知道 → 放進網站第一屏）＋補充講稿。講師更正：改成圖片、不要全是文字、要面試場景，用 Codex 生圖。圖已存成 synora/assets/interview-scene.jpg；整頁放圖＋標題「面試官打開你的網站，心裡在想什麼？」，講稿用上一輪回覆的版本 | 已加入第 28 頁 s2-interview |
| 5 | 31（s2-v1-poll「網站 v1 做好了嗎」） | 同第 2 項：改成只看完成比例 | 已改成 checkpoint；講稿改成「還沒好、卡住的舉手」 |
| 6 | 32（s2-skill-1「AI 也需要工作手冊嗎？」） | 移到「沒有 Skill」（第 34 頁）之後：先看兩杯拿鐵的圖片與情境，再解釋 Agent＝員工、Skill＝手冊、Tool＝設備。新順序：有 Skill → 沒有 Skill → AI 也需要工作手冊嗎 → 打開手冊… | 已改：有 Skill → 沒有 Skill → AI 也需要工作手冊嗎；三頁講稿重排 |
| 7 | 第二節休息前（s2-skill-upload 之後、break2 之前） | 新增一頁「Skill 可以去哪裡找」：① 技能市集 https://skillsmp.com/（連結按鈕）② 直接請你的 AI 幫你找 | 已加入第 43 頁 s2-skill-find（約 2 分鐘，利用上傳 Skill 空檔講） |

## 狀態

7 項已改完（本機 62 頁、測試 73 項通過），**尚未推 Synora**，等講師看完預覽定稿。
| 8 | 29（s2-rescue「卡住了，照這張做」） | 用 operation-demo skill 轉成操作動畫 | 已改：opDemo 版型＋assets/rescue-demo.fragment.html，四種情況依序示範（等 8 分鐘→開新對話貼副本／額度用完→換 ChatGPT／沒有 Canvas→換 Claude／還是不行→舉手）。講師已認可 |
