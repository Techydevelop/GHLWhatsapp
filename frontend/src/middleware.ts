import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force dynamic rendering for auth-related routes
  const authRoutes = ['/dashboard', '/login', '/signup', '/integrations/marketplace']
  
  if (authRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    const response = NextResponse.next()
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login/:path*',
    '/signup/:path*',
    '/integrations/:path*',
  ],
}
