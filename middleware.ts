import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  const hostname = request.headers.get('host') || '';
  
  const currentHost = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3001';
  
  const isRootDomain = 
    hostname === 'localhost:3001' || 
    hostname === 'platform.com' || 
    hostname === 'www.platform.com';

  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/static') || 
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isRootDomain) {
    if (url.pathname === '/') {
       return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }


  const subdomain = hostname.split('.')[0];

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
