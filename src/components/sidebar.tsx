'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, CreditCard, Wallet, Users, Settings,
  LogOut, Bell, ChevronDown, Package, FileText, Menu, X
} from 'lucide-react'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'

interface User { id: string; name: string; email: string; role: string; status: string }

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
    fetchBalance()
    fetchNotifications()
  }, [])

  async function fetchBalance() {
    try {
      const res = await api.get(isAdmin ? '/admin/dashboard' : '/reseller/dashboard')
      if (!isAdmin) setBalance(res.data.wallet?.available ?? 0)
    } catch {}
  }

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications')
      setUnread(res.data.unreadCount ?? 0)
    } catch {}
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const resellerNav = [
    { href: '/reseller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reseller/transactions', label: 'Transaksi', icon: CreditCard },
    { href: '/reseller/deposit', label: 'Deposit Saldo', icon: Wallet },
    { href: '/reseller/wallet', label: 'Mutasi Saldo', icon: FileText },
    { href: '/reseller/profile', label: 'Profil', icon: Settings },
  ]

  const adminNav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/resellers', label: 'Reseller', icon: Users },
    { href: '/admin/deposits', label: 'Deposit', icon: Wallet },
    { href: '/admin/transactions', label: 'Transaksi', icon: CreditCard },
    { href: '/admin/products', label: 'Produk', icon: Package },
    { href: '/admin/config', label: 'Konfigurasi', icon: Settings },
  ]

  const navItems = isAdmin ? adminNav : resellerNav

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="font-bold text-gray-900">InoviPay</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          {!isAdmin && (
            <p className="text-sm font-bold text-blue-600 mt-1">{formatRupiah(balance)}</p>
          )}
          {isAdmin && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Notification + Logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link href={isAdmin ? '/admin/notifications' : '/reseller/notifications'} onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
          <Bell className="w-4 h-4" />
          Notifikasi
          {unread > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
          )}
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-200">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
