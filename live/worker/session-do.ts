import { DurableObject } from 'cloudflare:workers';
import type { ClientMsg, Role, ServerMsg, SessionState } from '../shared/protocol.ts';
import { createSession, reduce, studentView, teacherView } from '../shared/session.ts';

const MAX_MESSAGE_CHARS = 64_000;
const STUDENT_MIN_INTERVAL_MS = 150;

export class SessionRoom extends DurableObject<Env> {
  private state: SessionState | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.state = (await ctx.storage.get<SessionState>('state')) ?? null;
    });
  }

  async init(code: string, deckId: string): Promise<void> {
    if (this.state) return;
    this.state = createSession(code, deckId, Date.now());
    await this.ctx.storage.put('state', this.state);
  }

  async participants(): Promise<number> {
    return this.state ? Object.keys(this.state.participants).length : 0;
  }

  async snapshot(): Promise<ReturnType<typeof teacherView> | null> {
    return this.state ? teacherView(this.state) : null;
  }

  async fetch(request: Request): Promise<Response> {
    if (!this.state) return new Response('session not found', { status: 404 });
    const role = request.headers.get('X-Role') as Role;
    const pid = role === 'student' ? request.headers.get('X-Pid') ?? '' : '-';
    if (role === 'student' && !pid) return new Response('pid required', { status: 400 });
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1], [role, pid]);
    this.sendView(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (!this.state || typeof raw !== 'string' || raw.length > MAX_MESSAGE_CHARS) return;
    const [role, pid] = this.ctx.getTags(ws) as [Role, string];
    if (role === 'student') {
      const now = Date.now();
      const last = (ws.deserializeAttachment() as { last?: number } | null)?.last ?? 0;
      if (now - last < STUDENT_MIN_INTERVAL_MS) return;
      ws.serializeAttachment({ last: now });
    }
    let msg: ClientMsg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg?.t === 'remote') {
      if (role !== 'teacher') return;
      const out: ServerMsg = { t: 'remote', cmd: msg.cmd };
      for (const t of this.ctx.getWebSockets('teacher')) if (t !== ws) t.send(JSON.stringify(out));
      return;
    }
    const next = reduce(this.state, msg, { role, pid: role === 'student' ? pid : undefined, now: Date.now() });
    if (next === this.state) return;
    await this.ctx.storage.put('state', next);
    this.state = next;
    for (const s of this.ctx.getWebSockets()) this.sendView(s);
  }

  async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    try {
      ws.close(code, 'closing');
    } catch {}
  }

  private sendView(ws: WebSocket) {
    if (!this.state) return;
    const [role, pid] = this.ctx.getTags(ws) as [Role, string];
    const state = role === 'teacher' ? teacherView(this.state) : studentView(this.state, pid);
    const out: ServerMsg = { t: 'state', state };
    try {
      ws.send(JSON.stringify(out));
    } catch {}
  }
}
