import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check for token in cookies or from headers
  let token = request.cookies.get('token')?.value
  
  // If not in cookies, try to get from Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  // ============================================
  // RUTAS PÚBLICAS
  // ============================================
  const publicRoutes = ['/login', '/register', '/']
  
  if (publicRoutes.includes(path)) {
    // Si está autenticado y trata de ir a login, redirigir al dashboard
    if (token && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // ============================================
  // RUTAS PROTEGIDAS (Admin Dashboard)
  // ============================================
  if (path.startsWith('/dashboard')) {
    // Sin token → redirigir a login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
    
    // Con token válido → permitir acceso
    return NextResponse.next()
  }

  // ============================================
  // OTRAS RUTAS PROTEGIDAS
  // ============================================
  const protectedRoutes = ['/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}