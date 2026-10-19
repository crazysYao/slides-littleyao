import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLiveStore, remainingSeconds, saveName, studentIdentity } from './store.ts';

class FakeWS {
  static all: FakeWS[] = [];
  sent: string[] = [];
  listeners: Record<string, ((e: { data?: string }) => void)[]> = {};
  readyState = 0;
  url: string;
  constructor(url: string) {
    this.url = url;
    FakeWS.all.push(this);
  }
  addEventListener(type: string, fn: (e: { data?: string }) => void) {
    (this.listeners[type] ??= []).push(fn);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.fire('close');
  }
  fire(type: string, data?: string) {
    if (type === 'open') this.readyState = 1;
    if (type === 'close') this.readyState = 3;
    for (const fn of this.listeners[type] ?? []) fn({ data });
  }
}

function fakeTimers() {
  const calls: { ms: number; fn: () => void }[] = [];
  return { calls, setTimeoutImpl: (fn: () => void, ms: number) => void calls.push({ fn, ms }) };
}

const reset = () => (FakeWS.all = []);

test('未連線時 send 排隊，連上後送出', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  store.send({ t: 'view', view: 'leaderboard' });
  assert.equal(FakeWS.all[0].sent.length, 0);
  FakeWS.all[0].fire('open');
  assert.deepEqual(FakeWS.all[0].sent.map((s) => JSON.parse(s).t), ['view']);
  store.close();
});

test('斷線後依 1s、2s 退避重連', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  FakeWS.all[0].fire('close');
  assert.equal(timers.calls[0].ms, 1000);
  timers.calls[0].fn();
  assert.equal(FakeWS.all.length, 2);
  FakeWS.all[1].fire('close');
  assert.equal(timers.calls[1].ms, 2000);
  store.close();
});

test('退避上限 10 秒，連上後歸零', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  for (let i = 0; i < 6; i++) {
    FakeWS.all.at(-1)!.fire('close');
    timers.calls.at(-1)!.fn();
  }
  assert.equal(timers.calls.at(-1)!.ms, 10000);
  FakeWS.all.at(-1)!.fire('open');
  FakeWS.all.at(-1)!.fire('close');
  assert.equal(timers.calls.at(-1)!.ms, 1000);
  store.close();
});

test('學生重連後自動重送 join', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'student', pid: 'p1', name: '小明', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  FakeWS.all[0].fire('open');
  FakeWS.all[0].fire('close');
  timers.calls[0].fn();
  FakeWS.all[1].fire('open');
  assert.deepEqual(JSON.parse(FakeWS.all[1].sent[0]), { t: 'join', pid: 'p1', name: '小明' });
  store.close();
});

test('onOpen 每次連上都會呼叫', () => {
  reset();
  const timers = fakeTimers();
  let opens = 0;
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', onOpen: () => opens++, WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  FakeWS.all[0].fire('open');
  FakeWS.all[0].fire('close');
  timers.calls[0].fn();
  FakeWS.all[1].fire('open');
  assert.equal(opens, 2);
  store.close();
});

test('收到 state 通知訂閱者，收到 remote 呼叫 onRemote', () => {
  reset();
  const timers = fakeTimers();
  const cmds: string[] = [];
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', onRemote: (c) => cmds.push(c), WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  let hits = 0;
  store.subscribe(() => hits++);
  FakeWS.all[0].fire('open');
  FakeWS.all[0].fire('message', JSON.stringify({ t: 'state', state: { view: 'question' } }));
  FakeWS.all[0].fire('message', JSON.stringify({ t: 'remote', cmd: 'next' }));
  assert.equal(store.getState().connected, true);
  assert.deepEqual(store.getState().view, { view: 'question' });
  assert.ok(hits >= 2);
  assert.deepEqual(cmds, ['next']);
  store.close();
});

test('close 之後不再重連', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  store.close();
  assert.equal(timers.calls.length, 0);
});

test('studentIdentity 產生並記住 pid 與暱稱', () => {
  const mem = new Map<string, string>();
  const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
  const a = studentIdentity('AAAAAA', storage);
  assert.equal(a.name, null);
  saveName('AAAAAA', '小明', storage);
  const b = studentIdentity('AAAAAA', storage);
  assert.equal(b.pid, a.pid);
  assert.equal(b.name, '小明');
});

test('localStorage 拋錯時退回記憶體', () => {
  const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
  const a = studentIdentity('BBBBBB', broken);
  saveName('BBBBBB', '小華', broken);
  const b = studentIdentity('BBBBBB', broken);
  assert.equal(b.pid, a.pid);
  assert.equal(b.name, '小華');
});

test('close 之後，已排程的重連不會再建立連線', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'teacher', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl });
  FakeWS.all[0].fire('close');
  store.close();
  timers.calls[0].fn();
  assert.equal(FakeWS.all.length, 1);
});

test('收到 state 時記錄伺服器時間差', () => {
  reset();
  const timers = fakeTimers();
  const store = createLiveStore({ url: 'ws://x', role: 'student', WebSocketImpl: FakeWS as never, setTimeoutImpl: timers.setTimeoutImpl, nowImpl: () => 1000 });
  FakeWS.all[0].fire('open');
  FakeWS.all[0].fire('message', JSON.stringify({ t: 'state', state: {}, now: 6000 }));
  assert.equal(store.getState().offset, 5000);
  store.close();
});

test('remainingSeconds 用伺服器時間計算，重連後不會從頭倒數', () => {
  // 伺服器 openedAt=10_000、時限 20 秒；本機時鐘慢 5 秒、本機現在 20_000(伺服器 25_000)
  assert.equal(remainingSeconds(10_000, 20, 20_000, 5_000), 5);
  assert.equal(remainingSeconds(10_000, 20, 40_000, 5_000), 0);
});
