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

## 實作要處理的關鍵項(含已知的雷)

1. **Scaffold**:`npx @open-slide/cli init` 在 `slides-littleyao` 建立 workspace(注意 CLI 預設會建子目錄,實作時確認落點,必要時調整成 repo 根目錄)。
2. **Build 設定**:open-slide 是 Vite 靜態輸出。Vercel 需設對 build command(`open-slide build`)與 output 目錄(預期 `dist`)。Vercel 多半能自動偵測 Vite,但此框架為客製,**實作時實跑一次確認**產物與目錄。
3. **深連結 SPA fallback(必做)**:open-slide 為前端路由,直接開 `/slides/<id>` 這類深連結時,靜態站可能回 404。需加 rewrite(所有路徑 → `index.html`),用 `vercel.json` 或 `vercel.ts`。**此項未設,分享的深連結會壞**,列為必做驗證項。
4. **GitHub + Vercel 串接**:建 GitHub repo、push、在 Vercel import 該 repo、設 build 設定,確認自動部署成功。
5. **自訂網域**:在 Vercel 綁 `slides.littleyao.me`,在 DNS(littleyao.me)加對應 CNAME / 記錄,確認 HTTPS 生效。
6. **隱私開關(保留,不實作)**:記錄「Vercel Deployment Protection 一鍵可開需登入才看;整站密碼需 Pro 方案」。現在維持公開,文件註明啟用位置即可。

## 驗證標準(完成的定義)

- [ ] `open-slide dev` 本機可跑,能生成 / 預覽一份 deck
- [ ] push 後 Vercel 自動部署成功
- [ ] `slides.littleyao.me` 首頁列出 deck
- [ ] 直接貼「某 deck 深連結」到新分頁能正常開(SPA fallback 生效,不 404)
- [ ] HTTPS 憑證正常
- [ ] README 記錄日常流程與隱私開關啟用方式

## 非目標(YAGNI)

- 不做多人 / 帳號系統
- 不做「藏 deck / 私密 deck」(需要時再評估 open-slide 是否原生支援)
- 不自建後端 / DB(維持純靜態)
- 不做簡報平台化(非產品,是個人工具)
