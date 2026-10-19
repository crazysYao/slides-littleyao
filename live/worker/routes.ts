export const LIVE_HOST = 'live.littleyao.me';
export const TEACH_HOST = 'teach.littleyao.me';
const STUDENT_ORIGIN = 'https://slides.littleyao.me';
const DEV_STUDENT_ORIGIN = 'http://localhost:5173';

export type RouteKind = 'student-ws' | 'teacher-api' | 'teacher-ws' | 'teacher-asset' | 'not-found';

export function classify(url: URL, devMode: boolean): { kind: RouteKind } {
  const host = url.hostname;
  const path = url.pathname;
  const isLocal = devMode && host === 'localhost';
  if (host === LIVE_HOST || isLocal) {
    if (path === '/api/student/ws') return { kind: 'student-ws' };
    if (!isLocal) return { kind: 'not-found' };
  }
  if (host === TEACH_HOST || isLocal) {
    if (path === '/api/teacher/ws') return { kind: 'teacher-ws' };
    if (path.startsWith('/api/teacher/')) return { kind: 'teacher-api' };
    if (path.startsWith('/api/')) return { kind: 'not-found' };
    return { kind: 'teacher-asset' };
  }
  return { kind: 'not-found' };
}

export function studentOriginAllowed(origin: string | null, devMode: boolean): boolean {
  return origin === STUDENT_ORIGIN || (devMode && origin === DEV_STUDENT_ORIGIN);
}

const TEACH_ORIGIN = `https://${TEACH_HOST}`;

// 防止老師登入後被其他網站借用 Access cookie 操作(CSRF / 跨站 WebSocket)
export function teacherOriginAllowed(origin: string | null, method: string, devMode: boolean): boolean {
  if (origin === TEACH_ORIGIN) return true;
  if (devMode && origin !== null && /^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return origin === null && (method === 'GET' || method === 'HEAD');
}
