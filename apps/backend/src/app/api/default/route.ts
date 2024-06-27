import { NextRequest, NextResponse } from 'next/server';

import { allowCors } from '@/lib/cors';


async function handler(req: NextRequest) {
  return NextResponse.json({
    message: "everything done successfully",
    data: null,
    status: 200,
    error: false,
  });
}

export const GET = allowCors(handler);


