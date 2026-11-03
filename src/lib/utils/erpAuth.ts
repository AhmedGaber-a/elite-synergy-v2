// src/lib/utils/erpAuth.ts
import { NextRequest, NextResponse } from 'next/server';

const ERP_ALLOWED_ORIGINS = [
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.ERP_FLUTTER_ORIGIN || '',
].filter(Boolean);

/**
 * Returns CORS headers that allow the Flutter ERP Desktop/Mobile app to communicate.
 * Supports both development (localhost) and production ERP origins.
 */
export function getErpCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed =
    ERP_ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
    !origin; // non-browser clients (Flutter desktop / mobile)

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : '',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-erp-api-key, x-api-key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Validates the ERP API key from the request.
 * Checks `x-erp-api-key` header first, then `x-api-key`, then `Authorization: Bearer`, then `?apiKey=` query param.
 */
export function validateErpApiKey(req: NextRequest): boolean {
  const configuredKey = process.env.ERP_API_KEY || 'elite-erp-secure-api-key-2026';

  const xErpKey = req.headers.get('x-erp-api-key');
  if (xErpKey) return xErpKey === configuredKey;

  const xApiKey = req.headers.get('x-api-key');
  if (xApiKey) return xApiKey === configuredKey;

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === configuredKey) return true;
  }

  const { searchParams } = new URL(req.url);
  const queryKey = searchParams.get('apiKey');
  if (queryKey) return queryKey === configuredKey;

  return false;
}

/**
 * Returns a 401 Unauthorized response with CORS headers for invalid ERP API key.
 */
export function erpUnauthorized(req: NextRequest): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized: Invalid or missing ERP API Key' },
    {
      status: 401,
      headers: getErpCorsHeaders(req),
    }
  );
}

/**
 * Returns a 200 OK response for CORS preflight OPTIONS requests.
 */
export function erpCorsOptions(req: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: getErpCorsHeaders(req),
  });
}

/**
 * Wraps a NextResponse with ERP CORS headers.
 */
export function withErpCors(response: NextResponse, req: NextRequest): NextResponse {
  const corsHeaders = getErpCorsHeaders(req);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (value) response.headers.set(key, value);
  });
  return response;
}
