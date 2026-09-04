# Eric open-slide repo 參考實作清單(下一輪實作準備)

- 日期:2026-09-04
- 比較對象:[ericlu-sys/open-slide](https://github.com/ericlu-sys/open-slide)(分析時 HEAD:`c98bf68`)
- 對照 spec:`docs/superpowers/specs/2026-09-04-slides-hub-design.md`(該 spec 正由其他 session 實作中,**本文件不修改 spec**,列為下一輪迭代的準備素材)

## 結構性結論(先讀這段)

Eric 的 repo 是 **open-slide 框架本身的 fork(pnpm monorepo)**:`packages/core`、`packages/cli`、`apps/web`,他的個人簡報放在 `my-slide/` 子目錄,以 `"@open-slide/core": "workspace:*"` 直接依賴原始碼(因此他能順手 patch core,如 Vite `fs.allow` 修正)。

**我們的 spec 走「獨立 workspace + 官方 published 套件」路線,對個人簡報中心是更簡單正確的選擇 —— 不需要學他 fork 整個框架。** 以下參考項全部都能在獨立 workspace 中落地。

## 給「目前實作中 session」的即時情報(非新工作,只是降風險)

CLI scaffold 模板 `packages/cli/template/vercel.json` **原生就內建**:

```json
{
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

→ spec「實作要處理的關鍵項」#2(build 設定)與 #3(SPA fallback)在 `npx @open-slide/cli init` 之後**應該已自帶**,實作時只需驗證存在、不需手寫。scaffold 同時自帶 `.claude/skills/`(create-slide、slide-authoring、apply-comments、create-theme、current-slide、slide-i18n)、`themes/`、`assets/`、`slides/.folders.json`,這些是框架管理的(用 `pnpm sync:skills` 同步,不要手動改)。

## 下一輪可參考的實作(依建議優先序)

### 1. ~~`open-slide.config.ts` 設定 `locale: zhTW`~~ ✅ 已完成(2026-09-04)

### 2. 個人主題:`themes/<id>.md` 【中、做第一份正式 deck 前】

- 出處:`my-slide/themes/wport-teal.md`(格式範本)、`aurora.md`、`sticker-pop.md` 等
- 模式:用 markdown frontmatter(name/description/mode)+ Palette 表格 + Typography + Layout + Assets 段落定義主題;`create-slide` skill 產 deck 前會先讀主題檔。另可配 `<id>.demo.tsx` 展示頁。
- 下輪工作:做一份 `themes/littleyao.md` 個人品牌主題(色板、字型、layout 規則),之後所有 deck 風格一致。

### 3. 首頁分類:`slides/.folders.json` 【小、deck 變多再做】

- 出處:`my-slide/slides/.folders.json`
- 模式:`folders`(id + name + emoji icon)+ `assignments`(deck id → folder id)。Eric 用「品牌/客戶」分資料夾(無白丁📖、WPORT💼、預設範本📦)。
- 下輪工作:規劃自己的分類法(例:工作/社群/範本),deck 超過 5 份時啟用。

### 4. 全域共用資產:`assets/` + `@assets/` import 【小】

- 出處:`my-slide/assets/`(logo、講師照、吉祥物 PNG 一整組)
- 模式:跨 deck 共用的 logo / 頭像放全域 `assets/`,以 `@assets/...` import;單一 deck 專屬素材放 `slides/<id>/assets/`。
- 下輪工作:建立個人 logo / 頭像的全域資產,寫進主題檔的 Assets 段落。

### 5. 自訂 skill + canonical template deck 模式 【大、有固定產出格式需求才做】

- 出處:`my-slide/.claude/skills/caiceo-carousel/SKILL.md` + `slides/caiceo-template/index.tsx`
- 模式(這是整個 repo 最有洞察的做法):
  - 在框架管理的 skills 旁**新增自己的 skill**(框架 sync 不會動到它)
  - skill 指向一個 **canonical template deck** 當「活樣式庫」:每頁展示一個模組,做新內容 = 複製整檔、只改底部資料區
  - skill 內寫死「版型鐵則」(尺寸、品牌色、字體、命名規範),違反即重做
- 下輪工作:若之後有重複性的簡報格式(例:讀書會固定版型、課程簡報),照此模式建自己的 skill + template deck。

### 6. Playwright 匯出 PNG:`scripts/export-*.sh` 【中、超出 spec 範圍,備查】

- 出處:`my-slide/scripts/export-caiceo-posts.sh`
- 模式:對著 dev server,用 Playwright 逐頁開 `/s/<id>?p=N`、按 `f` 進 present 模式、依 `data-slug` 命名截高解析 PNG(deviceScaleFactor 2 → 2160×2160)。Eric 拿來把 slide 變 IG 輪播圖。
- 價值:未來要「簡報頁 → 社群圖 / 講義圖」時直接抄這支 script。需 devDeps 加 `playwright`(Eric 另加了 `sharp`)。

### 7. 工程細節 【小、實作時順手】

- ~~pin Node~~ ✅ 已完成(2026-09-04):採 pin 模式但改鎖 Node 24 LTS(20 已於 2026/4 EOL):`engines` 改 `24.x` + 根目錄 `.node-version`
- `netlify.toml` 等其他平台 fallback 設定:不需要,我們只用 Vercel(備查:同樣是 `/* → /index.html` 200)

## 不參考的部分(明確排除)

- **Fork 框架 monorepo**:維護成本高,個人用途無必要;要客製 core 時再評估
- `apps/web`(open-slide 官網 landing page):與我們無關
- Vercel 設定中的 turbo/monorepo build command(`pnpm turbo run build --filter=my-slide`):那是 monorepo 佈局才需要,獨立 workspace 用 scaffold 預設即可

## 退場條件

各項併入未來 spec / 實作並完成後,刪除對應段落;全部消化完後本文件收斂為一行 reference 併回 README 或刪除。
