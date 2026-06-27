'use client'

import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true)
  const waNumber = '6283836487767' // Nomor WA CS asli InoviPay
  const waMessage = encodeURIComponent('Halo InoviPay! Saya tertarik menjadi Mitra Inovi. Bisa info lebih lanjut?')
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-[260px] animate-fade-in relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-800 font-medium pr-4">
            Ada pertanyaan? Chat langsung dengan tim kami via WhatsApp! 💬
          </p>
        </div>
      )}

      {/* WA Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  )
}
