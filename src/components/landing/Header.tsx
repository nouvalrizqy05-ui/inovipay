'use client'

import Link from 'next/link'
import { Rocket, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import InstallPwaButton from '../InstallPwaButton'

const navLinks = [
  { href: '#fitur', label: 'Keunggulan' },
  { href: '#katalog', label: 'Produk' },
  { href: '#simulasi', label: 'Simulasi Profit' },
  { href: '#testimoni', label: 'Testimoni' },
  { href: '#faq', label: 'FAQ' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dashboardUrl, setDashboardUrl] = useState('/auth/login')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setIsLoggedIn(true)
        setDashboardUrl(user.role === 'ADMIN' ? '/admin/dashboard' : '/reseller/dashboard')
      } catch (e) {}
    }
  }, [])

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/logo-orange.png" alt="InoviStore Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
              InoviStore
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-gray-600 hover:text-amber-600 font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <InstallPwaButton className="hidden lg:flex !px-4 !py-2.5 !text-sm" />
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="hidden sm:inline-flex bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block text-amber-600 font-bold hover:text-amber-700 px-4 py-2">
                  Masuk
                </Link>
                <Link href="/auth/register" className="hidden sm:inline-flex bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Daftar Mitra
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-amber-50 hover:text-amber-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-white bg-amber-500 font-bold hover:bg-amber-600 transition-colors text-center shadow-sm"
              >
                Ke Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-white bg-amber-500 font-bold hover:bg-amber-600 transition-colors text-center shadow-sm"
                >
                  Daftar Mitra Gratis
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-amber-600 font-bold hover:bg-amber-50 transition-colors text-center border-2 border-amber-100"
                >
                  Masuk
                </Link>
              </>
            )}
            <InstallPwaButton className="w-full !text-sm !py-3" />
          </nav>
        </div>
      )}
    </header>
  )
}
