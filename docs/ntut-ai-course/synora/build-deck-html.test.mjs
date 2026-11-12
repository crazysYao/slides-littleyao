import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck } from './build-deck-html.mjs';

const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));

const layouts = {
  plain: (p) => ({ body: `<h1>${p.heading}</h1>`, natives: [] }),
  withLink: (p, { n }) => ({ body: '', natives: [n.link(70, 190, 820, 110, ['https://x', 'X', 'd'])] }),
  quiz: (p, { n }) => ({ body: '', natives: [n.quiz(p.question, p.options, p.correct)] }),
};
const fakeContent = {
  brand: 'B',
  palette: {},
  pages: [
    { id: 'a', layout: 'plain', section: 'S', title: 'A', notes: 'n', heading: 'h' },
    { id: 'b', layout: 'withLink', title: 'B', notes: 'n' },
    { id: 'q', layout: 'quizSet', section: 'S', label: '搶答', firstNote: '開場', items: [['Q1', ['x', 'y'], 1], ['Q2', ['x', 'y'], 0]] },
  ],
};

test('每頁第一個元件是滿版 html，原生元件在後', () => {
  const deck = buildDeck(fakeContent, { layouts });
  for (const s of deck.slides) {
    assert.deepEqual(pick(s.elements[0], ['id', 'type', 'x', 'y', 'width', 'height']), { id: `${s.id}-bg`, type: 'html', x: 0, y: 0, width: 960, height: 540 });
    assert.match(s.elements[0].html, /^<!doctype html>/);
  }
  const b = deck.slides.find((s) => s.id === 'b');
  assert.equal(b.elements[1].type, 'link');
  assert.equal(b.elements[1].id, 'b-link-1');
});

test('quizSet 展開成多頁且講稿附正解', () => {
  const deck = buildDeck(fakeContent, { layouts });
  const qs = deck.slides.filter((s) => s.id.startsWith('q-'));
  assert.deepEqual(qs.map((s) => s.id), ['q-1', 'q-2']);
  assert.equal(qs[0].notes, '開場 正解：y');
  assert.equal(qs[1].notes, '正解：x');
  assert.equal(qs[0].title, '搶答 1/2');
});

test('--only 只輸出指定頁且 slideNumber 從 1 連號', () => {
  const deck = buildDeck(fakeContent, { layouts, only: ['b', 'q-2'] });
  assert.deepEqual(deck.slides.map((s) => [s.id, s.slideNumber]), [['b', 1], ['q-2', 2]]);
});

test('版型不存在時丟錯並帶出頁 id', () => {
  const bad = { ...fakeContent, pages: [{ id: 's-x', layout: 'nope', title: 't', notes: 'n' }] };
  assert.throws(() => buildDeck(bad, { layouts }), /s-x.*nope/);
});
