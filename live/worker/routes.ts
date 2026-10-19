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
