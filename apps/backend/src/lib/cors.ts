import { NextResponse } from 'next/server';

type NextHandler<T> = (req: T) => Promise<NextResponse>;

export const allowCors = <T extends { method: string }>(fn: NextHandler<T>) => async (req: T) => {
    const res = NextResponse.next();

    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res;
    }

    return fn(req);
};


