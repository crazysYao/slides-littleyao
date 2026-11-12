// 檢查 build-deck.mjs 產出的 deck.json：作品牆連結、元素不出界、每頁有講稿；--sections 檢查三節總長。
// 用法：node check-deck.mjs <deck.json> [--sections] [--expect-pages=N]
import { readFileSync } from 'node:fs';

const [file, ...flags] = process.argv.slice(2);
const { slides } = JSON.parse(readFileSync(file, 'utf8'));
const errors = [];
if (!slides?.length) errors.push('沒有任何頁面');
const expect = flags.find((f) => f.startsWith('--expect-pages='));
if (expect && slides.length !== Number(expect.split('=')[1])) errors.push(`頁數 ${slides.length}，應為 ${expect.split('=')[1]}`);

const homeworkIds = new Set(slides.flatMap((s) => s.elements.filter((e) => e.type === 'homework').map((e) => e.id)));
for (const s of slides) {
  if (!s.notes) errors.push(`${s.id}：沒有講稿`);
  for (const e of s.elements) {
    if (e.type === 'showcase' && !homeworkIds.has(e.linkedHomeworkId)) errors.push(`${s.id}：showcase 連到不存在的 homework ${e.linkedHomeworkId}`);
    if (e.x < 0 || e.y < 0 || e.x + e.width > 960 || e.y + e.height > 540) errors.push(`${s.id}：${e.id} 超出畫面`);
  }
}

if (flags.includes('--sections')) {
  // 講稿開頭「HH:MM 名稱(分)」；依開始時間分到三節
  const ranges = [['09:00', '09:50', 50], ['10:00', '10:55', 55], ['11:05', '12:00', 55]];
  const sums = [0, 0, 0];
  for (const s of slides) {
    const m = s.notes?.match(/^(\d\d:\d\d) [^(（]*[(（](\d+)[)）]/);
    if (!m) continue;
    const i = ranges.findIndex(([a, b]) => m[1] >= a && m[1] < b);
    if (i >= 0) sums[i] += Number(m[2]);
  }
  ranges.forEach(([a, , want], i) => sums[i] !== want && errors.push(`${a} 起的一節加總 ${sums[i]} 分，應為 ${want}`));
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK：${slides.length} 頁`);
