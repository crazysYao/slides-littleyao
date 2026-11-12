import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSynora, skillSlides, skillNotes, skillLayouts } from './html-skill.mjs';

test('toSynora：拿掉 Slides 專用標籤與路徑', () => {
  for (const [name, body] of Object.entries(skillSlides)) {
    assert.doesNotMatch(body, /<x-icon|<x-shape|<section|<aside|\/_blob\//, name);
    assert.doesNotMatch(body, /https?:\/\//, name);
    assert.match(body, /width:1920px;height:1080px/, name);
    assert.match(body, /scale\(\.5\)/, name);
  }
});

test('縮放在截圖模式也不會被關掉', () => {
  // html-kit 的 .cap * 與 prefers-reduced-motion 會設 transform:none!important，行內 !important 才壓得過
  for (const [name, body] of Object.entries(skillSlides)) assert.match(body, /transform:scale\(\.5\)!important/, name);
});

test('七頁都在，順序照 deck.json', () => {
  assert.deepEqual(Object.keys(skillSlides), ['s1-what', 's2-compare', 's2-compare-b', 's3-folder', 's4-skillmd', 's5-flow', 's6-uses']);
});

test('兩張照片內嵌成 JPEG', () => {
  assert.match(skillSlides['s2-compare'], /src="data:image\/jpeg;base64,/);
  assert.match(skillSlides['s2-compare-b'], /src="data:image\/jpeg;base64,/);
});

test('圖示換成 svg，數量不變', () => {
  assert.equal((skillSlides['s5-flow'].match(/<svg/g) ?? []).length, 11); // 6 個圖示＋5 個箭頭
  assert.equal((skillSlides['s6-uses'].match(/<svg/g) ?? []).length, 3);
});

test('講稿抽出來，含秒數與銜接', () => {
  for (const [name, notes] of Object.entries(skillNotes)) {
    assert.match(notes, /^（約 \d+ 秒）/, name);
    assert.match(notes, /銜接：/, name);
  }
  assert.match(skillNotes['s1-what'], /點餐單/);
  assert.match(skillNotes['s5-flow'], /親手把手冊遞給它/);
});

test('skillSlide 版型回傳該頁', () => {
  assert.equal(skillLayouts.skillSlide({ slide: 's3-folder' }).body, skillSlides['s3-folder']);
});

test('toSynora：清單外的圖示、形狀、圖片直接丟錯', () => {
  const wrap = (inner) => `<section id="x" style="background:#fff">${inner}<aside>（約 1 秒）n 銜接：x</aside></section>`;
  assert.throws(() => toSynora(wrap('<x-icon name="Rocket" style="width:10px;height:10px;color:#000"></x-icon>'), {}), /Rocket/);
  assert.throws(() => toSynora(wrap('<x-shape kind="diamond" style="width:10px;height:10px;background:#000"></x-shape>'), {}), /diamond/);
  assert.throws(() => toSynora(wrap('<img src="/_blob/abc" alt="">'), {}), /abc/);
});
