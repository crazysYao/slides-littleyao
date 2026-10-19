import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Nav } from '../shared/protocol.ts';
import { followTarget, maxSelfIndex, publicPages, type DeckPage } from './deck.ts';

const P = () => null;
const pages: DeckPage[] = [
  { id: 'cover', Page: P },
  { id: 'agenda', Page: P },
  { id: 'demo', Page: P, teacherOnly: true },
  { id: 'qa', Page: P },
];
const pub = publicPages(pages);
const nav = (pageId: string, step = 0): Nav => ({ pageId, step, teacherOnly: pageId === 'demo', title: '', note: '' });

test('publicPages 去掉老師專屬頁', () => {
  assert.deepEqual(pub.map((p) => p.id), ['cover', 'agenda', 'qa']);
});

test('followTarget 對公開頁回 index 與 step', () => {
  assert.deepEqual(followTarget(pub, nav('qa', 2)), { index: 2, step: 2 });
});

test('followTarget 對老師專屬頁回 teacher-only', () => {
  assert.equal(followTarget(pub, nav('demo')), 'teacher-only');
});

test('followTarget 對不存在的頁回 teacher-only', () => {
  assert.equal(followTarget(pub, nav('ghost')), 'teacher-only');
});

test('followTarget 在 nav 為 null 時回 null', () => {
  assert.equal(followTarget(pub, null), null);
});

test('maxSelfIndex 回老師目前頁', () => {
  assert.equal(maxSelfIndex(pub, nav('agenda'), 'cover'), 1);
});

test('maxSelfIndex 在老師專屬頁時回最後看到的公開頁', () => {
  assert.equal(maxSelfIndex(pub, nav('demo'), 'agenda'), 1);
});

test('maxSelfIndex 沒有任何資訊時回 0', () => {
  assert.equal(maxSelfIndex(pub, null, null), 0);
  assert.equal(maxSelfIndex(pub, nav('demo'), null), 0);
});
