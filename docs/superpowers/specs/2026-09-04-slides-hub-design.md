# 個人簡報中心設計(open-slide + Vercel)

- 日期:2026-09-04
- 網域:`slides.littleyao.me`
- 專案路徑:`/Users/yao/github/yao/slides-littleyao`

## 目標

用 [open-slide](https://open-slide.dev/) 快速做簡報,並能「一鍵上線、複製連結分享」。所有簡報統一收在**一個** Vercel 專案裡管理。

## 核心決策(已對齊)

| 決策 | 結論 |
|------|------|
| 用途 | 用 open-slide 產自己的簡報(非做平台、非另做產品) |
| 管理方式 | 一個 workspace = 一個 GitHub repo = 一個 Vercel 專案,多份 deck 都在裡面 |
| 部署方式 | **Git 連動自動部署**:`git push` → Vercel 自動 build & 部署 |
| 隱私 | 預設公開(有連結就能看);架構保留「之後可加保護」的路,現在不做 |
| 網域 | `slides.littleyao.me` |
| 首頁清單 | 最單純 — 所有 deck 都出現在公開首頁 |

## 架構

```
本機 open-slide workspace ──git push──> GitHub repo ──自動觸發──> Vercel 專案
   (多份 deck 都在這)                                    (slides.littleyao.me)
```

- **一個 workspace = 一個 GitHub repo = 一個 Vercel 專案**,所有簡報都在這
- 首頁 = open-slide 內建的 deck 清單 / Slide manager(資料夾 + emoji 分類、拖拉排序)
- 每份 deck 有自己的路徑,分享 = 複製該 deck 的 URL

### 技術事實(來自 open-slide 官方)

- React + TypeScript,每張投影片是一個 component,畫在固定 1920×1080 畫布
- 底層是 **Vite**(非 Next.js);`@open-slide/core` 提供 runtime、Vite plugin、`open-slide` dev/build/preview CLI
- **一個 workspace 原生支援多份 deck**,slide 檔放在 `slides/<id>/index.tsx`
- `open-slide build` 產出**純靜態檔**,一鍵部署到 Vercel / 任何靜態 host,無 server、無 runtime
- 內建首頁、slide viewer、present mode、inspector、asset manager(logo 走 svgl)

## 日常流程(核心價值)

```
1. 本機:open-slide dev,叫 Claude Code 生成 / 微調新 deck
2. 做好 → git add + commit + push
3. Vercel 偵測 push,自動 build & 部署(約 1~2 分鐘)
4. 開 slides.littleyao.me/<deck 路徑>,複製連結分享
```

做好之後只需 `push`,其餘全自動。

### 新裝置上手流程(跨裝置編輯的核心價值)

在任何一台新電腦要繼續編輯 / 新增簡報,只需:

```
1. 先備妥:Node(對齊 .nvmrc 版本)+ pnpm
2. git clone <repo> && cd slides-littleyao
3. pnpm install          # 靠 committed 的 pnpm-lock.yaml 重現相同依賴
4. open-slide dev        # 開起本機,叫 Claude Code 生成 / 微調 deck
5. 做好 → git add + commit + push → Vercel 自動部署
```

能做到「只 clone 就續作」的前提(都由 item 7 保證):`pnpm-lock.yaml`、`.nvmrc`、`open-slide.config.ts`、所有 deck 原始碼與**資產**都已 commit 進 repo,沒有散落在某台機器上的本機狀態。

## 實作要處理的關鍵項(含已知的雷)

1. **Scaffold**:`npx @open-slide/cli init` 在 `slides-littleyao` 建立 workspace(注意 CLI 預設會建子目錄,實作時確認落點,必要時調整成 repo 根目錄)。目前工作環境是 worktree `/Users/yao/orca/workspaces/slides-littleyao/init`,與本文件第 5 行的 `/Users/yao/github/yao/slides-littleyao` 需在實作時對齊,確認最終 repo 根目錄落點,避免 init 出巢狀目錄。
2. **Build 設定**:open-slide 是 Vite 靜態輸出,官方文件已確認產物到 `dist/`。build command 用 workspace `package.json` 的 script(`pnpm build`,底層即 `open-slide build`),讓本機、其他裝置、Vercel 三方走同一條路徑。**commit `pnpm-lock.yaml`**,Vercel 會依 lockfile 自動選 pnpm 並自動偵測 output 目錄;首次部署仍**實跑一次確認**產物與目錄無誤。
3. **深連結 SPA fallback(先實測,必要才加)**:open-slide 官方明載「不需要 server-side routing」,輸出可能是多頁靜態,深連結(如 `/slides/<id>`)有機會原生就能開。**實作時先直接實測深連結**:能正常開就不需處理;**若** 回 404,才加 rewrite(所有路徑 → `index.html`)於 `vercel.json`。切勿預先無腦加 fallback,以免蓋掉框架原生的多頁路由。列為必做驗證項。
4. **GitHub + Vercel 串接**:建 GitHub repo、push、在 Vercel import 該 repo、設 build 設定,確認自動部署成功。
5. **自訂網域**:在 Vercel 綁 `slides.littleyao.me`,在 DNS(littleyao.me)加對應 CNAME / 記錄,確認 HTTPS 生效。
6. **隱私開關(保留,不實作)**:記錄「Vercel Deployment Protection 一鍵可開需登入才看;整站密碼需 Pro 方案」。現在維持公開,文件註明啟用位置即可。
7. **跨裝置一致性(此 repo 會在多台機器上編輯)**:這套架構本身就對跨裝置友善——任一裝置 `git clone` + 裝依賴即可續作,發佈靠 git 連動,沒有本機獨有狀態。要顧的只有「環境漂移」:
   - **統一套件管理器 = pnpm**(open-slide 官方預設),**commit `pnpm-lock.yaml`**,每台裝置與 Vercel 都用 pnpm,勿混用 npm/yarn 造成 lockfile 打架。
   - **釘 Node 版本**:加 `.nvmrc`(或 `package.json` engines),讓各裝置與 Vercel build 用同一 Node major,避免 Vite 版本相容問題。
   - **資產進 repo**:svgl logo / 圖片 / 字型要落地存進 workspace(`public/` 或 asset 目錄)並 commit,確保換裝置、離線、build 時都拿得到,不依賴執行期外部抓取。
   - **不把絕對本機路徑寫進 committed 設定**:`open-slide.config.ts` 等設定用相對路徑;本文件裡的 `/Users/yao/...` 只是紀錄,勿進 config。
   - **注意**:open-slide **無**跨裝置遙控 / 同步機制(不能用手機遙控另一台螢幕翻頁);present mode 是單機的(presenter view + 講者備註 + 計時器)。若日後需要手機遙控翻頁,得另尋方案或自建,現階段列為非目標。

## 驗證標準(完成的定義)

- [ ] `open-slide dev` 本機可跑,能生成 / 預覽一份 deck
- [ ] push 後 Vercel 自動部署成功
- [ ] `slides.littleyao.me` 首頁列出 deck
- [ ] 直接貼「某 deck 深連結」到新分頁能正常開(SPA fallback 生效,不 404)
- [ ] HTTPS 憑證正常
- [ ] `pnpm-lock.yaml` 與 `.nvmrc`(或 engines)已 commit;在另一台裝置 `git clone` + `pnpm install` 能重現本機環境並跑起 `open-slide dev`
- [ ] README 記錄日常流程、跨裝置環境需求(pnpm + Node 版本)與隱私開關啟用方式

## 非目標(YAGNI)

- 不做多人 / 帳號系統
- 不做「藏 deck / 私密 deck」(需要時再評估 open-slide 是否原生支援)
- 不自建後端 / DB(維持純靜態)
- 不做簡報平台化(非產品,是個人工具)
- 不追求手機 RWD:open-slide 是固定 1920×1080 畫布等比縮放,分享連結在手機直式會被 letterbox(縮小置中),這是框架特性、非 bug;跨裝置「觀看」以此為準,不另做響應式版面
- 不做跨裝置遙控翻頁(見實作項 7)
