// 檢查公開建置不含老師專屬內容：Demo 頁、講稿、老師端程式
// 用法：node live/scripts/check-public-build.mjs dist
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const teacherDir = 'teacher-slides';

const literals = (src) => [...src.matchAll(/'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2]);

const markers = new Set();
for (const deck of readdirSync(teacherDir)) {
  const file = join(teacherDir, deck, 'index.tsx');
  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const leak = src.match(/export const LEAK_MARKERS = \[([\s\S]*?)\];/);
  if (leak) for (const s of literals(leak[1])) markers.add(s);
  // 講稿：只取含中文的值(鍵是英文頁 id，公開建置本來就有)
  const notes = src.match(/export const NOTES[^=]*= \{([\s\S]*?)\n\};/);
  if (notes) for (const s of literals(notes[1])) if (/[\u4e00-\u9fff]/.test(s)) markers.add(s.slice(0, 12));
}
if (!markers.size) {
  console.error('找不到任何 LEAK_MARKERS，檢查失效');
  process.exit(1);
}

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|html|css)$/.test(name)) files.push(p);
  }
};
walk(dist);

const hits = [];
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const m of markers) if (text.includes(m)) hits.push(`${f}: ${m}`);
}
if (hits.length) {
  console.error(`公開建置含有老師專屬內容(${hits.length} 處)：\n${hits.join('\n')}`);
  process.exit(1);
}
console.log(`PUBLIC BUILD OK：${files.length} 個檔案、${markers.size} 個標記都沒出現`);
