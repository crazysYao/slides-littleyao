import type { InteractionDef } from '../shared/protocol.ts';
import { InteractionStage, useCountdown, useResolved } from './Interaction.tsx';

const DEFAULT_SECONDS = 20;

export function LiveQuiz({ id, def, label = '搶答' }: { id: string; def?: InteractionDef; label?: string }) {
  const r = useResolved(id, def);
  const seconds = r?.def.seconds ?? DEFAULT_SECONDS;
  const left = useCountdown(r?.openedAt, seconds, r?.status === 'open');
  if (!r) return null;
  return <InteractionStage r={r} kindLabel={label} timer={r.status === 'open' ? left : undefined} />;
}
