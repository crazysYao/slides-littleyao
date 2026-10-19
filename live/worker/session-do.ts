import { DurableObject } from 'cloudflare:workers';
import type { ClientMsg, Role, ServerMsg, SessionState } from '../shared/protocol.ts';
import { createSession, reduce, studentView, teacherView } from '../shared/session.ts';

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

  async summary(): Promise<{ participants: number; view: ReturnType<typeof teacherView> } | null> {
    if (!this.state) return null;
    return { participants: Object.keys(this.state.participants).length, view: teacherView(this.state) };
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
    if (!this.state || typeof raw !== 'string') return;
    let msg: ClientMsg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    const [role, pid] = this.ctx.getTags(ws) as [Role, string];
    if (msg.t === 'remote') {
      if (role !== 'teacher') return;
      const out: ServerMsg = { t: 'remote', cmd: msg.cmd };
      for (const t of this.ctx.getWebSockets('teacher')) if (t !== ws) t.send(JSON.stringify(out));
      return;
    }
    const next = reduce(this.state, msg, { role, pid: role === 'student' ? pid : undefined, now: Date.now() });
    if (next === this.state) return;
    this.state = next;
    await this.ctx.storage.put('state', next);
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
