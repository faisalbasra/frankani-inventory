import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login'];

// Simple session validation (in a real app, you'd validate against a database)
function isValidSession(token: string): boolean {
  // Basic validation: check if token exists and follows expected format
  return token && token.startsWith('frankani_session_');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('frankani_auth');
  const sessionToken = sessionCookie?.value;

  // If no valid session, redirect to login
  if (!sessionToken || !isValidSession(sessionToken)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};