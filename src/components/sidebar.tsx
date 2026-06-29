'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, CreditCard, Wallet, Users, Settings,
  LogOut, Bell, Package, Image, FileText, Menu, X, Star
} from 'lucide-react'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'

interface User { id: string; name: string; email: string; role: string; status: string; tier?: string }

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState(0)
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    if (!isAdmin) {
      api.get('/reseller/dashboard').then(r => setBalance(r.data.wallet?.available ?? 0)).catch(() => {})
    }
    api.get('/notifications').then(r => setUnread(r.data.unreadCount ?? 0)).catch(() => {})
  }, [isAdmin])

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const resellerNav = [
    { href: '/reseller/dashboard',     label: 'Beranda',        icon: LayoutDashboard },
    { href: '/reseller/transactions',  label: 'Transaksi',      icon: CreditCard },
    { href: '/reseller/deposit',       label: 'Deposit Saldo',  icon: Wallet },
    { href: '/reseller/wallet',        label: 'Mutasi Saldo',   icon: FileText },
    { href: '/reseller/kasir',         label: 'Kasir Digital',  icon: Settings },
    { href: '/reseller/catatan',       label: 'Catatan',        icon: FileText },
    { href: '/reseller/promo',         label: 'Promo',          icon: Star },
    { href: '/reseller/profile',       label: 'Profil',         icon: Users },
  ]

  const adminNav = [
    { href: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
    { href: '/admin/resellers',     label: 'Reseller',      icon: Users },
    { href: '/admin/deposits',      label: 'Deposit',       icon: Wallet },
    { href: '/admin/transactions',  label: 'Transaksi',     icon: CreditCard },
    { href: '/admin/products',      label: 'Produk',        icon: Package },
    { href: '/admin/banners',       label: 'Banner',        icon: Image },
    { href: '/admin/config',        label: 'Konfigurasi',   icon: Settings },
  ]

  const navItems = isAdmin ? adminNav : resellerNav

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo-orange.png" alt="InoviStore Logo" className="w-full h-full object-contain" />
            </div>
            <div>
            <span className="font-black text-gray-900">InoviStore</span>
            <p className="text-[10px] text-gray-400">PPOB Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="bg-[#E6F7F5] rounded-xl p-3">
          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          {!isAdmin ? (
            <>
              <p className="text-sm font-black text-[#00B4A0] mt-1">{formatRupiah(balance)}</p>
              <span className="text-[10px] bg-[#00B4A0] text-white px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                {user?.tier?.toLowerCase().replace('_',' ') ?? 'Reseller'}
              </span>
            </>
          ) : (
            <span className="text-[10px] bg-[#00B4A0] text-white px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#00B4A0] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <Link href={isAdmin ? '/admin/notifications' : '/reseller/notifications'} onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">
          <Bell className="w-4 h-4" />
          Notifikasi
          {unread > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-3.5 left-4 z-50 bg-white p-2 rounded-xl shadow-md border border-gray-200">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
