import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface JWTPayload {
  userId: string
  role: 'ADMIN' | 'RESELLER'
  sessionId?: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JWTPayload
}

// Helper untuk extract user dari request
export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    return await verifyToken(authHeader.slice(7))
  } catch {
    return null
  }
}

// Guard: harus login
export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getAuthUser(req)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

// Guard: harus admin
export async function requireAdmin(req: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(req)
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN')
  return user
}
