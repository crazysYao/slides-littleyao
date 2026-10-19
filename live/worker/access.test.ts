import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyAccessJwt } from './access.ts';

const TEAM = 'littleyao.cloudflareaccess.com';
const AUD = 'aud-tag';
const EMAIL = 'a39795979@gmail.com';
const NOW = 1_800_000_000_000;

const b64url = (data: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  return Buffer.from(bytes).toString('base64url');
};

const pair = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
const jwk = { ...(await crypto.subtle.exportKey('jwk', pair.publicKey)), kid: 'k1' };

async function sign(payload: Record<string, unknown>, kid = 'k1') {
  const head = b64url(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

const good = { aud: [AUD], email: EMAIL, exp: NOW / 1000 + 600, iss: `https://${TEAM}` };
const opts = { teamDomain: TEAM, aud: AUD, allowedEmail: EMAIL, now: NOW, fetchJwks: async () => ({ keys: [jwk] }) };

test('有效 token 通過', async () => {
  assert.deepEqual(await verifyAccessJwt(await sign(good), opts), { ok: true, email: EMAIL });
});

test('email 大小寫不同仍通過', async () => {
  const r = await verifyAccessJwt(await sign({ ...good, email: 'A39795979@Gmail.com' }), opts);
  assert.equal(r.ok, true);
});

test('email 不同被拒', async () => {
  assert.deepEqual(await verifyAccessJwt(await sign({ ...good, email: 'x@y.com' }), opts), { ok: false, reason: 'email' });
});

test('過期被拒', async () => {
  assert.deepEqual(await verifyAccessJwt(await sign({ ...good, exp: NOW / 1000 - 1 }), opts), { ok: false, reason: 'exp' });
});

test('aud 錯被拒', async () => {
  assert.deepEqual(await verifyAccessJwt(await sign({ ...good, aud: ['other'] }), opts), { ok: false, reason: 'aud' });
});

test('iss 錯被拒', async () => {
  assert.deepEqual(await verifyAccessJwt(await sign({ ...good, iss: 'https://evil.example' }), opts), { ok: false, reason: 'iss' });
});

test('簽章被改被拒', async () => {
  const t = await sign(good);
  const forged = t.split('.');
  forged[1] = b64url(JSON.stringify({ ...good, email: EMAIL, exp: good.exp + 9999 }));
  assert.deepEqual(await verifyAccessJwt(forged.join('.'), opts), { ok: false, reason: 'signature' });
});

test('找不到 kid 被拒', async () => {
  assert.deepEqual(await verifyAccessJwt(await sign(good, 'nope'), opts), { ok: false, reason: 'signature' });
});

test('alg 不是 RS256 被拒', async () => {
  const head = b64url(JSON.stringify({ alg: 'none', kid: 'k1' }));
  const t = `${head}.${b64url(JSON.stringify(good))}.`;
  assert.deepEqual(await verifyAccessJwt(t, opts), { ok: false, reason: 'malformed' });
});

test('格式錯被拒', async () => {
  assert.deepEqual(await verifyAccessJwt('abc', opts), { ok: false, reason: 'malformed' });
  assert.deepEqual(await verifyAccessJwt('', opts), { ok: false, reason: 'malformed' });
});

test('JWKS 回傳格式錯誤時拒絕而不丟例外', async () => {
  const r = await verifyAccessJwt(await sign(good), { ...opts, fetchJwks: async () => ({}) as never });
  assert.deepEqual(r, { ok: false, reason: 'jwks' });
});
