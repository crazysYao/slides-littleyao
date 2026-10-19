import { verifyAccessJwt } from './access.ts';
import { classify, studentOriginAllowed } from './routes.ts';

export { Registry } from './registry-do.ts';
export { SessionRoom } from './session-do.ts';

const CODE_RE = /^[A-Z2-9]{6}$/;
const DECK_RE = /^[a-z0-9-]{1,64}$/;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const isDev = (env: Env, url: URL) => Boolean(env.DEV_TEACHER_EMAIL) && url.hostname === 'localhost';

async function teacherAllowed(request: Request, env: Env, url: URL): Promise<boolean> {
  if (isDev(env, url)) return true;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return false;
  const token = request.headers.get('Cf-Access-Jwt-Assertion') ?? '';
  const r = await verifyAccessJwt(token, {
    teamDomain: env.ACCESS_TEAM_DOMAIN,
    aud: env.ACCESS_AUD,
    allowedEmail: env.TEACHER_EMAIL,
    now: Date.now(),
  });
  return r.ok;
}

const registry = (env: Env) => env.REGISTRY.get(env.REGISTRY.idFromName('registry'));
const room = (env: Env, code: string) => env.SESSION.get(env.SESSION.idFromName(code));

async function createSession(env: Env, deckId: string): Promise<string> {
  const code = await registry(env).newSession(deckId);
  await room(env, code).init(code, deckId);
  return code;
}

async function teacherApi(env: Env, url: URL, method: string): Promise<Response> {
  const m = url.pathname.match(/^\/api\/teacher\/decks\/([^/]+)\/(sessions|current)$/);
  if (!m || !DECK_RE.test(m[1])) return json({ error: 'not found' }, 404);
  const [, deckId, action] = m;
  if (action === 'current' && method === 'GET') {
    const { code } = await registry(env).current(deckId);
    return json({ code: code ?? (await createSession(env, deckId)) });
  }
  if (action === 'sessions' && method === 'POST') return json({ code: await createSession(env, deckId) });
  if (action === 'sessions' && method === 'GET') {
    const entries = await registry(env).list(deckId);
    const sessions = await Promise.all(
      entries.map(async (e) => {
        const s = await room(env, e.code).summary();
        return { code: e.code, createdAt: e.createdAt, participants: s?.participants ?? 0, view: s?.view ?? null };
      }),
    );
    return json({ sessions });
  }
  return json({ error: 'method not allowed' }, 405);
}

function forwardWs(request: Request, env: Env, url: URL, role: 'teacher' | 'student'): Promise<Response> | Response {
  if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
  const code = url.searchParams.get('code') ?? '';
  if (!CODE_RE.test(code)) return new Response('bad code', { status: 400 });
  const headers = new Headers(request.headers);
  headers.set('X-Role', role);
  if (role === 'student') headers.set('X-Pid', (url.searchParams.get('pid') ?? '').slice(0, 64));
  return room(env, code).fetch(new Request(request, { headers }));
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const dev = isDev(env, url);
    const { kind } = classify(url, dev);
    switch (kind) {
      case 'student-ws':
        if (!studentOriginAllowed(request.headers.get('Origin'), dev)) return new Response('forbidden', { status: 403 });
        return forwardWs(request, env, url, 'student');
      case 'teacher-ws':
      case 'teacher-api':
      case 'teacher-asset':
        if (!(await teacherAllowed(request, env, url))) return new Response('forbidden', { status: 403 });
        if (kind === 'teacher-ws') return forwardWs(request, env, url, 'teacher');
        if (kind === 'teacher-api') return teacherApi(env, url, request.method);
        return env.ASSETS.fetch(request);
      default:
        return new Response('not found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
