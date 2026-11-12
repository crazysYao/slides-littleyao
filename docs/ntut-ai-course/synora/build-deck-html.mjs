// 產生求職網站簡報的 Synora deck.json：每頁一塊滿版 HTML 底圖（靜態內容＋動畫），互動元件用原生疊上。
// 用法：node build-deck-html.mjs <輸出路徑> [內容檔，預設 ./job-site-content.mjs] [--only=id,id]
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { pageHtml } from './html-kit.mjs';
import { layouts as defaultLayouts } from './html-layouts.mjs';
import { makeNative } from './native.mjs';

const DARK = new Set(['break', 'qa', 'darkQuestion']);

// 搶答組每題展開成一頁，講稿附正解（同 build-deck.mjs）
const expand = (p) =>
  p.layout !== 'quizSet'
    ? [p]
    : p.items.map(([question, options, correct], i) => ({
        id: `${p.id}-${i + 1}`,
        layout: 'quiz',
        section: p.section,
        title: `${p.label} ${i + 1}/${p.items.length}`,
        notes: `${i === 0 ? `${p.firstNote} ` : ''}正解：${options[correct]}`,
        question,
        options,
        correct,
      }));

export const buildDeck = ({ pages, brand, palette = {} }, { only, layouts = defaultLayouts } = {}) => {
  const all = pages.flatMap(expand);
  const chosen = only ? all.filter((p) => only.includes(p.id)) : all;
  const slides = chosen.map((p, i) => {
    const layout = layouts[p.layout];
    if (!layout) throw new Error(`${p.id}：沒有版型 ${p.layout}`);
    const special = palette.bgFor?.[p.layout] ?? (DARK.has(p.layout) ? palette.dark : undefined);
    const background = special ?? palette.bg;
    const { body, natives = [], loop = false } = layout(p, { palette, n: makeNative(p.id, palette.accent) });
    const html = pageHtml({ brand, section: p.section, palette, body, loop, background: special });
    return {
      id: p.id,
      slideNumber: i + 1,
      title: p.title,
      description: '',
      background,
      notes: p.notes,
      elements: [{ id: `${p.id}-bg`, type: 'html', x: 0, y: 0, width: 960, height: 540, html }, ...natives],
    };
  });
  return { sections: [], slides };
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');
  const [out, contentFile = './job-site-content.mjs'] = args.filter((a) => !a.startsWith('--'));
  if (!out) throw new Error('用法：node build-deck-html.mjs <輸出路徑> [內容檔] [--only=id,id]');
  const content = await import(pathToFileURL(contentFile).href);
  const deck = buildDeck(content, { only });
  writeFileSync(out, `${JSON.stringify(deck, null, 2)}\n`);
  console.log(`${deck.slides.length} 頁 → ${out}`);
}
