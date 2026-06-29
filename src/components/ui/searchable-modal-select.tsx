'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, ChevronDown, X, Check } from 'lucide-react'

export interface Option {
  id: string
  nama: string
}

export interface SearchableModalSelectProps {
  options: Option[]
  value: string
  onChange: (id: string, nama: string) => void
  placeholder: string
  disabled?: boolean
  icon: React.ElementType
}

export function SearchableModalSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  icon: Icon
}: SearchableModalSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Find the selected option's name for display
  const selectedName = options.find((opt) => opt.id === value)?.nama || ''

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.nama.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const handleSelect = (id: string, nama: string) => {
    onChange(id, nama)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Trigger Button (looks like an input) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl p-4 flex items-center justify-between outline-none transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-white hover:border-[#F97316] hover:shadow-lg hover:shadow-[#F97316]/10'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className={`truncate ${!selectedName ? 'text-gray-400' : 'font-semibold'}`}>
            {selectedName || placeholder}
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </button>

      {/* Full-screen Modal using Portal to escape stacking contexts */}
      {isOpen && isMounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="pt-8 pb-4 px-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{placeholder}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Cari wilayah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#F97316]/50 outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* List Options */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filteredOptions.length > 0 ? (
              <div className="space-y-1">
                {filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id, opt.nama)}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-colors hover:bg-orange-50 group"
                  >
                    <span className={`text-sm flex items-center gap-3 ${value === opt.id ? 'font-bold text-[#F97316]' : 'text-gray-700 group-hover:text-[#F97316]'}`}>
                      <Icon className={`w-4 h-4 ${value === opt.id ? 'text-[#F97316]' : 'text-gray-400 group-hover:text-[#F97316]'}`} />
                      {opt.nama}
                    </span>
                    {value === opt.id && (
                      <Check className="w-5 h-5 text-[#F97316]" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p>Pencarian &quot;{searchQuery}&quot; tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
