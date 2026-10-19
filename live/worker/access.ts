type Jwks = { keys: (JsonWebKey & { kid?: string })[] };

type VerifyOpts = {
  teamDomain: string;
  aud: string;
  allowedEmail: string;
  now: number;
  fetchJwks?: (url: string) => Promise<Jwks>;
};

export type VerifyResult = { ok: true; email: string } | { ok: false; reason: string };

const JWKS_TTL_MS = 10 * 60 * 1000;
const jwksCache = new Map<string, { at: number; jwks: Jwks }>();

const defaultFetchJwks = async (url: string): Promise<Jwks> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`jwks ${res.status}`);
  return res.json();
};

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const decodeJson = (s: string) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

async function getJwks(url: string, now: number, fetchJwks: (url: string) => Promise<Jwks>): Promise<Jwks> {
  const hit = jwksCache.get(url);
  if (hit && now - hit.at < JWKS_TTL_MS) return hit.jwks;
  const jwks = await fetchJwks(url);
  if (Array.isArray(jwks?.keys)) jwksCache.set(url, { at: now, jwks });
  return jwks;
}

export async function verifyAccessJwt(token: string, opts: VerifyOpts): Promise<VerifyResult> {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };
  let header: { alg?: string; kid?: string };
  let payload: { aud?: string | string[]; email?: string; exp?: number; iss?: string };
  try {
    header = decodeJson(parts[0]);
    payload = decodeJson(parts[1]);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (header.alg !== 'RS256') return { ok: false, reason: 'malformed' };

  const jwksUrl = `https://${opts.teamDomain}/cdn-cgi/access/certs`;
  // 測試注入的 fetchJwks 不走快取，避免不同測試的金鑰互相污染
  let jwks: Jwks;
  try {
    jwks = opts.fetchJwks ? await opts.fetchJwks(jwksUrl) : await getJwks(jwksUrl, opts.now, defaultFetchJwks);
  } catch {
    return { ok: false, reason: 'jwks' };
  }
  if (!Array.isArray(jwks?.keys)) return { ok: false, reason: 'jwks' };
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) return { ok: false, reason: 'signature' };
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) return { ok: false, reason: 'signature' };

  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(opts.aud)) return { ok: false, reason: 'aud' };
  if (payload.iss !== `https://${opts.teamDomain}`) return { ok: false, reason: 'iss' };
  if (typeof payload.exp !== 'number' || payload.exp <= opts.now / 1000) return { ok: false, reason: 'exp' };
  const email = payload.email ?? '';
  if (email.toLowerCase() !== opts.allowedEmail.toLowerCase()) return { ok: false, reason: 'email' };
  return { ok: true, email };
}
