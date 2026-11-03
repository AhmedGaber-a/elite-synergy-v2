import { NextResponse } from 'next/server';

export const erpCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-erp-api-key',
};

export function verifyErpRequest(request: Request): NextResponse | null {
  const apiKey = request.headers.get('x-erp-api-key');
  const validKey = process.env.ERP_API_KEY;

  if (!validKey || apiKey !== validKey) {
    return NextResponse.json(
      { error: 'غير مصرح للوصول: مفتاح ERP_API_KEY غير صالح' },
      { status: 401, headers: erpCorsHeaders }
    );
  }

  return null;
}