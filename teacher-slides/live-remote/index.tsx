// 手機遙控：teach.littleyao.me/live-remote
import type { SlideMeta } from '@open-slide/core';
import { makeRemoteDeck } from '../../live/client/RemoteShell.tsx';

export const meta: SlideMeta = { title: '手機遙控', createdAt: '2026-10-19T12:00:00.000Z' };

export default makeRemoteDeck({ apiBase: typeof location === 'undefined' ? '' : location.origin, decks: ['ntut-three-questions'] });
