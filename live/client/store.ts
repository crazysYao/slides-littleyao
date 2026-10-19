import { useSyncExternalStore } from 'react';
import type { ClientMsg, RemoteCmd, Role, ServerMsg, StudentView, TeacherView } from '../shared/protocol.ts';

export type LiveSnapshot = { connected: boolean; view: TeacherView | StudentView | null; role: Role };

export type LiveStore = {
  subscribe(fn: () => void): () => void;
  getState(): LiveSnapshot;
  send(msg: ClientMsg): void;
  close(): void;
};

type StoreOpts = {
  url: string;
  role: Role;
  pid?: string;
  name?: string;
  onOpen?: () => void;
  onRemote?: (cmd: RemoteCmd) => void;
  WebSocketImpl?: typeof WebSocket;
  setTimeoutImpl?: (fn: () => void, ms: number) => void;
};

const MAX_BACKOFF_MS = 10_000;

export function createLiveStore(opts: StoreOpts): LiveStore {
  const WS = opts.WebSocketImpl ?? WebSocket;
  const later = opts.setTimeoutImpl ?? ((fn, ms) => void setTimeout(fn, ms));
  const listeners = new Set<() => void>();
  let snapshot: LiveSnapshot = { connected: false, view: null, role: opts.role };
  let ws: WebSocket | null = null;
  let queue: string[] = [];
  let backoff = 1000;
  let closed = false;

  const emit = (next: Partial<LiveSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    for (const fn of listeners) fn();
  };

  const connect = () => {
    const socket = new WS(opts.url);
    ws = socket;
    socket.addEventListener('open', () => {
      backoff = 1000;
      if (opts.role === 'student' && opts.pid && opts.name) {
        socket.send(JSON.stringify({ t: 'join', pid: opts.pid, name: opts.name }));
      }
      opts.onOpen?.();
      for (const m of queue) socket.send(m);
      queue = [];
      emit({ connected: true });
    });
    socket.addEventListener('message', (e: MessageEvent) => {
      const msg = JSON.parse(String(e.data)) as ServerMsg;
      if (msg.t === 'state') emit({ view: msg.state });
      else if (msg.t === 'remote') opts.onRemote?.(msg.cmd);
    });
    socket.addEventListener('close', () => {
      if (ws !== socket) return;
      ws = null;
      emit({ connected: false });
      if (closed) return;
      const wait = backoff;
      backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      later(connect, wait);
    });
  };

  connect();

  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getState: () => snapshot,
    send(msg) {
      const data = JSON.stringify(msg);
      if (ws && ws.readyState === 1) ws.send(data);
      else queue.push(data);
    },
    close() {
      closed = true;
      ws?.close();
    },
  };
}

const EMPTY: LiveSnapshot = { connected: false, view: null, role: 'student' };
const noop = () => () => {};

export function useLiveStore(store: LiveStore | null): LiveSnapshot | null {
  const snap = useSyncExternalStore(store ? store.subscribe : noop, store ? store.getState : () => EMPTY);
  return store ? snap : null;
}

let currentStore: LiveStore | null = null;
const currentListeners = new Set<() => void>();

export function setCurrentStore(store: LiveStore | null) {
  currentStore = store;
  for (const fn of currentListeners) fn();
}

const subscribeCurrent = (fn: () => void) => {
  currentListeners.add(fn);
  return () => currentListeners.delete(fn);
};

export function useCurrentLive(): LiveSnapshot | null {
  const store = useSyncExternalStore(subscribeCurrent, () => currentStore);
  return useLiveStore(store);
}

export function useCurrentStore(): LiveStore | null {
  return useSyncExternalStore(subscribeCurrent, () => currentStore);
}

type KV = { getItem(k: string): string | null; setItem(k: string, v: string): void };

const memory = new Map<string, string>();

const safeStorage = (storage?: KV): KV => {
  const s = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
  return {
    getItem(k) {
      try {
        return s?.getItem(k) ?? memory.get(k) ?? null;
      } catch {
        return memory.get(k) ?? null;
      }
    },
    setItem(k, v) {
      memory.set(k, v);
      try {
        s?.setItem(k, v);
      } catch {}
    },
  };
};

export function studentIdentity(code: string, storage?: KV): { pid: string; name: string | null } {
  const kv = safeStorage(storage);
  const key = `live:${code}`;
  const raw = kv.getItem(key);
  const saved = raw ? (JSON.parse(raw) as { pid: string; name: string | null }) : null;
  if (saved?.pid) return saved;
  const fresh = { pid: crypto.randomUUID(), name: null };
  kv.setItem(key, JSON.stringify(fresh));
  return fresh;
}

export function saveName(code: string, name: string, storage?: KV) {
  const kv = safeStorage(storage);
  const { pid } = studentIdentity(code, storage);
  kv.setItem(`live:${code}`, JSON.stringify({ pid, name }));
}
