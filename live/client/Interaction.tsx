import { useEffect, useState } from 'react';
import type { InteractionDef, InteractionStatus, LeaderRow, StudentView, TeacherView } from '../shared/protocol.ts';
import { JoinBadge } from './JoinBadge.tsx';
import { remainingSeconds, useCurrentLive } from './store.ts';
import { C } from './theme.ts';

export type Resolved = {
  def: InteractionDef;
  role: 'teacher' | 'student' | 'static';
  status: InteractionStatus;
  openedAt?: number;
  counts?: number[];
  correct?: number;
  answered?: number;
  joined?: number;
  leaderboard?: LeaderRow[];
  join?: { deckId: string; code: string };
};

// 依目前連線角色，把同一題整理成畫面要用的資料
export function useResolved(id: string, fallback?: InteractionDef): Resolved | null {
  const live = useCurrentLive();
  const view = live?.view;
  if (live?.role === 'teacher' && view && 'interactions' in view) {
    const t = view as TeacherView;
    const i = t.interactions[id];
    if (!i) return fallback ? { def: fallback, role: 'static', status: 'idle' } : null;
    return {
      def: i,
      role: 'teacher',
      status: i.status,
      openedAt: i.openedAt,
      counts: t.counts[id],
      correct: i.status === 'revealed' ? i.correct : undefined,
      answered: t.answered[id],
      joined: Object.keys(t.participants).length,
      leaderboard: t.view === 'leaderboard' && t.activeId === id ? t.leaderboard : undefined,
      join: { deckId: t.deckId, code: t.sessionId },
    };
  }
  if (live?.role === 'student' && view && 'defs' in view) {
    const s = view as StudentView;
    const def = s.defs[id] ?? fallback;
    if (!def) return null;
    const isActive = s.active?.def.id === id;
    return {
      def,
      role: 'student',
      status: isActive ? s.active!.status : s.revealed[id] ? 'revealed' : 'idle',
      openedAt: isActive ? s.active!.openedAt : undefined,
      counts: s.revealed[id]?.counts,
      correct: s.revealed[id]?.correct,
      leaderboard: isActive && s.view === 'leaderboard' ? s.leaderboard : undefined,
    };
  }
  return fallback ? { def: fallback, role: 'static', status: 'idle' } : null;
}

// 用伺服器時間計算剩餘秒數：時鐘不同步或重連後都正確
export function useCountdown(openedAt: number | undefined, seconds: number, running: boolean): number {
  const offset = useCurrentLive()?.offset ?? 0;
  const [, tick] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const loop = () => {
      tick((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  if (openedAt === undefined) return seconds;
  return remainingSeconds(openedAt, seconds, Date.now(), offset);
}

const OPTION_COLORS = [C.accent, C.warn, C.good, C.bad, '#8b5cf6', '#0ea5e9'];

export function OptionBars({
  options,
  counts,
  correct,
  highlight,
  size = 'lg',
}: {
  options: string[];
  counts?: number[];
  correct?: number;
  highlight?: number;
  size?: 'lg' | 'sm';
}) {
  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0;
  const big = size === 'lg';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: big ? 22 : 10 }}>
      {options.map((opt, i) => {
        const pct = counts && total ? Math.round((counts[i] / total) * 100) : 0;
        const isCorrect = correct === i;
        const dim = correct !== undefined && !isCorrect;
        const color = OPTION_COLORS[i % OPTION_COLORS.length];
        return (
          <div
            key={i}
            style={{
              position: 'relative',
              background: C.panel,
              borderRadius: big ? 20 : 14,
              padding: big ? '20px 28px' : '12px 16px',
              border: `${big ? 4 : 3}px solid ${isCorrect ? C.good : highlight === i ? C.accent : 'transparent'}`,
              opacity: dim ? 0.55 : 1,
              overflow: 'hidden',
            }}
          >
            {counts && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${pct}%`,
                  background: `${color}26`,
                  transition: 'width 400ms cubic-bezier(0, 0, 0.2, 1)',
                }}
              />
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: big ? 20 : 12 }}>
              <span
                style={{
                  width: big ? 48 : 30,
                  height: big ? 48 : 30,
                  borderRadius: big ? 14 : 9,
                  background: color,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: big ? 28 : 17,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1, fontSize: big ? 36 : 18, lineHeight: 1.35 }}>{opt}</span>
              {isCorrect && <span style={{ fontSize: big ? 36 : 20, color: C.good, fontWeight: 800 }}>✓</span>}
              {counts && (
                <span style={{ fontSize: big ? 32 : 17, fontWeight: 700, minWidth: big ? 150 : 80, textAlign: 'right' }}>
                  {counts[i]} · {pct}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Leaderboard({ rows, size = 'lg' }: { rows: LeaderRow[]; size?: 'lg' | 'sm' }) {
  const big = size === 'lg';
  const medal = ['🥇', '🥈', '🥉'];
  if (!rows.length) return <div style={{ fontSize: big ? 40 : 18, color: C.muted }}>還沒有人加入</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: big ? 12 : 6 }}>
      {rows.map((r, i) => (
        <div
          key={`${r.name}-${i}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: big ? 24 : 12,
            background: C.panel,
            borderRadius: big ? 18 : 12,
            padding: big ? '12px 28px' : '8px 14px',
            fontSize: big ? 34 : 17,
          }}
        >
          <span style={{ width: big ? 64 : 32, fontWeight: 800 }}>{medal[i] ?? i + 1}</span>
          <span style={{ flex: 1 }}>{r.name}</span>
          <span style={{ fontWeight: 800 }}>{r.score}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_TEXT: Record<InteractionStatus, string> = {
  idle: '尚未開始',
  open: '作答中',
  closed: '作答結束',
  revealed: '已公布',
};

// 投影畫布上的整頁互動(1640×820 區域)
export function InteractionStage({ r, kindLabel, timer }: { r: Resolved; kindLabel: string; timer?: number }) {
  // 搶答在公布前不在投影上顯示票數，避免全班看到答案分布
  const showCounts = r.status === 'revealed' || (r.role === 'teacher' && r.def.kind === 'poll');
  return (
    <div style={{ flex: 1, display: 'flex', gap: 48, fontFamily: C.font, color: C.text, minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 28 }}>
          <span style={{ background: C.accent, color: '#fff', borderRadius: 999, padding: '8px 24px', fontWeight: 700 }}>
            {kindLabel}
          </span>
          {r.role !== 'static' && <span style={{ color: C.muted }}>{STATUS_TEXT[r.status]}</span>}
          {timer !== undefined && (
            <span style={{ marginLeft: 'auto', fontSize: 56, fontWeight: 800, color: timer <= 5 ? C.bad : C.text }}>
              {Math.ceil(timer)}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.25, margin: 0 }}>{r.def.question}</h2>
        {r.leaderboard ? (
          <Leaderboard rows={r.leaderboard} />
        ) : (
          <OptionBars options={r.def.options} counts={showCounts ? r.counts : undefined} correct={r.correct} />
        )}
        {r.role === 'teacher' && !r.leaderboard && (
          <div style={{ fontSize: 28, color: C.muted, marginTop: 'auto' }}>
            已作答 {r.answered ?? 0} / 加入 {r.joined ?? 0}
          </div>
        )}
      </div>
      {r.join && (
        <div style={{ width: 320, flexShrink: 0, alignSelf: 'flex-start' }}>
          <JoinBadge deckId={r.join.deckId} code={r.join.code} size={264} />
        </div>
      )}
    </div>
  );
}
