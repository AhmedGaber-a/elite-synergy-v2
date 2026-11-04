// middleware.ts
// Blocks requests coming through VPN / proxy / Tor addresses before they reach any page or API.
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, isBlockedIp } from '@/lib/services/ipRisk';

export async function middleware(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (await isBlockedIp(ip)) {
    return new NextResponse(
      `<!doctype html><html dir="rtl" lang="ar"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
       <body style="font-family:Arial,sans-serif;text-align:center;padding:48px 16px">
       <h2>الوصول من شبكة VPN غير مسموح</h2>
       <p>اقفل الـ VPN أو الـ Proxy وحاول تاني.</p></body></html>`,
      { status: 403, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon|icon|manifest.json|robots.txt|sitemap.xml).*)'],
};
