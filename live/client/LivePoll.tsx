import type { InteractionDef } from '../shared/protocol.ts';
import { InteractionStage, useResolved } from './Interaction.tsx';

export function LivePoll({ id, def }: { id: string; def?: InteractionDef }) {
  const r = useResolved(id, def);
  if (!r) return null;
  return <InteractionStage r={r} kindLabel="投票" />;
}
