# 簡報內建課堂互動系統 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 取代 Slido：學生在簡報畫面直接投票／搶答、跟著老師翻頁；老師(Google 登入)即時看到結果並用手機遙控。

**Architecture:** 一個 Cloudflare Worker 同時服務兩個網域：`live.littleyao.me`(公開，只開學生 WebSocket)與 `teach.littleyao.me`(Access 保護，提供老師版靜態檔＋老師 WebSocket)。每個場次是一個 Durable Object(即時房間)，另一個 Registry DO 記錄各簡報的場次。前端是共用的 `live/client`：老師版在 open-slide 播放器裡透過其內部 BroadcastChannel 取得頁碼/分步並上傳；學生版是一份只有一頁的 open-slide 簡報，用 portal 蓋滿畫面，自行渲染公開頁面並以全域 context 控制分步。學生版與老師版分開建置：公開站(Vercel)只含 `slides/`，老師版從 `teacher-slides/` 建置後部署到 Worker。

**Tech Stack:** React 18、`@open-slide/core` 1.19、Cloudflare Workers＋Durable Objects(SQLite 免費方案)＋Cloudflare Access(Google IdP)、wrangler 4.86.0(以 `npx -y wrangler@4.86.0` 執行，不進 package.json)、Node 24 內建 test runner。

**Spec:** `docs/superpowers/specs/2026-10-19-live-interaction-design.md`

## Global Constraints
- 不新增 npm 套件；只用 React 與 Web API。可改 `package.json` 的 `scripts`(不可改 dependencies)、`open-slide.config.ts`、`tsconfig.json`。
- 測試用 Node 24：`NODE24=~/.nvm/versions/node/v24.20.0/bin/node`，`$NODE24 --test 'live/**/*.test.ts'`。純邏輯檔用 `.ts`、相對 import 帶 `.ts` 副檔名、不用 enum／parameter properties(Node type stripping 限制)。
- 老師帳號只有 `a39795979@gmail.com`。
- 網域：學生 API `live.littleyao.me`；老師版 `teach.littleyao.me`；學生版網址 `https://slides.littleyao.me/<deckId>?s=<code>`。
- 公開建置(`dist/`)不得包含：老師專屬頁(Demo)內容、講稿、搶答正解。
- 學生加入：掃碼 → 輸入暱稱 → 開始；不註冊、不裝 App。
- 老師翻頁到學生畫面跟上：本機實測 < 1 秒。
- 視覺沿用北科大簡報 design token：bg `#f2f3f5`、text `#1d2129`、accent `#2f7bf6`、radius 28；qWhy `#f59e0b`、qWhyNot `#ef4444`、qBetter `#10b981`。
- Commit：Conventional Commits，英文 type、中文正文，結尾 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。

## 計畫內的代決(Claude 判斷，講者可推翻)
- 投票頁：老師翻到該頁時自動開放作答；搶答需老師按「開始」才計時。
- 投票在公布前可改選；搶答只收第一次作答。
- 計分：答對得 `round(500 + 500 × (1 − 作答毫秒 / 時限毫秒))`，範圍 500–1000；答錯 0。公布時才加進總分。
- 學生「自己翻」只能翻到老師目前頁(含)之前的公開頁，避免偷看後面題目。
- QR code：把 Project Nayuki `qrcodegen.ts`(MIT)原檔放進 `live/client/vendor/`，保留授權標頭；離線可用，不依賴外部 QR 服務。
- 老師版同步只在 open-slide **播放模式**(按 F)運作；編輯檢視不廣播。

## Review Focus
1. 從 `live.littleyao.me` 直接請求老師版靜態檔(如 `/assets/*.js`、`/ntut-three-questions`)→ 必須 404，不能把老師建置檔外洩(Task 4 測試)。
2. 學生斷線重連(同一裝置)→ 不需重輸暱稱，原作答與分數仍在(Task 2、Task 6 測試)。
3. 搶答時間到後才送達的作答、或重複作答 → 拒收，不影響分數(Task 2 測試)。
4. 學生在公布前的狀態訊息 → 不含各選項票數、不含正解(Task 2 測試)。
5. 老師停在老師專屬頁或學生版沒有的頁 → 學生畫面顯示「老師正在示範」，跟隨模式不壞(Task 7 測試)。

---

## 檔案結構
```
live/
  shared/protocol.ts          訊息與狀態型別(前後端共用)
  shared/session.ts           純函式：reduce、teacherView、studentView、score
  shared/session.test.ts
  shared/code.ts              場次代碼產生(6 碼，不含 0O1IL)
  worker/index.ts             Worker 進入點：網域/路徑路由、Access 驗證、轉給 DO
  worker/access.ts            Access JWT(RS256)驗證
  worker/access.test.ts
  worker/session-do.ts        SessionRoom DO：WebSocket hibernation、套用 reduce、廣播
  worker/registry-do.ts       Registry DO：deck → 場次清單/目前場次
  worker/routes.test.ts       路由判斷純函式測試
  worker/wrangler.jsonc
  worker/tsconfig.json
  client/store.ts             連線＋狀態 store(useSyncExternalStore)、重連
  client/steps.tsx            ControlledPage：以全域 context 渲染頁面並控制分步
  client/bridge.ts            老師端：BroadcastChannel ↔ WebSocket
  client/deck.ts              DeckPage／InteractionDef 型別與 helper
  client/LivePoll.tsx         投票頁元件(老師／學生／靜態三種呈現)
  client/LiveQuiz.tsx         搶答頁元件＋排行榜
  client/JoinBadge.tsx        QR＋代碼小卡
  client/StudentShell.tsx     學生版整頁 UI(portal)
  client/RemoteShell.tsx      手機遙控 UI(portal)
  client/vendor/qrcodegen.ts
  scripts/check-public-build.mjs  檢查公開建置不含老師內容
slides/ntut-three-questions/
  content.tsx                 公開頁面(含 id)與互動題目定義(無正解)
  index.tsx                   學生版：export default [StudentShell 頁]
teacher-slides/ntut-three-questions/index.tsx  老師版：完整頁序＋Demo＋講稿＋正解＋bridge
teacher-slides/live-remote/index.tsx           手機遙控
```

---

## Checkpoint 1：後端與權限(高風險，完成即送審)

### Task 1: 協定型別與場次代碼

**Files:**
- Create: `live/shared/protocol.ts`、`live/shared/code.ts`、`live/shared/code.test.ts`
- Modify: `tsconfig.json`(include 加 `live/**/*`、`teacher-slides/**/*`；compilerOptions 加 `"allowImportingTsExtensions": true`)

**Interfaces:**
- Produces(`protocol.ts`)：
  - `type Role = 'teacher' | 'student'`
  - `type InteractionDef = { id: string; kind: 'poll' | 'quiz'; question: string; options: string[]; seconds?: number }`(quiz 預設 20)
  - `type Interaction = InteractionDef & { status: 'idle' | 'open' | 'closed' | 'revealed'; openedAt?: number; correct?: number; answers: Record<string, { choice: number; at: number }> }`
  - `type Nav = { pageId: string; step: number; teacherOnly: boolean; title: string; note: string }`
  - `type SessionState = { sessionId: string; deckId: string; createdAt: number; nav: Nav | null; participants: Record<string, { name: string; score: number }>; interactions: Record<string, Interaction>; activeId: string | null; view: 'question' | 'leaderboard' }`
  - `type ClientMsg = { t: 'join'; pid: string; name: string } | { t: 'answer'; iid: string; choice: number } | { t: 'define'; defs: (InteractionDef & { correct?: number })[] } | { t: 'nav'; nav: Nav } | { t: 'open' | 'close' | 'reveal' | 'reset'; iid: string } | { t: 'view'; view: 'question' | 'leaderboard' } | { t: 'remote'; cmd: 'next' | 'prev' }`
  - `type ServerMsg = { t: 'state'; state: TeacherView | StudentView } | { t: 'remote'; cmd: 'next' | 'prev' } | { t: 'error'; reason: string }`
  - `TeacherView`、`StudentView` 由 Task 2 定義形狀，型別放這裡。
- Produces(`code.ts`)：`newCode(random?: () => number): string` — 6 碼，字元集 `ABCDEFGHJKMNPQRSTUVWXYZ23456789`。

- [ ] **Step 1: 寫失敗測試** `code.test.ts`：`newCode()` 長度 6、每字元在字元集內、連續 1000 次無 `0 O 1 I L`。
- [ ] **Step 2:** `$NODE24 --test live/shared/code.test.ts` → FAIL(模組不存在)。
- [ ] **Step 3:** 實作 `protocol.ts`(只有型別)與 `code.ts`；預設亂數用 `crypto.getRandomValues`。
- [ ] **Step 4:** 測試 PASS；`npx tsc --noEmit -p .` 無錯。
- [ ] **Step 5: Commit** `feat(live): 互動協定型別與場次代碼`

### Task 2: 場次狀態機(純函式)

**Files:**
- Create: `live/shared/session.ts`、`live/shared/session.test.ts`

**Interfaces:**
- Consumes: Task 1 型別。
- Produces:
  - `createSession(sessionId: string, deckId: string, now: number): SessionState`
  - `reduce(s: SessionState, msg: ClientMsg, ctx: { role: Role; pid?: string; now: number }): SessionState` — 不合法訊息原樣回傳(不丟例外)。
  - `teacherView(s): TeacherView` — `TeacherView = SessionState & { counts: Record<string, number[]>; answered: Record<string, number>; leaderboard: { name: string; score: number }[] }`(leaderboard 依分數降冪、同分依名字，取前 10)。
  - `studentView(s, pid): StudentView` — `StudentView = { nav: Nav | null(teacherOnly 時 title/note 清空); defs: Record<string, InteractionDef>(不含正解，供畫布渲染任何題目); revealed: Record<string, { counts: number[]; correct?: number }>(只含已公布的題); me: { name: string; score: number } | null; active: { def: InteractionDef; status; openedAt?: number; myChoice?: number; counts?: number[]; correct?: number } | null; view; leaderboard?: {...}[] ; myRank?: number }`；`counts`、`correct` 只有 `status === 'revealed'` 才出現；`leaderboard` 只有 `view === 'leaderboard'` 才出現。
  - `quizPoints(elapsedMs: number, limitMs: number): number`

規則(測試要釘住)：
- `join`：只限 student；名字 trim、1–20 字，空白拒收；同 pid 重複 join 只更新名字、保留分數。
- `define`：只限 teacher；新增或更新定義，不清掉既有 answers；`correct` 只存在伺服器狀態。
- `nav`：只限 teacher；只更新 `nav`。投票自動開題由 Task 9 bridge 另送 `open`，reduce 不自動開題。
- `open`：設 `status='open'`、`openedAt=now`、`activeId=iid`、`view='question'`。
- `answer`：只限已 join 的 student；`status==='open'`；quiz 時 `now - openedAt <= seconds*1000` 且未作答過；poll 可覆寫。
- `close`：`status='closed'`。`reveal`：`status='revealed'`，quiz 對每位答對者加 `quizPoints`(只加一次)。
- `reset`：清 answers、status 回 `idle`，並扣回該題已加的分數。
- `view`：只限 teacher。`remote`：reduce 不變更狀態(由 DO 轉送)。

- [ ] **Step 1: 寫失敗測試**(每條規則一個 `test`)，至少包含：
  - `join 空白名字被拒`：`reduce(s,{t:'join',pid:'p1',name:'  '},{role:'student',now:0})` 後 `participants.p1` 為 undefined。
  - `重連保留分數`：p1 得分後再 `join` 同 pid 新名字 → score 不變、name 更新。
  - `時間到後作答拒收`：quiz seconds 20、open at 0，`answer` at 20001 → `answers.p1` undefined。
  - `搶答重複作答只收第一次`、`投票可改選`。
  - `公布前學生看不到票數與正解`：`studentView` 的 `active.counts`、`active.correct` 皆 undefined；公布後有值。
  - `reveal 計分`：open at 0、答對 at 5000、seconds 20 → `quizPoints(5000,20000) === 875`，reveal 後 score 875；再 reveal 一次仍 875。
  - `reset 扣回分數`。
  - `student 不能送老師訊息`：student 送 `open` → 狀態不變。
  - `teacherOnly 頁的 nav 不洩漏講稿`：`studentView(...).nav.note === ''`。
- [ ] **Step 2:** 跑測試 → FAIL。
- [ ] **Step 3:** 實作 `session.ts`(不可變更新)。
- [ ] **Step 4:** 跑測試 → PASS。
- [ ] **Step 5: Commit** `feat(live): 場次狀態機與學生/老師視圖`

### Task 3: Access JWT 驗證

**Files:**
- Create: `live/worker/access.ts`、`live/worker/access.test.ts`

**Interfaces:**
- Produces: `verifyAccessJwt(token: string, opts: { teamDomain: string; aud: string; allowedEmail: string; now: number; fetchJwks?: (url: string) => Promise<{ keys: JsonWebKey[] }> }): Promise<{ ok: true; email: string } | { ok: false; reason: string }>`
  - JWKS 網址 `https://${teamDomain}/cdn-cgi/access/certs`；用 `crypto.subtle` 驗 RS256；檢查 `aud` 包含 opts.aud、`exp > now/1000`、`iss === https://${teamDomain}`、`email === allowedEmail`(不分大小寫)。JWKS 以模組層快取 10 分鐘。

- [ ] **Step 1: 寫失敗測試**：測試內用 `crypto.subtle.generateKey` 產 RSA 金鑰對、自簽 JWT、注入 `fetchJwks`。案例：有效 → ok；email 不同 → `reason:'email'`；過期 → `'exp'`；aud 錯 → `'aud'`；簽章被改 → `'signature'`；格式錯 → `'malformed'`。
- [ ] **Step 2:** FAIL。 **Step 3:** 實作。 **Step 4:** PASS。
- [ ] **Step 5: Commit** `feat(live): Cloudflare Access JWT 驗證`

### Task 4: Worker 路由、兩個 Durable Object、wrangler 設定

**Files:**
- Create: `live/worker/index.ts`、`live/worker/routes.ts`、`live/worker/routes.test.ts`、`live/worker/session-do.ts`、`live/worker/registry-do.ts`、`live/worker/wrangler.jsonc`、`live/worker/tsconfig.json`
- Modify: `package.json` scripts 加 `"test:live": "~/.nvm/versions/node/v24.20.0/bin/node --test 'live/**/*.test.ts'"`、`"dev:worker": "npx -y wrangler@4.86.0 dev -c live/worker/wrangler.jsonc"`

**Interfaces:**
- Consumes: Task 2 `createSession/reduce/teacherView/studentView`、Task 3 `verifyAccessJwt`、Task 1 `newCode`。
- Produces(HTTP API，前端 Task 6 使用)：
  - 公開(`live.littleyao.me`)：`GET /api/student/ws?code=XXXXXX` → WebSocket(Origin 必須是 `https://slides.littleyao.me` 或 `http://localhost:5173`)。其他任何路徑 → 404(**含靜態檔**)。
  - 老師(`teach.littleyao.me`，全部先驗 Access JWT，header `Cf-Access-Jwt-Assertion`)：
    - `POST /api/teacher/decks/:deckId/sessions` → `{ code }`(開新場次並設為目前)
    - `GET /api/teacher/decks/:deckId/current` → `{ code }`(沒有就建立)
    - `GET /api/teacher/decks/:deckId/sessions` → `{ sessions: { code: string; createdAt: number; participants: number }[] }`
    - `GET /api/teacher/ws?code=XXXXXX` → WebSocket(老師)
    - 其他路徑 → `env.ASSETS.fetch(request)`(老師版 SPA)
  - `routes.ts`：`classify(url: URL, devMode: boolean): { kind: 'student-ws' | 'teacher-api' | 'teacher-ws' | 'teacher-asset' | 'not-found' }`；host `live.*` 只允許 `student-ws`；`devMode`(localhost)下以路徑前綴 `/api/student`、其餘視為 teach。
- 開發模式：`env.DEV_TEACHER_EMAIL` 有值且 `url.hostname === 'localhost'` 才略過 JWT；production 不設此變數。
- `SessionRoom`：`ctx.acceptWebSocket(ws, [role, pid])`；狀態存 `ctx.storage.put('state', s)`；每次 reduce 後對每個 socket 送對應視圖；`remote` 訊息轉送給所有 teacher socket；`webSocketClose` 不刪參與者。
- `Registry`：單一實例 `idFromName('registry')`，存 `decks[deckId] = { current: code, sessions: [...] }`。
- `wrangler.jsonc`：`name: "slides-live"`、`main: "index.ts"`、`compatibility_date: "2026-10-01"`、`durable_objects.bindings: SESSION→SessionRoom, REGISTRY→Registry`、`migrations: [{ tag: "v1", new_sqlite_classes: ["SessionRoom","Registry"] }]`、`assets: { directory: "../../dist-teacher", binding: "ASSETS", run_worker_first: true, not_found_handling: "single-page-application" }`、`routes: [{ pattern: "live.littleyao.me", custom_domain: true }, { pattern: "teach.littleyao.me", custom_domain: true }]`、`vars: { ACCESS_TEAM_DOMAIN, ACCESS_AUD, TEACHER_EMAIL: "a39795979@gmail.com" }`(TEAM_DOMAIN、AUD 在 Task 12 填)。

- [ ] **Step 1: 寫失敗測試** `routes.test.ts`：
  - `live 網域取靜態檔為 not-found`：`classify(new URL('https://live.littleyao.me/assets/index.js'), false).kind === 'not-found'`；`/ntut-three-questions`、`/` 亦同。
  - `live 網域學生 ws`：`/api/student/ws?code=AAAAAA` → `student-ws`。
  - `teach 網域`：`/api/teacher/ws` → `teacher-ws`；`/api/teacher/decks/x/current` → `teacher-api`；`/foo` → `teacher-asset`。
  - `未知網域`：`https://evil.example/api/student/ws` → `not-found`。
- [ ] **Step 2:** FAIL。 **Step 3:** 實作 routes、DO、index；`npx -y wrangler@4.86.0 types -c live/worker/wrangler.jsonc` 產生型別到 `live/worker/worker-configuration.d.ts`(commit)。
- [ ] **Step 4:** `pnpm test:live` 全 PASS；`npx tsc --noEmit -p live/worker` 無錯。
- [ ] **Step 5: 本機整合驗證**：先 `mkdir -p dist-teacher && echo ok > dist-teacher/index.html`，`DEV_TEACHER_EMAIL=a39795979@gmail.com pnpm dev:worker`(port 8787)，寫 `live/scripts/smoke.mjs`(Node 24 內建 WebSocket)：老師 `GET /api/teacher/decks/demo/current` 取 code → 老師 ws `define` 一題 quiz(correct 1)＋`open` → 學生 ws `join`＋`answer` 1 → 老師 `reveal` → 斷言學生收到 `counts` 與 `correct:1`、分數 ≥ 500；學生斷線重連同 pid 後 `me.score` 不變。Expected：腳本印 `SMOKE OK`。
- [ ] **Step 6: Commit** `feat(live): Worker 路由與場次 Durable Object`(`dist-teacher/` 加入 `.gitignore`)

> **Checkpoint 1 收尾**：跑 `pnpm test:live`＋smoke 留證據；送一隻 reviewer(Opus，高風險：權限與資料外洩)只看 CP1 diff，分「spec 符合度」「code quality」兩段。

---

## Checkpoint 2：前端共用元件

### Task 5: 分步控制與 Deck 型別

**Files:**
- Create: `live/client/deck.ts`、`live/client/steps.tsx`

**Interfaces:**
- Produces(`deck.ts`)：
  - `type DeckPage = { id: string; Page: ComponentType; teacherOnly?: boolean; interaction?: string }`
  - `type LiveDeck = { deckId: string; pages: DeckPage[]; interactions: InteractionDef[] }`
  - `publicPages(pages: DeckPage[]): DeckPage[]`；`followTarget(pub: DeckPage[], nav: Nav | null): { index: number; step: number } | 'teacher-only' | null`(nav.pageId 不在公開清單 → `'teacher-only'`)；`maxSelfIndex(pub, nav): number`(老師目前頁在公開清單的位置；teacher-only 時取老師前一個公開頁)。
- Produces(`steps.tsx`)：`ControlledPage({ page, index, total, revealed }: { page: ComponentType; index: number; total: number; revealed: number }): JSX.Element` — 取 `globalThis.__open_slide_page_context__` 與 `globalThis.__open_slide_step_host_context__` 兩個 Context 物件提供值；step host 為 controlled 模式：`controlled: true`、`isActivePage: true`、`entryDirection: 'forward'`，`register` 時依掛載順序把 `revealed` 分配給各 `<Steps>`(同 open-slide `StepHost.distributeControlled` 邏輯)，`revealed` 變動時重新分配。

- [ ] **Step 1: 寫失敗測試** `live/client/deck.test.ts`：`followTarget` 對公開頁回 index/step、對 Demo 頁回 `'teacher-only'`、nav null 回 null；`maxSelfIndex` 在 teacher-only 時回前一個公開頁 index。
- [ ] **Step 2:** FAIL。 **Step 3:** 實作 `deck.ts`、`steps.tsx`。 **Step 4:** PASS。
- [ ] **Step 5: Commit** `feat(live): 頁面型別與受控分步渲染`

### Task 6: 連線 store

**Files:**
- Create: `live/client/store.ts`、`live/client/store.test.ts`

**Interfaces:**
- Produces:
  - `createLiveStore(opts: { url: string; role: Role; pid?: string; name?: string; WebSocketImpl?: typeof WebSocket; onRemote?: (cmd: 'next' | 'prev') => void }): LiveStore`
  - `LiveStore = { subscribe(fn): () => void; getState(): { connected: boolean; view: TeacherView | StudentView | null }; send(msg: ClientMsg): void; close(): void }`
  - 重連：斷線後 1s、2s、4s… 上限 10s；重連成功後 student 自動重送 `join`(同 pid/name)，teacher 由呼叫端在 `onOpen` 重送 `define`(opts 加 `onOpen?: () => void`)。
  - `useLiveStore(store: LiveStore | null)`：React hook(useSyncExternalStore)。
  - `studentIdentity(code: string): { pid: string; name: string | null }` 與 `saveName(code, name)`：localStorage key `live:${code}`，pid 用 `crypto.randomUUID()`；localStorage 拋錯時退回記憶體。
- 模組層 `currentStore: LiveStore | null` 與 `setCurrentStore(store)`、`useCurrentLive()`：給 LivePoll/LiveQuiz 取得當前 store(老師或學生)。

- [ ] **Step 1: 寫失敗測試**(假 WebSocket 類別)：斷線後依序以 1000/2000ms 重連(注入假計時器 `setTimeoutImpl`)、重連後 student 重送 join、`send` 在未連線時排隊、連上後送出。
- [ ] **Step 2–4:** FAIL → 實作 → PASS。
- [ ] **Step 5: Commit** `feat(live): WebSocket store 與自動重連`

### Task 7: 投票、搶答、加入卡元件

**Files:**
- Create: `live/client/LivePoll.tsx`、`live/client/LiveQuiz.tsx`、`live/client/JoinBadge.tsx`、`live/client/vendor/qrcodegen.ts`、`live/client/theme.ts`

**Interfaces:**
- Consumes: `useCurrentLive()`、`InteractionDef`。
- Produces:
  - `<LivePoll id: string />`、`<LiveQuiz id: string />`：在 1920×1080 畫布上呈現。依 `useCurrentLive()`：
    - 老師 view：題目、選項長條(即時票數與比例)、「已作答 N / 加入 M」、quiz 倒數(由 `openedAt`＋`seconds` 算，requestAnimationFrame 更新)；`revealed` 時正解綠框打勾；`view==='leaderboard'` 時整頁換排行榜(前 10，名次、暱稱、分數)。右下角 `<JoinBadge />`。
    - 學生 view：只顯示題目與選項(不顯示票數)；`revealed` 時顯示比例與正解。作答按鈕不在畫布上(在 StudentShell 面板)。
    - 無 store(縮圖、公開站以外的靜態預覽)：題目＋選項靜態卡片。
    - 題目資料來源：老師用 `view.interactions[id]`、學生用 `view.defs[id]` 與 `view.revealed[id]`；無 store 時從 props `def?: InteractionDef` 取(content.tsx 傳入)。
  - `<JoinBadge />`：QR(`qrcodegen` 產 SVG path)＋網址 `slides.littleyao.me/<deckId>`＋大字代碼；`studentUrl(deckId, code) = https://slides.littleyao.me/${deckId}?s=${code}`(export 供 StudentShell 與 Remote 使用)。
  - `theme.ts`：export 上方 Global Constraints 的色票常數，元件共用。
- `qrcodegen.ts`：Project Nayuki TypeScript 版原檔(MIT)，檔頭保留授權；只 export 用到的 `QrCode.encodeText`。

- [ ] **Step 1:** 新增 `live/client/LivePoll.preview` 用的暫時頁：在 `slides/live-playground/index.tsx` 放三頁(投票、搶答、加入卡)，以假 store(`createLiveStore` 搭假 WebSocket 餵 TeacherView)顯示老師視圖。
- [ ] **Step 2:** `pnpm dev` 開 `http://localhost:5173/s/live-playground`，用 scratchpad 的 playwright 截圖三頁，確認：長條比例正確、倒數遞減、正解標示、排行榜排序；QR 請講者用手機實掃一次確認可開啟。
- [ ] **Step 3: Commit** `feat(live): 投票、搶答與加入卡元件`(playground 留著到 Task 11 刪除)

### Task 8: 學生版 Shell

**Files:**
- Create: `live/client/StudentShell.tsx`

**Interfaces:**
- Consumes: Task 5 `ControlledPage/followTarget/maxSelfIndex/publicPages`、Task 6 store、Task 7 元件與 `studentUrl`。
- Produces: `makeStudentDeck(deck: LiveDeck): Page[]` — 回傳只有一頁的陣列；該頁以 `createPortal` 掛到 `document.body` 一個 `position:fixed; inset:0; z-index:2147483000` 的容器，蓋過 open-slide 介面。
- `liveApiBase(): string`：`location.hostname === 'localhost'` → `http://localhost:8787`，否則 `https://live.littleyao.me`；學生 ws 為 `${liveApiBase().replace(/^http/, 'ws')}/api/student/ws?code=`。
- 行為：
  - 讀 `?s=`；沒有 → 顯示「請掃描老師畫面上的 QR code」。
  - 首次：暱稱輸入(1–20 字)＋「加入」；之後直接進入。
  - 頂列：暱稱、連線燈、切換「跟隨老師 / 自己翻」。
  - 投影片區：`ControlledPage` 等比縮放到容器寬；跟隨模式顯示 `followTarget` 的頁與 step；自己翻模式顯示本地 index(全部分步展開，若該頁是老師目前頁則用老師 step)、上一頁/下一頁(上限 `maxSelfIndex`)、「回到老師目前頁」按鈕。
  - `'teacher-only'` → 顯示「老師正在示範」卡片。
  - 作答面板(有 `active` 時)：選項大按鈕、已選高亮、quiz 倒數、狀態文字(已送出／等待公布／時間到)；`revealed` 顯示比例與正解、自己對錯與得分；`view==='leaderboard'` 顯示前 10 與「你的名次」。
  - 版面：寬 ≥ 900px 左右排(投影片 2/3、面板 1/3)；窄螢幕上下排，按鈕最小高度 56px。
- 測試：E2E 在 Task 11。

- [ ] **Step 1:** 實作；在 `slides/live-playground` 加一份學生 deck 以假 store 驗證版面(手機 390×844、桌機 1440×900 截圖)。
- [ ] **Step 2: Commit** `feat(live): 學生版畫面`

### Task 9: 老師 bridge 與手機遙控

**Files:**
- Create: `live/client/bridge.ts`、`live/client/bridge.test.ts`、`live/client/RemoteShell.tsx`

**Interfaces:**
- Produces(`bridge.ts`)：`startTeacherBridge(opts: { deck: LiveDeck; answers: Record<string, number>; notes: (string | undefined)[]; apiBase: string }): LiveStore` — 模組層只啟動一次(重複呼叫回同一個)：
  - `GET ${apiBase}/api/teacher/decks/${deckId}/current` 取 code → `createLiveStore(role 'teacher')`，`onOpen` 送 `define`(defs＋answers 合併成 `correct`)。
  - 開 `new BroadcastChannel('open-slide:presenter:' + deckId)`，送 `{type:'request-state'}`；收到 `{type:'state', state}` 時：`page = deck.pages[state.index]`，送 `nav`(`pageId`、`step: state.stepIndex`、`teacherOnly`、`title`(頁 id 對應標題，用 `page.id`)、`note: notes[state.index] ?? ''`)；若 `page.interaction` 對應 poll 且狀態 `idle` → 再送 `open`。
  - `onRemote(cmd)` → `channel.postMessage({ type: cmd })`。
  - `setCurrentStore(store)`。
  - 純函式 `navFromPresenter(deck, notes, state): Nav` 抽出來測。
- Produces(`RemoteShell.tsx`)：`makeRemoteDeck(opts: { apiBase: string; decks: string[] }): Page[]`(portal 全螢幕)：選簡報(只有一份時自動選)→ 連老師 ws → 顯示目前頁 id/頁碼、講稿(大字可捲動)、按鈕：上一步、下一步(送 `remote`)、開始作答(`open` 當前頁 interaction)、結束(`close`)、公布(`reveal`)、排行榜切換(`view`)、重設本題(`reset`，需二次確認的 inline 按鈕，不用 `confirm()`)、開新場次(POST sessions，inline 二次確認)、場次清單(GET sessions，點選後唯讀顯示各題票數)。

- [ ] **Step 1: 寫失敗測試** `bridge.test.ts`：`navFromPresenter` 對 Demo 頁回 `teacherOnly:true`、note 取對應索引、step 取 `stepIndex`。
- [ ] **Step 2–4:** FAIL → 實作 → PASS。
- [ ] **Step 5: Commit** `feat(live): 老師 bridge 與手機遙控`

> **Checkpoint 2 收尾**：`pnpm test:live`、`npx tsc --noEmit -p .`、`pnpm build` 通過；一隻 reviewer(Sonnet)看 CP2 diff。

---

## Checkpoint 3：北科大簡報遷移與分開建置

### Task 10: 拆成公開內容／學生版／老師版，分開建置

**Files:**
- Create: `slides/ntut-three-questions/content.tsx`、`teacher-slides/ntut-three-questions/index.tsx`、`teacher-slides/live-remote/index.tsx`、`live/scripts/check-public-build.mjs`
- Modify: `slides/ntut-three-questions/index.tsx`(改為 `export default makeStudentDeck(deck)`)、`open-slide.config.ts`(`slidesDir: process.env.OPEN_SLIDE_SLIDES_DIR ?? 'slides'`)、`package.json` scripts、`.gitignore`(`dist-teacher/`)

**Interfaces:**
- `content.tsx` export `deck: LiveDeck`(deckId `'ntut-three-questions'`)：現有 36 頁去掉 Demo 後的 35 頁，每頁給 kebab-case `id`(如 `cover`、`s1-poll-hands`)；互動頁改用 `<LivePoll id=…/>`／`<LiveQuiz id=…/>` 並設 `interaction`；`SlidoWall` 與相關程式整段刪除。互動定義(題目、選項)取自 `docs/ntut-ai-course/lesson-plan.md`：
  - 第 4 頁拆成兩頁：`s1-poll-hands`(上課時，你有過有問題卻沒舉手的經驗嗎？ 有/沒有/常常)、`s1-poll-start`(學一個新技能，你通常怎麼開始？ 找線上課從頭看/先動手做/問人/問 AI)
  - `s1-poll-better`(哪個問法比較好？ A/B 原文)
  - `s2-quiz-warmup-1..4`、`s2-quiz-review-1..5`：每題一頁(搶答 9 題各一頁)，題目選項依 lesson-plan「搶答題目」
  - `s3-poll-repeat`(重複問 AI 幾次)、`s3-poll-best`(哪一組的攻防最精彩？ 第 1–4 組)、`s3-poll-exit`(今天你最記得哪一問？三問)
- `teacher-slides/ntut-three-questions/index.tsx`：`import { deck } from '../../slides/ntut-three-questions/content.tsx'`；把 Demo 頁(`id:'demo'`, `teacherOnly:true`)插回原位置(`s2-mcp-agent` 之後)；`export default fullPages.map(p => p.Page)`；`export const notes`(每頁 1–3 行，取自 lesson-plan 各段講稿重點；無講稿的頁為 undefined)；`export const meta` 沿用；模組層呼叫 `startTeacherBridge({ deck: {...deck, pages: fullPages}, answers, notes, apiBase: location.origin })`，`answers` 為 9 題搶答正解(依 lesson-plan ✓)。
- `teacher-slides/live-remote/index.tsx`：`export default makeRemoteDeck({ apiBase: location.origin, decks: ['ntut-three-questions'] })`。
- scripts：`"dev:teacher": "OPEN_SLIDE_SLIDES_DIR=teacher-slides open-slide dev --port 5174"`、`"build:teacher": "OPEN_SLIDE_SLIDES_DIR=teacher-slides open-slide build --out-dir dist-teacher"`、`"check:public": "node live/scripts/check-public-build.mjs dist"`。
- `check-public-build.mjs`：掃 `dist/**/*.{js,html}`；標記字串從 `teacher-slides/ntut-three-questions/index.tsx` 的 `export const LEAK_MARKERS = [...]`(Demo 頁標題原文、每則講稿前 12 字、`'startTeacherBridge'`、`'__TEACHER_ANSWERS__'`)以 regex 讀出；任一出現就列出並 exit 1。正解物件命名為 `__TEACHER_ANSWERS__`。
- 本次遷移刪除 `slides/live-playground/`。

- [ ] **Step 1:** 先寫 `check-public-build.mjs`，在**目前**建置(仍含 Demo)上跑 → 預期 FAIL(證明腳本抓得到)。
- [ ] **Step 2:** 完成拆分與 config/scripts。
- [ ] **Step 3:** `pnpm build && pnpm check:public` → PASS；`pnpm build:teacher` 成功且 `dist-teacher` 內 grep 得到 `Demo：這堂課是怎麼備出來的`。
- [ ] **Step 4:** `npx tsc --noEmit -p .`、`pnpm test:live` 通過。
- [ ] **Step 5: Commit** `feat: 北科大簡報改用內建互動，學生版與老師版分開建置`

### Task 11: 本機端到端驗證

**Files:**
- Create: `live/scripts/e2e.mjs`(playwright 由 scratchpad 的 `pw/node_modules/playwright` 匯入，不進 repo 依賴；路徑以環境變數 `PLAYWRIGHT_PATH` 傳入)

- [ ] **Step 1:** 啟動：`pnpm build:teacher`、`DEV_TEACHER_EMAIL=a39795979@gmail.com pnpm dev:worker`、`pnpm dev`(學生 5173)；store 的 api 網址在 localhost 時指向 `http://localhost:8787`(學生端依 `location.hostname` 判斷)。
- [ ] **Step 2:** e2e 腳本：老師頁 `http://localhost:8787/ntut-three-questions` 按 F 進播放；開 3 個學生 context(2 個 390×844、1 個 1440×900)以 `?s=<code>` 加入、各自暱稱。斷言：
  - 老師按 → 翻到 `s1-poll-hands`，學生畫面 1 秒內顯示同頁、作答面板出現(投票自動開放)。
  - 學生作答後老師畫面票數更新；學生端公布前看不到比例。
  - 經 remote 頁(`/live-remote`)按「公布」→ 學生看到比例。
  - 翻到 `s1-vote-analysis`(有 `<Steps>`)：老師按一次 → 學生分步跟著出現；老師未按前學生看不到。
  - 搶答：remote 按開始 → 學生作答 → 時間到 → 公布 → 排行榜，學生看到自己名次。
  - 翻到 Demo → 學生顯示「老師正在示範」。
  - 學生切「自己翻」→ 無法翻超過老師目前頁；按「回到老師目前頁」恢復。
  - 中斷一個學生 context 網路 3 秒(`context.setOffline`)再恢復 → 不需重輸暱稱、作答仍在。
- [ ] **Step 3:** 輸出各關鍵畫面截圖到 scratchpad，交給講者看。
- [ ] **Step 4: Commit** `test(live): 本機端到端驗證腳本`

> **Checkpoint 3 收尾**：e2e 通過＋截圖；reviewer(Sonnet)看 CP3 diff；請講者在本機實際看一次再進 CP4。

---

## Checkpoint 4：上線(需講者動手的步驟)

### Task 12: Cloudflare 與 Google 設定

講者動手(計畫執行到此時，給講者逐步指引並等待)：
1. Cloudflare API token(自訂 token)：權限 Account › Workers Scripts:Edit、Account › Access: Apps and Policies:Edit、Account › Access: Organizations, Identity Providers, and Groups:Edit、Zone(littleyao.me) › DNS:Edit、Zone › Workers Routes:Edit；存 `~/.secrets/cf_live_token`。
2. Google Cloud Console 建 OAuth 用戶端(網頁應用程式)，授權重新導向 URI：`https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`；把 Client ID / Secret 存 `~/.secrets/google_oauth_live.json`(不貼進對話)。

建置者：
- [ ] **Step 1:** 用 token 透過 Cloudflare API：建立/確認 Zero Trust team(取得 team domain)、新增 Google IdP(讀 secrets 檔)、建 Access self-hosted app `teach.littleyao.me`(policy：email 等於 `a39795979@gmail.com`，session 24h)，取得 AUD tag。
- [ ] **Step 2:** 填 `wrangler.jsonc` 的 `ACCESS_TEAM_DOMAIN`、`ACCESS_AUD`；`pnpm build:teacher`；`CLOUDFLARE_API_TOKEN=$(cat ~/.secrets/cf_live_token) npx -y wrangler@4.86.0 deploy -c live/worker/wrangler.jsonc`。
- [ ] **Step 3: 驗證**(curl)：
  - `curl -sI https://live.littleyao.me/` → 404；`https://live.littleyao.me/assets/` 任一檔 → 404。
  - `curl -sI https://teach.littleyao.me/` → 302 到 Access 登入。
  - 講者用 Google 登入 `teach.littleyao.me/ntut-three-questions` 成功；用別的帳號登入被拒(請講者試一次)。
- [ ] **Step 4: Commit** `chore(live): 部署設定`

### Task 13: 文件與規則更新、正式環境彩排

**Files:**
- Modify: `CLAUDE.md`、`AGENTS.md`(規則：互動共用碼在 `live/`、老師專屬簡報在 `teacher-slides/`；仍不可加 npm 套件；老師專屬內容不可放 `slides/`)、`docs/ntut-ai-course/lesson-plan.md`(課前準備改為：開新場次、老師筆電開 teach 網址按 F、手機開 `/live-remote`；Slido 列為備援並保留各活動代碼)、`docs/ntut-ai-course/README.md`(互動一行)

- [ ] **Step 1:** 更新文件。
- [ ] **Step 2:** 合併前檢查：`pnpm build && pnpm check:public` PASS(Vercel 會建這份)。
- [ ] **Step 3:** 正式環境彩排：講者筆電＋手機、我用 playwright 開 3 個學生(正式網址)跑 Task 11 同一套斷言(`e2e.mjs` 以環境變數切換網址；老師頁需講者手動登入後操作，腳本只驅動學生端並斷言)。
- [ ] **Step 4: Commit** `docs: 互動系統規則與教案操作更新`；之後依講者指示 push / 開 PR。

> **Checkpoint 4 收尾**：最終總體 review(Opus)只看自 CP3 以來增量；回報部署網址、彩排結果、決策紀錄。
