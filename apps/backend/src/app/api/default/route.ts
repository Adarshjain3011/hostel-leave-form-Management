import { NextRequest, NextResponse } from 'next/server';

import { allowCors } from '@/lib/cors';

import { value } from '@repo/common/config';

async function handler(req: NextRequest) {
  return NextResponse.json({
    message: "everything done successfully",
    data: value,
    status: 200,
    error: false,
  });
}

export const GET = allowCors(handler);


