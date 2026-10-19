import '@open-slide/core';
import { type ComponentType, type Context, useLayoutEffect, useMemo, useRef } from 'react';

// open-slide 把頁碼與分步的 Context 放在 globalThis 上(見 @open-slide/core src/app/lib/*-context.tsx)，
// 學生版自行渲染頁面時用同一個 Context 提供值，<Steps> 與 useSlidePageNumber 才能運作。
type Registration = {
  id: object;
  stepCount: number;
  initialRevealed: number;
  setRevealed: (n: number) => void;
};

type StepHostValue = {
  register: (reg: Registration) => () => void;
  reportRevealed: (id: object, revealed: number) => void;
  entryDirection: 'forward';
  controlled: true;
  isActivePage: true;
};

const g = globalThis as Record<string, unknown>;
const PageContext = g.__open_slide_page_context__ as Context<{ index: number; total: number } | null>;
const StepHostContext = g.__open_slide_step_host_context__ as Context<StepHostValue | null>;

type Tracked = Registration & { revealed: number };

function distribute(regs: Tracked[], target: number) {
  let remaining = target;
  for (const r of regs) {
    const share = Math.max(0, Math.min(r.stepCount, remaining));
    remaining -= share;
    if (r.revealed !== share) {
      r.revealed = share;
      r.setRevealed(share);
    }
  }
}

export function ControlledPage({
  page: Page,
  index,
  total,
  revealed,
}: {
  page: ComponentType;
  index: number;
  total: number;
  revealed: number;
}) {
  const regsRef = useRef<Tracked[]>([]);
  const revealedRef = useRef(revealed);
  revealedRef.current = revealed;

  const host = useMemo<StepHostValue>(
    () => ({
      register: (reg) => {
        const tracked: Tracked = { ...reg, revealed: reg.initialRevealed };
        regsRef.current.push(tracked);
        distribute(regsRef.current, revealedRef.current);
        return () => {
          const i = regsRef.current.indexOf(tracked);
          if (i !== -1) regsRef.current.splice(i, 1);
        };
      },
      reportRevealed: () => {},
      entryDirection: 'forward',
      controlled: true,
      isActivePage: true,
    }),
    [],
  );

  useLayoutEffect(() => {
    distribute(regsRef.current, revealed);
  }, [revealed]);

  const pageValue = useMemo(() => ({ index, total }), [index, total]);

  return (
    <PageContext.Provider value={pageValue}>
      <StepHostContext.Provider value={host}>
        <Page />
      </StepHostContext.Provider>
    </PageContext.Provider>
  );
}
