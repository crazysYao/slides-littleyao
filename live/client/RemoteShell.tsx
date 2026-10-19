import { type Page, useIsActivePage } from '@open-slide/core';
import { type CSSProperties, type ReactNode, useCallback, useEffect, useState } from 'react';
import type { ClientMsg, TeacherView } from '../shared/protocol.ts';
import { formatCode } from './JoinBadge.tsx';
import { createLiveStore, type LiveStore, useLiveStore } from './store.ts';
import { C } from './theme.ts';
import { btn, Portal } from './ui.tsx';

type SessionRow = { code: string; createdAt: number; participants: number };

const section: CSSProperties = { background: C.panel, borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 };
const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };

const STATUS: Record<string, string> = { idle: '尚未開始', open: '作答中', closed: '已結束', revealed: '已公布' };

// 需要二次確認的按鈕(不用 confirm()，避免阻塞頁面)
function ConfirmButton({ label, confirmLabel, onConfirm, disabled }: { label: string; confirmLabel: string; onConfirm: () => void; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...btn(false), borderColor: armed ? C.bad : C.line, color: armed ? C.bad : C.text }}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}

function Counts({ view, iid }: { view: TeacherView; iid: string }) {
  const i = view.interactions[iid];
  if (!i) return null;
  const counts = view.counts[iid] ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15 }}>
      {i.options.map((o, k) => (
        <div key={k} style={{ display: 'flex', gap: 8, color: i.correct === k ? C.good : C.text }}>
          <b>{String.fromCharCode(65 + k)}</b>
          <span style={{ flex: 1 }}>{o}</span>
          <span>{counts[k] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

function SessionHistory({ apiBase, deckId }: { apiBase: string; deckId: string }) {
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [detail, setDetail] = useState<TeacherView | null>(null);
  useEffect(() => {
    void fetch(`${apiBase}/api/teacher/decks/${deckId}/sessions`)
      .then((r) => r.json())
      .then((d: { sessions: SessionRow[] }) => setRows([...d.sessions].reverse()));
  }, [apiBase, deckId]);
  if (detail)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button type="button" style={btn(false)} onClick={() => setDetail(null)}>
          ← 回場次清單
        </button>
        {Object.values(detail.interactions).map((i) => (
          <div key={i.id} style={{ borderTop: `2px solid ${C.line}`, paddingTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{i.question}</div>
            <Counts view={detail} iid={i.id} />
          </div>
        ))}
      </div>
    );
  if (!rows) return <div style={{ color: C.muted }}>載入中…</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => (
        <button
          key={r.code}
          type="button"
          style={{ ...btn(false), display: 'flex', justifyContent: 'space-between' }}
          onClick={() => void fetch(`${apiBase}/api/teacher/sessions/${r.code}`).then((x) => x.json()).then(setDetail)}
        >
          <span>{formatCode(r.code)}</span>
          <span style={{ color: C.muted, fontWeight: 500 }}>
            {new Date(r.createdAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {r.participants} 人
          </span>
        </button>
      ))}
    </div>
  );
}

function Controls({ apiBase, deckId }: { apiBase: string; deckId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [store, setStore] = useState<LiveStore | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadCurrent = useCallback(async () => {
    const r = await fetch(`${apiBase}/api/teacher/decks/${deckId}/current`);
    setCode(((await r.json()) as { code: string }).code);
  }, [apiBase, deckId]);

  useEffect(() => {
    void loadCurrent();
  }, [loadCurrent]);

  useEffect(() => {
    if (!code) return;
    const s = createLiveStore({ url: `${apiBase.replace(/^http/, 'ws')}/api/teacher/ws?code=${code}`, role: 'teacher' });
    setStore(s);
    return () => s.close();
  }, [apiBase, code]);

  const snap = useLiveStore(store);
  const view = (snap?.view ?? null) as TeacherView | null;
  const send = (m: ClientMsg) => store?.send(m);
  const nav = view?.nav ?? null;
  const iid = nav?.interaction;
  const inter = iid ? view?.interactions[iid] : undefined;

  const newSession = async () => {
    await fetch(`${apiBase}/api/teacher/decks/${deckId}/sessions`, { method: 'POST' });
    send({ t: 'remote', cmd: 'switch-session' });
    await loadCurrent();
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: snap?.connected ? C.good : C.warn }} />
        <b style={{ fontSize: 18 }}>手機遙控</b>
        <span style={{ marginLeft: 'auto', color: C.muted }}>
          {code ? formatCode(code) : '…'} · {view ? Object.keys(view.participants).length : 0} 人
        </span>
      </div>

      <div style={section}>
        <div style={{ color: C.muted, fontSize: 15 }}>
          目前頁：<b style={{ color: C.text }}>{nav?.pageId ?? '老師版尚未播放(請在筆電按 F)'}</b>
          {nav ? ` · 第 ${nav.step} 步` : ''}
          {nav?.teacherOnly ? ' · 學生看不到' : ''}
        </div>
        <div style={grid2}>
          <button type="button" style={{ ...btn(false), minHeight: 72, fontSize: 22 }} onClick={() => send({ t: 'remote', cmd: 'prev' })}>
            ← 上一步
          </button>
          <button type="button" style={{ ...btn(true), minHeight: 72, fontSize: 22 }} onClick={() => send({ t: 'remote', cmd: 'next' })}>
            下一步 →
          </button>
        </div>
      </div>

      {inter && iid && view && (
        <div style={section}>
          <div style={{ fontWeight: 800 }}>
            {inter.kind === 'quiz' ? '搶答' : '投票'} · {STATUS[inter.status]} · 已作答 {view.answered[iid] ?? 0}
          </div>
          <div>{inter.question}</div>
          <Counts view={view} iid={iid} />
          <div style={grid2}>
            <button type="button" style={btn(true)} disabled={inter.status !== 'idle'} onClick={() => send({ t: 'open', iid })}>
              開始作答
            </button>
            <button type="button" style={btn(false)} disabled={inter.status !== 'open'} onClick={() => send({ t: 'close', iid })}>
              結束作答
            </button>
            <button type="button" style={btn(true)} disabled={inter.status === 'revealed' || inter.status === 'idle'} onClick={() => send({ t: 'reveal', iid })}>
              公布結果
            </button>
            <button
              type="button"
              style={btn(view.view === 'leaderboard')}
              onClick={() => send({ t: 'view', view: view.view === 'leaderboard' ? 'question' : 'leaderboard' })}
            >
              {view.view === 'leaderboard' ? '回到題目' : '排行榜'}
            </button>
          </div>
          <ConfirmButton label="重設本題" confirmLabel="再按一次：清空本題作答" onConfirm={() => send({ t: 'reset', iid })} />
        </div>
      )}

      <div style={section}>
        <div style={{ fontWeight: 800 }}>講稿</div>
        <div style={{ fontSize: 20, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: nav?.note ? C.text : C.muted }}>
          {nav?.note || '這頁沒有講稿'}
        </div>
      </div>

      <div style={section}>
        <ConfirmButton label="開新場次" confirmLabel="再按一次：開新場次(舊結果保留)" onConfirm={() => void newSession()} />
        <button type="button" style={btn(false)} onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? '收起場次紀錄' : '場次紀錄'}
        </button>
        {showHistory && <SessionHistory apiBase={apiBase} deckId={deckId} />}
      </div>
    </div>
  );
}

function RemoteApp({ apiBase, decks }: { apiBase: string; decks: string[] }) {
  const [deckId, setDeckId] = useState<string | null>(decks.length === 1 ? decks[0] : null);
  if (!deckId)
    return (
      <Wrap>
        <b style={{ fontSize: 20 }}>選擇簡報</b>
        {decks.map((d) => (
          <button key={d} type="button" style={btn(false)} onClick={() => setDeckId(d)}>
            {d}
          </button>
        ))}
      </Wrap>
    );
  return <Controls apiBase={apiBase} deckId={deckId} />;
}

const Wrap = ({ children }: { children: ReactNode }) => (
  <div style={{ maxWidth: 520, margin: '0 auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
);

export function makeRemoteDeck(opts: { apiBase: string; decks: string[] }): Page[] {
  const RemotePage: Page = () => {
    const active = useIsActivePage();
    if (!active)
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontSize: 64, fontWeight: 800, fontFamily: C.font }}>
          手機遙控
        </div>
      );
    return (
      <Portal>
        <RemoteApp {...opts} />
      </Portal>
    );
  };
  return [RemotePage];
}
