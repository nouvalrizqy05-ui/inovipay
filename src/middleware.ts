import { NextRequest, NextResponse } from 'next/server'

// Simple rate limiter store (in-memory, reset on restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10 // max attempts per window for auth

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // --- Rate limiting for auth API endpoints (P0) ---
  if (pathname.startsWith('/api/auth/')) {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' },
        { status: 429 }
      )
    }
  }

  // --- Route protection for dashboard pages ---
  const token = req.cookies.get('token')?.value
  const isAuthPage = pathname.startsWith('/auth/')
  const isProtectedPage = pathname.startsWith('/admin') || pathname.startsWith('/reseller')

  // If accessing protected page without token cookie, check authorization header
  if (isProtectedPage && !token) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/reseller/:path*',
    '/api/auth/:path*',
  ],
}
