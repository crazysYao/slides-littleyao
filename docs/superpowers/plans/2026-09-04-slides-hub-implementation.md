# 個人簡報中心(open-slide + Vercel)Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在本 repo 建立 open-slide workspace,接上 GitHub → Vercel 自動部署,綁定 `slides.littleyao.me`,達成「本機做簡報 → push → 上線分享連結」與「任一新裝置 clone 即可續作」。

**Architecture:** 一個 workspace = 一個 GitHub repo = 一個 Vercel 專案。open-slide(Vite 底層)build 出純靜態 `dist/`,Vercel Git 連動自動部署;無後端、無 DB。

**Tech Stack:** open-slide(`@open-slide/cli` + `@open-slide/core`)、React + TypeScript、pnpm、Vercel、GitHub(`gh` CLI)。

**Spec:** `docs/superpowers/specs/2026-09-04-slides-hub-design.md`

## Global Constraints

- 套件管理器**只用 pnpm**(已裝 10.33.2),全程勿用 npm/yarn 安裝依賴
- Node 釘 **20**(本機 v20.19.6);`.nvmrc` 與 `engines` 必須 commit
- `pnpm-lock.yaml` 必須 commit;`node_modules/`、`dist/` 必須 gitignore
- 所有 committed 設定**只用相對路徑**,禁止 `/Users/yao/...` 絕對路徑進 config
- 部署維持**純靜態**,不加任何 server/runtime
- **先實測、必要才加**:`vercel.json` rewrite 只在線上深連結實測回 404 時才加(Task 6)
- GitHub 帳號:`crazysYao`;正式部署分支:`main`;目前工作分支:`init`(worktree `/Users/yao/orca/workspaces/slides-littleyao/init`)
- Commit 用 Conventional Commits,正文繁體中文

## 執行環境事實(2026-09-04 已確認)

- repo 根目錄現況:只有 `docs/`,**尚無 git remote**
- `gh` 已登入 `crazysYao`;pnpm 10.33.2、Node v20.19.6 已裝
- 本 session 有 Vercel MCP 工具(`mcp__claude_ai_Vercel__*`)可用

---

## Checkpoint 1:本機 workspace 可跑(Tasks 1–3)

### Task 1: Scaffold open-slide workspace 至 repo 根目錄

**Files:**
- Create: workspace 全套(`package.json`、`open-slide.config.ts`、`slides/`、`themes/`、`CLAUDE.md`、`AGENTS.md` 等,由 scaffolder 產生)
- 既有的 `docs/` 目錄**必須保留不動**

**Interfaces:**
- Produces: repo 根目錄即 workspace 根目錄;`pnpm dev` 可啟動 dev server(預設 port 5173);第一份 demo deck 位於 `slides/<id>/index.tsx`

- [ ] **Step 1: 在 scratchpad 先 scaffold(CLI 會建子目錄,不能直接在 repo 根跑)**

```bash
cd "$SCRATCHPAD"   # 本 session 的 scratchpad 目錄
npx @open-slide/cli init slides-littleyao
ls -la slides-littleyao/
```

Expected: 產生 `slides-littleyao/` 子目錄,內含 `package.json`、`slides/`、`open-slide.config.ts` 等。若 CLI 互動式提問(套件管理器選 **pnpm**、其餘取預設)。

- [ ] **Step 2: 檢查 scaffold 內容物,確認無 `.git`、無與 `docs/` 衝突**

```bash
ls -la "$SCRATCHPAD/slides-littleyao/"
# 若 scaffolder 自帶 .git,先移除,避免污染本 repo:
rm -rf "$SCRATCHPAD/slides-littleyao/.git"
# 確認 scaffold 沒有 docs/ 目錄(有的話停下回報,不可覆蓋)
test ! -e "$SCRATCHPAD/slides-littleyao/docs" && echo "OK: no docs collision"
```

Expected: `OK: no docs collision`

- [ ] **Step 3: 搬進 repo 根目錄(含 dotfiles)**

```bash
REPO=/Users/yao/orca/workspaces/slides-littleyao/init
cp -R "$SCRATCHPAD/slides-littleyao/". "$REPO"/
ls -la "$REPO"
```

Expected: repo 根同時有 `docs/`、`package.json`、`slides/`、`open-slide.config.ts`。

- [ ] **Step 4: 安裝依賴**

```bash
cd /Users/yao/orca/workspaces/slides-littleyao/init
pnpm install
```

Expected: 安裝成功,產生 `pnpm-lock.yaml` 與 `node_modules/`。

- [ ] **Step 5: 驗證 dev server 可跑(背景啟動 + curl)**

```bash
pnpm dev &   # 背景執行
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/
# 驗完關掉 dev server(kill 背景 job)
```

Expected: `200`。若 port 非 5173,以 dev 輸出的實際 port 為準重驗。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold open-slide workspace

- npx @open-slide/cli init 產生 workspace,搬至 repo 根目錄
- pnpm install 完成,dev server 驗證可跑"
```

### Task 2: 跨裝置環境釘板

**Files:**
- Create: `.nvmrc`
- Modify: `package.json`(加 `engines`、`packageManager`)
- Modify/Create: `.gitignore`(確保 `node_modules/`、`dist/`)

**Interfaces:**
- Consumes: Task 1 的 workspace 與 `pnpm-lock.yaml`
- Produces: 新裝置 `git clone` + `pnpm install` 可重現環境的全部前提

- [ ] **Step 1: 建 `.nvmrc`**

```bash
echo "20" > .nvmrc
```

- [ ] **Step 2: `package.json` 加 engines 與 packageManager**

在 `package.json` 頂層加入(保留 scaffolder 既有欄位):

```json
{
  "engines": { "node": ">=20" },
  "packageManager": "pnpm@10.33.2"
}
```

- [ ] **Step 3: 確認 `.gitignore` 涵蓋 build 產物與依賴**

```bash
grep -E "node_modules|dist" .gitignore || printf "node_modules/\ndist/\n" >> .gitignore
cat .gitignore
```

Expected: 兩者皆在列。

- [ ] **Step 4: 驗證 lockfile 會進版控、config 無絕對路徑**

```bash
git check-ignore pnpm-lock.yaml && echo "FAIL: lockfile 被 ignore" || echo "OK: lockfile 會 commit"
grep -rn "/Users/" open-slide.config.ts package.json && echo "FAIL: 有絕對路徑" || echo "OK: 無絕對路徑"
```

Expected: 兩行都是 `OK`。

- [ ] **Step 5: Commit**

```bash
git add .nvmrc package.json .gitignore pnpm-lock.yaml
git commit -m "chore: 釘板跨裝置環境

- .nvmrc 釘 Node 20,package.json 加 engines 與 packageManager
- 確保 pnpm-lock.yaml 進版控、node_modules/dist 被 ignore"
```

### Task 3: 本機 build + 深連結行為實測(gate Task 6 的 vercel.json 決策)

**Files:**
- 無新檔(產出是 `dist/`,不進版控,以及一筆「深連結行為」的觀察結論)

**Interfaces:**
- Consumes: Task 1–2 的 workspace
- Produces: 結論「dist 是多頁靜態(含 `slides/<id>/` 的 html)或單頁 SPA(只有根 `index.html`)」→ Task 6 據此決定要不要加 rewrite

- [ ] **Step 1: 跑 build**

```bash
pnpm build
```

Expected: build 成功,產生 `dist/`。

- [ ] **Step 2: 檢視 dist 結構,判定深連結型態**

```bash
find dist -name "*.html" | head -20
```

Expected 兩種可能,**記下是哪一種**:
- 多個 html(如 `dist/slides/<id>/index.html`)→ 多頁靜態,深連結原生可開,Task 6 大概率**不需** rewrite
- 只有 `dist/index.html` → SPA,Task 6 大概率**需要** rewrite

- [ ] **Step 3: 本機 preview 實測首頁與深連結**

```bash
pnpm preview &
sleep 3
curl -s -o /dev/null -w "home: %{http_code}\n" http://localhost:4173/
# <id> 換成 slides/ 目錄下實際的 deck id:
curl -s -o /dev/null -w "deep: %{http_code}\n" http://localhost:4173/slides/<id>
# 驗完 kill preview
```

Expected: 記錄兩個狀態碼(preview server 行為僅供參考,**線上 Vercel 實測(Task 6)才是最終判準**)。

- [ ] **Step 4: Commit(若此 task 有任何檔案變動;通常無變動則跳過)**

**→ Checkpoint 1 收尾:** 跑 `pnpm build` + dev/preview 驗證皆綠(即上方各 step 的實跑證據);向使用者回報 dist 深連結型態的觀察結論,再進 Checkpoint 2。

---

## Checkpoint 2:上線(Tasks 4–6)

### Task 4: 建 GitHub repo、push、merge 到 main

**Files:** 無程式碼變動(純 git/GitHub 操作)

**Interfaces:**
- Produces: GitHub repo `crazysYao/slides-littleyao`,`main` 分支含完整 workspace → Task 5 的 Vercel import 對象

- [ ] **Step 1: 建 GitHub repo 並設為 remote(repo 目前無 remote)**

```bash
gh repo create crazysYao/slides-littleyao --public --source=. --remote=origin
git remote -v
```

Expected: `origin` 指向 `https://github.com/crazysYao/slides-littleyao`。
(站台本來就公開,repo 用 public;若使用者要 private,改 `--private`,不影響 Vercel。)

- [ ] **Step 2: push 工作分支並開 PR**

```bash
git push -u origin init
gh pr create --base main --head init --title "feat: open-slide workspace 初始化" --body "Scaffold workspace + 跨裝置環境釘板 + 本機 build 驗證。詳見 docs/superpowers/specs/2026-09-04-slides-hub-design.md"
```

Expected: PR 建立成功,輸出 PR URL。
註:若 remote 尚無 `main`(全新 repo 只有 push 上去的 `init`),先 `git push origin init:main` 建出 main 再開 PR;或直接以 main 為初始分支 push。以實際 remote 分支狀態為準。

- [ ] **Step 3: 【使用者確認點】merge PR 到 main**

```bash
gh pr merge --squash --delete-branch=false
git fetch origin && git log origin/main --oneline -3
```

Expected: `origin/main` 最新 commit 含 workspace。**merge 前先讓使用者過目 PR。**

### Task 5: Vercel import + 首次自動部署驗證

**Files:** 無(Vercel 平台設定)

**Interfaces:**
- Consumes: Task 4 的 `crazysYao/slides-littleyao@main`
- Produces: Vercel 專案(production 分支 = main),部署 URL `<project>.vercel.app` → Task 6/7 的驗證對象

- [ ] **Step 1: 用本 session 的 Vercel MCP 工具 import repo 建專案**

用 `mcp__claude_ai_Vercel__create_git_project` 以 repo `crazysYao/slides-littleyao` 建專案;framework 偵測不到就明確設定:
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

(MCP 不可用時 fallback:請使用者在 vercel.com dashboard「Add New → Project → Import」選該 repo,填上面三項設定。)

- [ ] **Step 2: 確認首次部署成功**

用 `mcp__claude_ai_Vercel__list_deployments` / `get_deployment` 查最新 deployment 狀態;失敗則用 `get_deployment_build_logs` 讀 log、依 systematic-debugging 找根因。

Expected: 狀態 `READY`,拿到 `https://<project>.vercel.app`。

- [ ] **Step 3: 驗證「push → 自動部署」連動**

```bash
# 對 README 或任一檔做一個 trivial 變更,push 到 main
git checkout main && git pull
git commit --allow-empty -m "chore: 驗證 Vercel git 連動自動部署"
git push origin main
```

再以 `list_deployments` 確認出現**新的** deployment 並轉為 `READY`。

Expected: push 後 1–2 分鐘內新部署 READY。

### Task 6: 線上深連結實測;404 才加 `vercel.json`

**Files:**
- 視實測結果 Create: `vercel.json`(**只在 404 時**)

**Interfaces:**
- Consumes: Task 5 的部署 URL、Task 3 的 dist 結構觀察
- Produces: 深連結可直開的線上站

- [ ] **Step 1: 實測首頁與深連結**

```bash
BASE=https://<project>.vercel.app
curl -s -o /dev/null -w "home: %{http_code}\n" $BASE/
curl -s -o /dev/null -w "deep: %{http_code}\n" $BASE/slides/<id>
```

Expected: 兩者 `200` → **跳到 Step 4,不加任何東西**。`deep` 為 `404` → 走 Step 2。

- [ ] **Step 2:(僅 404 時)加 SPA fallback rewrite**

Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

```bash
git add vercel.json
git commit -m "fix: 加 SPA fallback rewrite,修深連結 404"
git push origin main
```

- [ ] **Step 3:(僅 404 時)等新部署 READY 後重跑 Step 1**

Expected: `home: 200`、`deep: 200`。

- [ ] **Step 4: 確認首頁列出 deck**

```bash
curl -s $BASE/ | grep -io "<id>" | head -1
```

Expected: 首頁 HTML 含 deck 內容(或以瀏覽器開 `$BASE/` 目視確認 deck 清單)。

**→ Checkpoint 2 收尾:** 對「自上次審查以來的增量 diff」(Checkpoint 1 merge 後的變更,通常只有可能存在的 `vercel.json`)做一次 review;回報部署 URL 與深連結實測結果。

---

## Checkpoint 3:網域 + 文件(Tasks 7–8)

### Task 7: 綁 `slides.littleyao.me` + DNS + HTTPS 驗證

**Files:** 無(Vercel + DNS 設定)

**Interfaces:**
- Consumes: Task 5 的 Vercel 專案
- Produces: `https://slides.littleyao.me` 正式對外網址

- [ ] **Step 1: 在 Vercel 專案加自訂網域**

用 Vercel MCP(或 dashboard → Project → Settings → Domains)加 `slides.littleyao.me`。Vercel 會顯示需要的 DNS 記錄(subdomain 慣例為 CNAME → `cname.vercel-dns.com`,**以 Vercel 實際顯示值為準**)。

- [ ] **Step 2: 【使用者動作】到 littleyao.me 的 DNS 服務商加 CNAME**

記錄:`slides` → Vercel 顯示的目標值。加完回報。

- [ ] **Step 3: 驗證 DNS 生效 + HTTPS**

```bash
dig slides.littleyao.me +short
curl -sI https://slides.littleyao.me/ | head -5
```

Expected: dig 解析到 Vercel;curl 回 `HTTP/2 200`,無憑證錯誤(Vercel 自動簽發,DNS 生效後幾分鐘內完成)。

- [ ] **Step 4: 用正式網域重跑深連結驗證**

```bash
curl -s -o /dev/null -w "deep: %{http_code}\n" https://slides.littleyao.me/slides/<id>
```

Expected: `200`。

### Task 8: README(日常流程、跨裝置上手、隱私開關)

**Files:**
- Create: `README.md`(scaffolder 若已產生 README,改為 Modify、保留其原有內容於後段)

**Interfaces:**
- Consumes: Task 1–7 全部落地結果(實際 deck id、部署 URL)
- Produces: spec 驗證標準最後一條

- [ ] **Step 1: 寫 README**

```markdown
# slides.littleyao.me — 個人簡報中心

open-slide workspace。所有簡報(deck)都在這個 repo,push 即自動上線。

## 日常流程

1. `pnpm dev` — 本機開發,叫 Claude Code 生成 / 微調 deck(deck 在 `slides/<id>/index.tsx`)
2. `git add -A && git commit && git push` — 推上 main
3. Vercel 自動 build & 部署(約 1–2 分鐘)
4. 分享:複製 `https://slides.littleyao.me/slides/<id>`

## 新裝置上手(跨裝置編輯)

1. 備妥 Node 20(對齊 `.nvmrc`)+ pnpm
2. `git clone https://github.com/crazysYao/slides-littleyao && cd slides-littleyao`
3. `pnpm install`
4. `pnpm dev` 開始編輯 / 新增 deck

規則:只用 pnpm(勿混 npm/yarn);圖片 / 字型 / logo 一律落地進 repo 再引用。

## 部署

- Vercel 專案 Git 連動 `main`;Build: `pnpm build` → `dist/`(純靜態)
- 網域:`slides.littleyao.me`(DNS CNAME → Vercel)

## 隱私開關(目前公開,保留後路)

- 需登入才看:Vercel dashboard → Project → Settings → Deployment Protection(一鍵)
- 整站密碼:需 Vercel Pro 方案
```

(`<id>` 與網址以實際值代入;若 Task 6 加了 `vercel.json`,在部署段補一行說明。)

- [ ] **Step 2: Commit + push**

```bash
git add README.md
git commit -m "docs: README 記錄日常流程、跨裝置上手與隱私開關"
git push origin main
```

- [ ] **Step 3: 逐條核對 spec 驗證標準**

對 spec `docs/superpowers/specs/2026-09-04-slides-hub-design.md` 的 7 條驗證標準逐條附上實跑證據(指令 + 輸出),全綠才回報完成。其中「另一台裝置 clone 重現」一條:本機以乾淨目錄模擬(`git clone <github-url> /tmp 檢驗目錄 && pnpm install && pnpm dev` 驗 200),真實第二台裝置由使用者日後首次使用時自然驗證。

**→ Checkpoint 3 收尾 = 專案完成:** 依 verification-before-completion 附證據回報;spec 驗證標準打勾。
