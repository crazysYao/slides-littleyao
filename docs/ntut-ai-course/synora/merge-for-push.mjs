// 推 Synora 前合併：沒改的頁用遠端版本（保留已上傳的圖片網址），有改或新增的頁用本機 build。
// 用法：node merge-for-push.mjs <remote.json> <local.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';

const [remotePath, localPath, outPath] = process.argv.slice(2);
if (!outPath) throw new Error('用法：node merge-for-push.mjs <remote.json> <local.json> <out.json>');
const remote = JSON.parse(readFileSync(remotePath, 'utf8'));
const local = JSON.parse(readFileSync(localPath, 'utf8'));

const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
// 圖片在本機是 data URI、在遠端是已上傳網址，比對時都當成同一個佔位
const key = (s) => JSON.stringify(canon({ ...s, slideNumber: 0 })).replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g, 'IMG').replace(/https:\/\/[^"' )]+\.(jpe?g|png|webp)/g, 'IMG');

// 有改的頁：本機的圖片照出現順序換回遠端的版本（已上傳網址或原本的內嵌圖），避免推送時新增大型內嵌圖、丟掉已上傳網址
const IMG = /data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+|https:\/\/[^"' )]+\.(?:jpe?g|png|webp)/g;
const keepRemoteImages = (s, old) => {
  const olds = JSON.stringify(old).match(IMG) ?? [];
  const json = JSON.stringify(s);
  if ((json.match(IMG) ?? []).length !== olds.length) return s;
  let i = 0;
  return JSON.parse(json.replace(IMG, () => olds[i++]));
};

const byId = Object.fromEntries(remote.slides.map((s) => [s.id, s]));
const report = { unchanged: [], changed: [], added: [], removed: [] };
const slides = local.slides.map((s) => {
  const old = byId[s.id];
  if (!old) return report.added.push(s.id), s;
  if (key(old) === key(s)) return report.unchanged.push(s.id), old;
  return report.changed.push(s.id), keepRemoteImages(s, old);
});
report.removed = remote.slides.filter((s) => !local.slides.some((x) => x.id === s.id)).map((s) => s.id);
slides.forEach((s, i) => (s.slideNumber = i + 1));
writeFileSync(outPath, JSON.stringify({ ...remote, slides, sections: local.sections }));
console.log(JSON.stringify({ saveSeq: remote._saveSeq, slides: slides.length, changed: report.changed, added: report.added, removed: report.removed, unchanged: report.unchanged.length }, null, 1));
