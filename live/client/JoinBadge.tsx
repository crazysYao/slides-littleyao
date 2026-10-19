import { useMemo } from 'react';
import { C, STUDENT_SITE, studentPath, studentUrl } from './theme.ts';
import { qrcodegen } from './vendor/qrcodegen.ts';

export function QrSvg({ text, size }: { text: string; size: number }) {
  const { path, n } = useMemo(() => {
    const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
    let d = '';
    for (let y = 0; y < qr.size; y++)
      for (let x = 0; x < qr.size; x++) if (qr.getModule(x, y)) d += `M${x + 2},${y + 2}h1v1h-1z`;
    return { path: d, n: qr.size + 4 };
  }, [text]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" role="img" aria-label="加入 QR code">
      <rect width={n} height={n} fill="#fff" />
      <path d={path} fill={C.text} />
    </svg>
  );
}

export const formatCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

export function JoinBadge({ deckId, code, size = 260 }: { deckId: string; code: string; size?: number }) {
  return (
    <div
      style={{
        background: C.panel,
        borderRadius: C.radius,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        fontFamily: C.font,
        color: C.text,
      }}
    >
      <QrSvg text={studentUrl(deckId, code)} size={size} />
      <div style={{ fontSize: 20, color: C.muted, textAlign: 'center', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
        {STUDENT_SITE}
        <br />
        {studentPath(deckId)}
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 4 }}>{formatCode(code)}</div>
    </div>
  );
}
