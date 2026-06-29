'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import api from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { Bell, CheckCheck, CheckCircle2, XCircle, Wallet, AlertTriangle, RefreshCw, Megaphone, Gift, Info } from 'lucide-react'
import { toast } from 'sonner'

const NOTIF_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  TRANSACTION_SUCCESS: { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
  TRANSACTION_FAILED:  { icon: XCircle,      color: 'text-red-600',  bg: 'bg-red-50' },
  DEPOSIT_APPROVED:    { icon: Wallet,       color: 'text-teal-600', bg: 'bg-teal-50' },
  DEPOSIT_REJECTED:    { icon: XCircle,      color: 'text-red-600',  bg: 'bg-red-50' },
  LOW_BALANCE_ALERT:   { icon: AlertTriangle,color: 'text-orange-600',bg: 'bg-orange-50' },
  REFUND:              { icon: RefreshCw,    color: 'text-blue-600', bg: 'bg-blue-50' },
  SYSTEM:              { icon: Megaphone,    color: 'text-indigo-600',bg: 'bg-indigo-50' },
  PROMO:               { icon: Gift,         color: 'text-pink-600', bg: 'bg-pink-50' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications || [])
    }).finally(() => setLoading(false))
    // Automatically mark as read when user opens the page
    api.patch('/notifications').catch(() => {})
  }, [])

  async function markAllRead() {
    await api.patch('/notifications').catch(() => {})
    setNotifications(n => n.map(x => ({ ...x, isRead: true })))
    toast.success('Semua notifikasi ditandai dibaca')
  }

  if (loading) return <Loading />

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-black text-gray-900">Notifikasi</h1>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-orange-500 font-bold hover:text-orange-600 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Baca Semua
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12">
          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const config = NOTIF_MAP[n.type] || { icon: Info, color: 'text-gray-500', bg: 'bg-gray-100' }
            const IconComponent = config.icon

            return (
              <div key={n.id}
                className={`flex gap-3 p-4 rounded-2xl border transition-colors relative overflow-hidden ${
                  n.isRead ? 'bg-white border-gray-100 shadow-sm' : 'bg-orange-50/50 border-orange-100 shadow-sm'
                }`}>
                
                {/* Unread indicator line */}
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <IconComponent className={`w-5 h-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm font-bold truncate pr-2 ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                    <p className="text-[10px] font-medium text-gray-400 flex-shrink-0 mt-0.5">{formatDate(n.createdAt)}</p>
                  </div>
                  <p className={`text-xs ${n.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'} leading-relaxed`}>{n.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
