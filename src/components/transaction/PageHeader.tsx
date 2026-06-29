import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PageHeader({ title }: { title: string }) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-3 mb-6 bg-white p-4 -mx-4 -mt-4 border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <button 
        onClick={() => router.back()} 
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-lg font-black text-gray-900">{title}</h1>
    </div>
  )
}
