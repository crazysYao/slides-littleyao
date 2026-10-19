import { DurableObject } from 'cloudflare:workers';
import { newCode } from '../shared/code.ts';

export type SessionEntry = { code: string; createdAt: number };
type DeckRecord = { current: string | null; sessions: SessionEntry[] };

export class Registry extends DurableObject<Env> {
  private async deck(deckId: string): Promise<DeckRecord> {
    return (await this.ctx.storage.get<DeckRecord>(`deck:${deckId}`)) ?? { current: null, sessions: [] };
  }

  async newSession(deckId: string): Promise<string> {
    const rec = await this.deck(deckId);
    let code = newCode();
    while (rec.sessions.some((x) => x.code === code)) code = newCode();
    rec.sessions.push({ code, createdAt: Date.now() });
    rec.current = code;
    await this.ctx.storage.put(`deck:${deckId}`, rec);
    return code;
  }

  async current(deckId: string): Promise<{ code: string | null }> {
    return { code: (await this.deck(deckId)).current };
  }

  async list(deckId: string): Promise<SessionEntry[]> {
    return (await this.deck(deckId)).sessions;
  }
}
