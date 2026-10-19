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

  // 查詢與建立在同一個 DO 方法內完成，筆電與手機同時開也只會有一個目前場次
  async currentOrCreate(deckId: string): Promise<{ code: string; created: boolean }> {
    const current = (await this.deck(deckId)).current;
    if (current) return { code: current, created: false };
    return { code: await this.newSession(deckId), created: true };
  }

  async list(deckId: string): Promise<SessionEntry[]> {
    return (await this.deck(deckId)).sessions;
  }
}
