// src/app/api/auth/google/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Google authentication has been removed. Please log in using your university email and password.',
    },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Google authentication has been removed. Please log in using your university email and password.',
    },
    { status: 404 }
  );
}
