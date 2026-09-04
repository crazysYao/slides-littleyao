# slides.littleyao.me — 個人簡報中心

open-slide workspace。所有簡報(deck)都在這個 repo,push 即自動上線。

## 日常流程

1. `pnpm dev` — 本機開發,叫 Claude Code 生成 / 微調 deck(deck 在 `slides/<id>/index.tsx`)
2. `git add -A && git commit && git push` — 推上 main
3. Vercel 自動 build & 部署(約 1–2 分鐘)
4. 分享:複製 `https://slides.littleyao.me/<deck-id>`(例:https://slides.littleyao.me/getting-started)

## 新裝置上手(跨裝置編輯)

1. 備妥 Node 20(對齊 `.nvmrc`)+ pnpm
2. `git clone https://github.com/crazysYao/slides-littleyao && cd slides-littleyao`
3. `pnpm install`
4. `pnpm dev` 開始編輯 / 新增 deck

規則:只用 pnpm(勿混 npm/yarn);圖片 / 字型 / logo 一律落地進 repo 再引用。

## 部署

- Vercel 專案 Git 連動 `main`;Build: `pnpm build` → `dist/`(純靜態)
- SPA 深連結由 scaffold 內建的 `vercel.json` rewrite 支援
- 網域:`slides.littleyao.me`(Cloudflare DNS CNAME → Vercel,DNS only 不走 proxy)

## 隱私開關(目前公開,保留後路)

- 需登入才看:Vercel dashboard → Project → Settings → Deployment Protection(一鍵)
- 整站密碼:需 Vercel Pro 方案

## open-slide framework 說明

# open-slide workspace

Slides as React components. Each slide lives under `slides/<id>/index.tsx` and default-exports an array of page components. The `@open-slide/core` runtime handles layout, scaling, navigation, thumbnails, and fullscreen play mode — you just write the pages.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the dev server and edit `slides/getting-started/index.tsx`, or create a new slide at `slides/<your-slide>/index.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with hot reload. |
| `pnpm build` | Build a static bundle you can deploy. |
| `pnpm preview` | Preview the built bundle locally. |

## Authoring a slide

```tsx
// slides/my-slide/index.tsx
import type { Page, SlideMeta } from '@open-slide/core';

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%' }}>Hello</div>
);

export const meta: SlideMeta = { title: 'My slide' };
export default [Cover] satisfies Page[];
```

Every page renders into a fixed **1920 × 1080** canvas — design with absolute pixel values. Put images, videos, and fonts under `slides/<id>/assets/` and import them directly.

See [`CLAUDE.md`](./CLAUDE.md) for the full authoring guide.

## Navigation

- Arrow keys / PageUp / PageDown move between pages.
- `F` enters fullscreen play mode; Esc exits.
- In play mode: Space / → next, ← prev.

## Claude Code integration

This workspace ships with Claude Code skills preconfigured under `.claude/skills/` and `.agents/skills/`. Ask Claude Code to "make slides about X" and the `create-slide` skill takes over. Use `apply-comments` to iterate via inspector-style markers inside your source.

## Config

Optional `open-slide.config.ts` at the workspace root:

```ts
import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  port: 5173,
};

export default openSlideConfig;
```

Supported fields: `slidesDir`, `port`.
