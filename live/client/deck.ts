import type { ComponentType } from 'react';
import type { InteractionDef, Nav } from '../shared/protocol.ts';

export type DeckPage = { id: string; Page: ComponentType; teacherOnly?: boolean; interaction?: string };

export type LiveDeck = { deckId: string; pages: DeckPage[]; interactions: InteractionDef[] };

export const publicPages = (pages: DeckPage[]): DeckPage[] => pages.filter((p) => !p.teacherOnly);

export function followTarget(pub: DeckPage[], nav: Nav | null): { index: number; step: number } | 'teacher-only' | null {
  if (!nav) return null;
  const index = pub.findIndex((p) => p.id === nav.pageId);
  if (nav.teacherOnly || index < 0) return 'teacher-only';
  return { index, step: nav.step };
}

// 學生端只知道公開頁；老師在專屬頁時，以最後看到的公開頁為上限
export function maxSelfIndex(pub: DeckPage[], nav: Nav | null, lastPublicId: string | null): number {
  const target = followTarget(pub, nav);
  if (target && target !== 'teacher-only') return target.index;
  const last = lastPublicId ? pub.findIndex((p) => p.id === lastPublicId) : -1;
  return Math.max(0, last);
}
