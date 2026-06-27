'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import Empty from '@/components/ui/empty'
import api from '@/lib/api-client'
import { formatDate } from '@/lib/utils'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data.notifications)).finally(() => setLoading(false))
    api.patch('/notifications').catch(() => {})
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifikasi Admin</h1>
      <div className="card">
        {notifications.length === 0 ? <Empty text="Tidak ada notifikasi" /> : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-lg border ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  </div>
                  {!n.isRead && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-gray-400 mt-2">{formatDate(n.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
