'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api-client'
import { usePathname } from 'next/navigation'

export default function MobileHeader() {
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()
  const isDashboard = pathname === '/reseller/dashboard'

  useEffect(() => {
    api.get('/notifications').then(r => setUnread(r.data.unreadCount ?? 0)).catch(() => {})
  }, [])

  return (
    <header className={`px-4 py-3 sticky top-0 z-40 transition-colors ${isDashboard ? 'bg-orange-500 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <Link href="/reseller/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden">
            <img src={isDashboard ? "/logo-transparent.png" : "/logo-orange.png"} alt="InoviStore Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-lg tracking-tight">InoviStore</span>
        </Link>
        
        <div className="flex items-center gap-1">
          <Link href="/reseller/notifications" className="relative p-2 rounded-full hover:bg-black/5">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
          </Link>
          <a href="https://api.whatsapp.com/send?phone=6283836487767&text=Halo%2C%20saya%20mau%20bertanya%20tentang%20InoviStore%20dan%20Mitra%20Inovi." target="_blank" rel="noreferrer" className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${isDashboard ? 'bg-white text-orange-500 shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
            Bantuan?
          </a>
        </div>
      </div>
    </header>
  )
}
