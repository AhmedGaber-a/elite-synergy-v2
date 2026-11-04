// src/lib/services/ipRisk.ts
// Detects VPN / proxy / Tor / relay IPs using vpnapi.io (needs VPNAPI_KEY in the environment).
// Fails open: if the key is missing or the service is slow/down, students are NOT blocked.
const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { blocked: boolean; at: number }>();

export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  return (xff?.split(',')[0] || headers.get('x-real-ip') || '').trim();
}

function isPrivate(ip: string): boolean {
  return (
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

export async function isBlockedIp(ip: string): Promise<boolean> {
  if (isPrivate(ip)) return false;
  const key = process.env.VPNAPI_KEY;
  if (!key) return false;

  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.blocked;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://vpnapi.io/api/${encodeURIComponent(ip)}?key=${key}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;

    const data = await res.json();
    const s = data?.security || {};
    const blocked = !!(s.vpn || s.proxy || s.tor || s.relay);
    cache.set(ip, { blocked, at: Date.now() });
    return blocked;
  } catch {
    return false;
  }
}
