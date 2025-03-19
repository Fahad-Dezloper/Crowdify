import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: ['/room', '/room/:id']
}

export function middleware(request: NextRequest){
    const authSessionToken = request.cookies.get('authjs.session-token') || request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');

    const url = request.nextUrl;

    const protectedRoutes = ['/room', '/room/'];

    if(!authSessionToken && protectedRoutes.some((route) => url.pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', url));
    }

    return NextResponse.next();
}