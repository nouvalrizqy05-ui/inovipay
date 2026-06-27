import { NextResponse } from 'next/server'

// JWT stateless — logout cukup hapus token di client
// Endpoint ini untuk keperluan logging atau blacklist token di masa depan
export async function POST() {
  return NextResponse.json({ message: 'Logout berhasil' })
}
