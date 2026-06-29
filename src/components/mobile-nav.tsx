'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Tag, BookOpen, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '@/lib/api-client'

export default function MobileNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    api.get('/notifications').then(r => setUnread(r.data.unreadCount ?? 0)).catch(() => {})
  }, [])

  const items = [
    { href: '/reseller/dashboard',     label: 'Beranda',   icon: Home },
    { href: '/reseller/transactions',  label: 'Riwayat',   icon: History },
    { href: '/reseller/promo',         label: 'Promo',     icon: Tag },
    { href: '/reseller/official',      label: 'Official',  icon: BookOpen },
    { href: '/reseller/profile',       label: 'Profile',   icon: User },
  ]

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === '/reseller/dashboard' && pathname === '/reseller')
          return (
            <Link key={href} href={href}
              className={`mobile-nav-item flex-1 ${active ? 'active' : ''}`}>
              <Icon className={`w-5 h-5 ${active ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-semibold mt-0.5 ${active ? 'text-orange-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
