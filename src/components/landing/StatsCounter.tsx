'use client'

import { useEffect, useState, useRef } from 'react'
import { Users, ShoppingCart, TrendingUp, Globe } from 'lucide-react'

function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
      {prefix}{count.toLocaleString('id-ID')}{suffix}
    </div>
  )
}

const stats = [
  { icon: Users, label: 'Agen Aktif', target: 50, suffix: '+', color: 'bg-blue-100 text-blue-600' },
  { icon: ShoppingCart, label: 'Transaksi Berhasil', target: 1000, suffix: '+', color: 'bg-green-100 text-green-600' },
  { icon: TrendingUp, label: 'Margin Dibagikan', target: 5, prefix: 'Rp ', suffix: 'Jt+', color: 'bg-purple-100 text-purple-600' },
  { icon: Globe, label: 'Kota Terjangkau', target: 20, suffix: '+', color: 'bg-amber-100 text-amber-600' },
]

export default function StatsCounter() {
  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <AnimatedCounter target={stat.target} prefix={stat.prefix ?? ''} suffix={stat.suffix ?? ''} />
              <p className="text-gray-500 font-medium mt-2 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
