// 咖啡店 Skill 章節：把 ../skill-chapter/slides 的 1920×1080 單頁 HTML（Claude Slides 格式）轉成 Synora 的 960×540 HTML。
// 原始檔用了 Slides 專用的 <x-icon>、<x-shape> 與 /_blob/ 圖片路徑，Synora 不認得，這裡換成內嵌 svg 與 data URI。
import { readFileSync } from 'node:fs';

const SANS = `'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif`;
const MONO = `ui-monospace,'SF Mono',Menlo,Consolas,monospace`;

const ICONS = {
  Users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14c2.4.3 4 2 4 4.5"/>',
  Chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  Search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  Book: '<path d="M4 4.5h6a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4.5h-4a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H20z"/>',
  Tool: '<path d="M15 4a5 5 0 0 0-4.6 6.9L4 17.3V20h2.7l6.4-6.4A5 5 0 0 0 20 9l-3 3-3-1-1-3 3-3a5 5 0 0 0-1-.9z"/>',
  CheckCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  Home: '<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
  PaperPlane: '<path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M21 3L10 13"/>',
  Code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
};

// 縮放用行內 !important：html-kit 在截圖模式與關閉動畫時會把所有 transform 關掉，這一個不能關
// Slides 執行環境給標題、段落的預設行高，以及被 html-kit 歸零的清單縮排
const BASE_CSS = `<style>.sk h2{line-height:1.15}.sk h3{line-height:1.2}.sk p,.sk li{line-height:1.4}.sk ul{padding-left:1.2em}</style>`;

export const toSynora = (html, images) => {
  const aside = html.match(/<aside>([\s\S]*?)<\/aside>/);
  const notes = aside ? aside[1].trim() : '';
  let body = html
    .replace(/<aside>[\s\S]*?<\/aside>\s*/, '')
    .replace(/<section\b[^>]*?style="([^"]*)"[^>]*>/, (_, style) => `<div class="sk" style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform:scale(.5)!important;transform-origin:0 0;${style}">`)
    .replace(/<\/section>/, '</div>')
    .replace(/<x-icon name="([^"]*)" style="([^"]*)"><\/x-icon>/g, (_, name, style) => {
      if (!ICONS[name]) throw new Error(`沒有這個圖示：${name}`);
      return `<svg viewBox="0 0 24 24" style="${style};flex:none" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
    })
    .replace(/<x-shape kind="([^"]*)" style="([^"]*)"><\/x-shape>/g, (_, kind, style) => {
      if (kind === 'ellipse') return `<span style="display:block;border-radius:50%;flex:none;${style}"></span>`;
      if (kind === 'arrow-right') {
        const size = style.replace(/background:[^;]*;?/, '');
        const color = style.match(/background:([^;]*)/)?.[1] ?? '#000';
        return `<svg viewBox="0 0 40 20" style="${size};flex:none"><path d="M0 6h24V0l16 10-16 10v-6H0z" fill="${color}"/></svg>`;
      }
      throw new Error(`沒有這個形狀：${kind}`);
    })
    .replace(/src="(\/_blob\/[^"]*)"/g, (_, path) => {
      if (!images[path]) throw new Error(`找不到圖片：${path}`);
      return `src="${images[path]}"`;
    })
    .replaceAll(`'Noto Sans TC', Arial, sans-serif`, SANS)
    .replaceAll(`'JetBrains Mono', 'Courier New', monospace`, MONO);
  return { body: BASE_CSS + body.trim(), notes };
};

const dir = new URL('../skill-chapter/', import.meta.url);
const jpeg = (name) => `data:image/jpeg;base64,${readFileSync(new URL(`assets/${name}.jpg`, dir)).toString('base64')}`;
const IMAGES = {
  '/_blob/d8298c488ba0ed90cc5d3ed81edf308c': jpeg('latte-spill'),
  '/_blob/c2eff61e0f21e193d702e403345b4efd': jpeg('latte-heart'),
};
const { order } = JSON.parse(readFileSync(new URL('deck.json', dir), 'utf8'));
const converted = order.map((name) => [name, toSynora(readFileSync(new URL(`slides/${name}.html`, dir), 'utf8'), IMAGES)]);

export const skillSlides = Object.fromEntries(converted.map(([name, r]) => [name, r.body]));
export const skillNotes = Object.fromEntries(converted.map(([name, r]) => [name, r.notes]));
export const skillLayouts = { skillSlide: (p) => ({ body: skillSlides[p.slide], natives: [] }) };
