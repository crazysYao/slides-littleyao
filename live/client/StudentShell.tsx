import { type DesignSystem, designToCssVars, type Page, useIsActivePage } from '@open-slide/core';
import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { StudentView } from '../shared/protocol.ts';
import { type DeckPage, followTarget, type LiveDeck, maxSelfIndex, publicPages } from './deck.ts';
import { Leaderboard, OptionBars, useCountdown } from './Interaction.tsx';
import { formatCode } from './JoinBadge.tsx';
import { ControlledPage } from './steps.tsx';
import { createLiveStore, type LiveStore, saveName, setCurrentStore, studentIdentity, useLiveStore } from './store.ts';
import { C } from './theme.ts';

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const ALL_STEPS = 999;
const CODE_RE = /^[A-Z2-9]{6}$/;

export function liveApiBase(): string {
  return location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://live.littleyao.me';
}

const btn = (primary: boolean): CSSProperties => ({
  minHeight: 56,
  padding: '0 22px',
  borderRadius: 16,
  border: primary ? 'none' : `2px solid ${C.line}`,
  background: primary ? C.accent : C.panel,
  color: primary ? '#fff' : C.text,
  fontSize: 18,
  fontWeight: 700,
  fontFamily: C.font,
  cursor: 'pointer',
});

const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 56,
  borderRadius: 16,
  border: `2px solid ${C.line}`,
  padding: '0 18px',
  fontSize: 22,
  fontFamily: C.font,
};

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: C.panel,
          borderRadius: 24,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CodeForm({ onCode }: { onCode: (code: string) => void }) {
  const [v, setV] = useState('');
  const code = v.replace(/\s/g, '').toUpperCase();
  return (
    <Card>
      <h1 style={{ fontSize: 26, margin: 0 }}>加入課堂互動</h1>
      <p style={{ margin: 0, color: C.muted, fontSize: 17 }}>掃描老師畫面上的 QR code，或輸入 6 碼代碼。</p>
      <input
        style={input}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="例如 K7P 2QX"
        autoCapitalize="characters"
        aria-label="場次代碼"
      />
      <button type="button" style={btn(true)} disabled={!CODE_RE.test(code)} onClick={() => onCode(code)}>
        下一步
      </button>
    </Card>
  );
}

function NameForm({ code, onName }: { code: string; onName: (name: string) => void }) {
  const [v, setV] = useState('');
  const name = v.trim();
  const ok = name.length > 0 && [...name].length <= 20;
  return (
    <Card>
      <h1 style={{ fontSize: 26, margin: 0 }}>輸入暱稱</h1>
      <p style={{ margin: 0, color: C.muted, fontSize: 17 }}>場次 {formatCode(code)} · 暱稱會顯示在搶答排行榜。</p>
      <input
        style={input}
        value={v}
        maxLength={20}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ok && onName(name)}
        placeholder="最多 20 字"
        aria-label="暱稱"
      />
      <button type="button" style={btn(true)} disabled={!ok} onClick={() => onName(name)}>
        加入
      </button>
    </Card>
  );
}

function ScaledSlide({ page, index, total, revealed, cssVars }: {
  page: DeckPage;
  index: number;
  total: number;
  revealed: number;
  cssVars: Record<string, string>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.3);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / CANVAS_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} style={{ width: '100%', height: CANVAS_H * k, position: 'relative', overflow: 'hidden', borderRadius: 16, boxShadow: `0 0 0 2px ${C.line}` }}>
      <div
        style={{
          ...(cssVars as CSSProperties),
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${k})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      >
        <ControlledPage key={page.id} page={page.Page} index={index} total={total} revealed={revealed} />
      </div>
    </div>
  );
}

function Placeholder({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      style={{
        aspectRatio: '16 / 9',
        width: '100%',
        borderRadius: 16,
        background: C.text,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        textAlign: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 16, color: '#b8bcc4' }}>{sub}</div>
    </div>
  );
}

function AnswerPanel({ view, store }: { view: StudentView; store: LiveStore }) {
  const a = view.active;
  const seconds = a?.def.seconds ?? 20;
  const left = useCountdown(a?.openedAt, seconds, a?.status === 'open' && a.def.kind === 'quiz');
  if (view.view === 'leaderboard' && view.leaderboard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>排行榜</div>
        {view.myRank && view.me && (
          <div style={{ fontSize: 17, color: C.accent, fontWeight: 700 }}>
            你是第 {view.myRank} 名 · {view.me.score} 分
          </div>
        )}
        <Leaderboard rows={view.leaderboard} size="sm" />
      </div>
    );
  }
  if (!a) return <div style={{ color: C.muted, fontSize: 17 }}>目前沒有題目，跟著老師的投影就好。</div>;
  const quiz = a.def.kind === 'quiz';
  const timeUp = quiz && a.status === 'open' && left <= 0;
  const canAnswer = a.status === 'open' && !timeUp && !(quiz && a.myChoice !== undefined);
  const revealed = a.status === 'revealed';
  let status = '';
  if (a.status === 'idle') status = '等待老師開始';
  else if (a.status === 'open' && !timeUp) status = a.myChoice === undefined ? (quiz ? '搶答中，選一個答案' : '選一個答案') : quiz ? '已送出，等待公布' : '已送出，公布前可以改選';
  else if (!revealed) status = a.myChoice === undefined ? '時間到' : '已送出，等待公布';
  else if (quiz && a.correct !== undefined)
    status = a.myChoice === undefined ? '這題沒有作答' : a.myChoice === a.correct ? '答對了！' : '答錯了';
  else status = '已公布';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: C.accent, color: '#fff', borderRadius: 999, padding: '4px 14px', fontSize: 15, fontWeight: 700 }}>
          {quiz ? '搶答' : '投票'}
        </span>
        {quiz && a.status === 'open' && (
          <span style={{ marginLeft: 'auto', fontSize: 26, fontWeight: 800, color: left <= 5 ? C.bad : C.text }}>
            {Math.ceil(left)}
          </span>
        )}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.35 }}>{a.def.question}</div>
      {revealed ? (
        <OptionBars options={a.def.options} counts={a.counts} correct={a.correct} highlight={a.myChoice} size="sm" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {a.def.options.map((opt, i) => {
            const mine = a.myChoice === i;
            return (
              <button
                key={i}
                type="button"
                disabled={!canAnswer}
                onClick={() => store.send({ t: 'answer', iid: a.def.id, choice: i })}
                style={{
                  ...btn(false),
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: `3px solid ${mine ? C.accent : C.line}`,
                  background: mine ? `${C.accent}14` : C.panel,
                  opacity: !canAnswer && !mine ? 0.55 : 1,
                  cursor: canAnswer ? 'pointer' : 'default',
                  fontWeight: 500,
                }}
              >
                <b style={{ color: C.accent }}>{String.fromCharCode(65 + i)}</b>
                <span style={{ lineHeight: 1.35, padding: '10px 0' }}>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ fontSize: 16, color: revealed && quiz && a.myChoice === a.correct ? C.good : C.muted, fontWeight: 700 }}>
        {status}
        {view.me && revealed && quiz ? ` · 目前 ${view.me.score} 分` : ''}
      </div>
    </div>
  );
}

function useWide() {
  const [wide, setWide] = useState(() => window.innerWidth >= 900);
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 900);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return wide;
}

function Classroom({ deck, pub, code, pid, name, cssVars }: {
  deck: LiveDeck;
  pub: DeckPage[];
  code: string;
  pid: string;
  name: string;
  cssVars: Record<string, string>;
}) {
  const [store, setStore] = useState<LiveStore | null>(null);
  // store 在 effect 內建立：StrictMode 會先跑一次 cleanup，若用 useMemo 會留下已關閉的連線
  useEffect(() => {
    const base = liveApiBase().replace(/^http/, 'ws');
    const s = createLiveStore({ url: `${base}/api/student/ws?code=${code}&pid=${encodeURIComponent(pid)}`, role: 'student', pid, name });
    setStore(s);
    setCurrentStore(s);
    return () => {
      setCurrentStore(null);
      s.close();
    };
  }, [code, pid, name]);
  const snap = useLiveStore(store);
  const view = (snap?.view ?? null) as StudentView | null;
  const nav = view?.nav ?? null;
  const [mode, setMode] = useState<'follow' | 'self'>('follow');
  const [selfIndex, setSelfIndex] = useState(0);
  const [lastPublicId, setLastPublicId] = useState<string | null>(null);
  const wide = useWide();

  const target = followTarget(pub, nav);
  const targetId = target && target !== 'teacher-only' ? pub[target.index].id : null;
  useEffect(() => {
    if (targetId) setLastPublicId(targetId);
  }, [targetId]);
  const max = maxSelfIndex(pub, nav, lastPublicId);

  let slide: ReactNode;
  if (mode === 'self') {
    const i = Math.min(selfIndex, max);
    const onTeacherPage = nav && pub[i].id === nav.pageId;
    slide = <ScaledSlide page={pub[i]} index={i} total={pub.length} revealed={onTeacherPage ? nav.step : ALL_STEPS} cssVars={cssVars} />;
  } else if (target === 'teacher-only') {
    slide = <Placeholder title="老師正在示範" sub="請看前方投影幕" />;
  } else if (target) {
    slide = <ScaledSlide page={pub[target.index]} index={target.index} total={pub.length} revealed={target.step} cssVars={cssVars} />;
  } else {
    slide = <Placeholder title="等待老師開始" sub={`場次 ${formatCode(code)}`} />;
  }

  const startSelf = () => {
    setSelfIndex(target && target !== 'teacher-only' ? target.index : max);
    setMode('self');
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          background: C.panel,
          borderBottom: `2px solid ${C.line}`,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <span
          title={snap?.connected ? '已連線' : '連線中'}
          style={{ width: 12, height: 12, borderRadius: 6, background: snap?.connected ? C.good : C.warn, flexShrink: 0 }}
        />
        <span style={{ fontWeight: 800, fontSize: 17, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ color: C.muted, fontSize: 15 }}>{snap?.connected ? '' : '連線中…'}</span>
        <button type="button" style={{ ...btn(mode === 'follow'), marginLeft: 'auto', minHeight: 44 }} onClick={() => (mode === 'follow' ? startSelf() : setMode('follow'))}>
          {mode === 'follow' ? '跟隨老師中' : '回到老師目前頁'}
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: wide ? 'row' : 'column',
          gap: 16,
          padding: 16,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: wide ? 2 : undefined, width: wide ? undefined : '100%', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {slide}
          {mode === 'self' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="button" style={btn(false)} disabled={selfIndex <= 0} onClick={() => setSelfIndex((i) => Math.max(0, Math.min(i, max) - 1))}>
                上一頁
              </button>
              <span style={{ color: C.muted, fontSize: 15 }}>
                {Math.min(selfIndex, max) + 1} / {max + 1}
              </span>
              <button type="button" style={btn(false)} disabled={selfIndex >= max} onClick={() => setSelfIndex((i) => Math.min(max, i + 1))}>
                下一頁
              </button>
            </div>
          )}
        </div>
        <div
          style={{
            flex: wide ? 1 : undefined,
            width: wide ? undefined : '100%',
            boxSizing: 'border-box',
            background: C.panel,
            borderRadius: 20,
            padding: 18,
            minWidth: 0,
          }}
        >
          {view && store ? <AnswerPanel view={view} store={store} /> : <div style={{ color: C.muted }}>連線中…</div>}
        </div>
      </div>
    </div>
  );
}

function StudentApp({ deck, design }: { deck: LiveDeck; design?: DesignSystem }) {
  const pub = useMemo(() => publicPages(deck.pages), [deck]);
  const cssVars = useMemo(() => (design ? designToCssVars(design) : {}), [design]);
  const [code, setCode] = useState(() => {
    const s = new URLSearchParams(location.search).get('s')?.toUpperCase() ?? '';
    return CODE_RE.test(s) ? s : '';
  });
  const identity = useMemo(() => (code ? studentIdentity(code) : null), [code]);
  const [name, setName] = useState<string | null>(identity?.name ?? null);
  useEffect(() => setName(identity?.name ?? null), [identity]);

  const chooseCode = (c: string) => {
    const url = new URL(location.href);
    url.searchParams.set('s', c);
    history.replaceState(history.state, '', url);
    setCode(c);
  };

  if (!code || !identity) return <CodeForm onCode={chooseCode} />;
  if (!name)
    return (
      <NameForm
        code={code}
        onName={(n) => {
          saveName(code, n);
          setName(n);
        }}
      />
    );
  return <Classroom deck={deck} pub={pub} code={code} pid={identity.pid} name={name} cssVars={cssVars} />;
}

function Portal({ children }: { children: ReactNode }) {
  const [el] = useState(() => {
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483000',
      overflow: 'auto',
      background: C.bg,
      color: C.text,
      fontFamily: C.font,
    });
    return d;
  });
  useEffect(() => {
    document.body.appendChild(el);
    return () => el.remove();
  }, [el]);
  return createPortal(children, el);
}

export function makeStudentDeck(deck: LiveDeck, design?: DesignSystem): Page[] {
  const StudentPage: Page = () => {
    const active = useIsActivePage();
    if (!active)
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontSize: 64, fontWeight: 800, fontFamily: C.font }}>
          學生互動頁
        </div>
      );
    return (
      <Portal>
        <StudentApp deck={deck} design={design} />
      </Portal>
    );
  };
  return [StudentPage];
}
