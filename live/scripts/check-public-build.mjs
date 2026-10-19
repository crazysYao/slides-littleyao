// 檢查公開建置不含老師專屬內容：Demo 頁、講稿、老師端程式
// 用法：node live/scripts/check-public-build.mjs dist
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const teacherDir = 'teacher-slides';

const literals = (src) => [...src.matchAll(/'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2]);

const markers = new Set();
const answerPatterns = [];
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
  if (notes) {
    for (const s of literals(notes[1])) if (/[\u4e00-\u9fff]/.test(s)) markers.add(s.slice(0, 12));
  } else if (src.includes('export const NOTES')) {
    console.error(`${file}: 有 NOTES 但解析不到內容，檢查失效`);
    process.exit(1);
  }
  // 正解物件：'題目 id': 數字；公開建置出現兩組以上就算外洩
  const answers = src.match(/__TEACHER_ANSWERS__[^=]*= \{([\s\S]*?)\n\};/);
  if (answers)
    for (const m of answers[1].matchAll(/'([^']+)':\s*(\d+)/g))
      answerPatterns.push(new RegExp(`["']?${m[1].replace(/[-]/g, '\\-')}["']?\\s*:\\s*${m[2]}\\b`));
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
    else if (!/\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|mp4|webm|pdf)$/i.test(name)) files.push(p);
  }
};
walk(dist);

const hits = [];
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const m of markers) if (text.includes(m)) hits.push(`${f}: ${m}`);
  const answerHits = answerPatterns.filter((re) => re.test(text));
  if (answerHits.length >= 2) hits.push(`${f}: 搶答正解物件(${answerHits.length} 題)`);
}
if (hits.length) {
  console.error(`公開建置含有老師專屬內容(${hits.length} 處)：\n${hits.join('\n')}`);
  process.exit(1);
}
console.log(`PUBLIC BUILD OK：${files.length} 個檔案、${markers.size} 個標記、${answerPatterns.length} 題正解都沒出現`);
