import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { C } from './theme.ts';

export const btn = (primary: boolean): CSSProperties => ({
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

// 蓋滿整個視窗，脫離 open-slide 的 1920×1080 畫布，手機版面才能自由排版
export function Portal({ children }: { children: ReactNode }) {
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
