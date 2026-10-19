import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, studentOriginAllowed } from './routes.ts';

const k = (u: string, dev = false) => classify(new URL(u), dev).kind;

test('live 網域取靜態檔為 not-found', () => {
  for (const p of ['/', '/assets/index.js', '/ntut-three-questions', '/live-remote', '/api/teacher/ws'])
    assert.equal(k(`https://live.littleyao.me${p}`), 'not-found', p);
});

test('live 網域學生 ws', () => {
  assert.equal(k('https://live.littleyao.me/api/student/ws?code=AAAAAA'), 'student-ws');
});

test('teach 網域', () => {
  assert.equal(k('https://teach.littleyao.me/api/teacher/ws?code=AAAAAA'), 'teacher-ws');
  assert.equal(k('https://teach.littleyao.me/api/teacher/decks/x/current'), 'teacher-api');
  assert.equal(k('https://teach.littleyao.me/foo'), 'teacher-asset');
  assert.equal(k('https://teach.littleyao.me/api/student/ws'), 'not-found');
});

test('未知網域', () => {
  assert.equal(k('https://evil.example/api/student/ws'), 'not-found');
  assert.equal(k('https://slides-live.x.workers.dev/api/student/ws'), 'not-found');
});

test('本機開發模式依路徑分流', () => {
  assert.equal(k('http://localhost:8787/api/student/ws?code=A', true), 'student-ws');
  assert.equal(k('http://localhost:8787/api/teacher/ws?code=A', true), 'teacher-ws');
  assert.equal(k('http://localhost:8787/ntut-three-questions', true), 'teacher-asset');
});

test('非開發模式下 localhost 不放行', () => {
  assert.equal(k('http://localhost:8787/api/student/ws', false), 'not-found');
});

test('學生 WebSocket 來源限制', () => {
  assert.equal(studentOriginAllowed('https://slides.littleyao.me', false), true);
  assert.equal(studentOriginAllowed('https://evil.example', false), false);
  assert.equal(studentOriginAllowed(null, false), false);
  assert.equal(studentOriginAllowed('http://localhost:5173', false), false);
  assert.equal(studentOriginAllowed('http://localhost:5173', true), true);
});
