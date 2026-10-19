// 本機 wrangler dev(8787)上跑一輪：開場次 → 定義搶答 → 學生作答 → 公布 → 重連
const BASE = process.env.LIVE_BASE ?? 'http://localhost:8787';
const WS = BASE.replace(/^http/, 'ws');
const ORIGIN = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect(url, headers = {}) {
  const ws = new WebSocket(url, { headers });
  const box = { last: null, ws };
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.t === 'state') box.last = m.state;
  });
  return new Promise((res, rej) => {
    ws.addEventListener('open', () => res(box));
    ws.addEventListener('error', rej);
  });
}

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

const { code } = await (await fetch(`${BASE}/api/teacher/decks/smoke/sessions`, { method: 'POST' })).json();
assert(/^[A-Z2-9]{6}$/.test(code), `code ${code}`);

const t = await connect(`${WS}/api/teacher/ws?code=${code}`);
t.ws.send(JSON.stringify({ t: 'define', defs: [{ id: 'q1', kind: 'quiz', question: 'Q', options: ['a', 'b'], seconds: 20, correct: 1 }] }));

const bad = await new Promise((res) => {
  const ws = new WebSocket(`${WS}/api/student/ws?code=${code}&pid=x`, { headers: { Origin: 'https://evil.example' } });
  ws.addEventListener('open', () => res('opened'));
  ws.addEventListener('error', () => res('rejected'));
});
assert(bad === 'rejected', 'evil origin should be rejected');

const s = await connect(`${WS}/api/student/ws?code=${code}&pid=p1`, { Origin: ORIGIN });
s.ws.send(JSON.stringify({ t: 'join', pid: 'p1', name: '測試' }));
await sleep(300);
t.ws.send(JSON.stringify({ t: 'open', iid: 'q1' }));
await sleep(300);
s.ws.send(JSON.stringify({ t: 'answer', iid: 'q1', choice: 1 }));
await sleep(300);
assert(s.last.active?.counts === undefined, 'counts hidden before reveal');
assert(t.last.counts.q1[1] === 1, 'teacher sees vote');
t.ws.send(JSON.stringify({ t: 'reveal', iid: 'q1' }));
await sleep(300);
assert(s.last.active.correct === 1 && s.last.active.counts[1] === 1, 'revealed to student');
const score = s.last.me.score;
assert(score >= 500, `score ${score}`);

s.ws.close();
await sleep(300);
const s2 = await connect(`${WS}/api/student/ws?code=${code}&pid=p1`, { Origin: ORIGIN });
s2.ws.send(JSON.stringify({ t: 'join', pid: 'p1', name: '測試' }));
await sleep(300);
assert(s2.last.me.score === score, 'score kept after reconnect');

const list = await (await fetch(`${BASE}/api/teacher/decks/smoke/sessions`)).json();
assert(list.sessions.some((x) => x.code === code && x.participants === 1), 'session listed');
const asset = await fetch(`${BASE}/`);
assert(asset.status === 200, 'teacher asset served in dev');

console.log('SMOKE OK', code, score);
process.exit(0);
