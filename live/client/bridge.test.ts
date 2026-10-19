import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { LiveDeck } from './deck.ts';
import { navFromPresenter, shouldAutoOpen } from './bridge.ts';

const P = () => null;
const deck: LiveDeck = {
  deckId: 'd',
  pages: [
    { id: 'cover', Page: P },
    { id: 'demo', Page: P, teacherOnly: true },
    { id: 'poll', Page: P, interaction: 'p1' },
    { id: 'quiz', Page: P, interaction: 'q1' },
  ],
  interactions: [
    { id: 'p1', kind: 'poll', question: 'P', options: ['a', 'b'] },
    { id: 'q1', kind: 'quiz', question: 'Q', options: ['a', 'b'] },
  ],
};
const notes = ['封面講稿', 'Demo 講稿', undefined, undefined];

test('navFromPresenter 一般頁', () => {
  assert.deepEqual(navFromPresenter(deck, notes, { index: 0, stepIndex: 2 }), {
    pageId: 'cover', step: 2, teacherOnly: false, title: 'cover', note: '封面講稿',
  });
});

test('navFromPresenter 老師專屬頁', () => {
  const nav = navFromPresenter(deck, notes, { index: 1, stepIndex: 0 });
  assert.equal(nav.teacherOnly, true);
  assert.equal(nav.note, 'Demo 講稿');
});

test('navFromPresenter 帶出該頁互動、沒講稿時為空字串', () => {
  const nav = navFromPresenter(deck, notes, { index: 2, stepIndex: 0 });
  assert.equal(nav.interaction, 'p1');
  assert.equal(nav.note, '');
});

test('navFromPresenter 索引超出範圍時夾到最後一頁', () => {
  assert.equal(navFromPresenter(deck, notes, { index: 99, stepIndex: 0 }).pageId, 'quiz');
});

test('shouldAutoOpen 只對 idle 的投票', () => {
  assert.equal(shouldAutoOpen(deck, 'p1', 'idle'), true);
  assert.equal(shouldAutoOpen(deck, 'p1', 'revealed'), false);
  assert.equal(shouldAutoOpen(deck, 'q1', 'idle'), false);
  assert.equal(shouldAutoOpen(deck, undefined, 'idle'), false);
});
