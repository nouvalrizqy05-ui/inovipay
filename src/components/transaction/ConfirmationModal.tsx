import React, { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import { X, Loader2, AlertTriangle, Wallet, Shield, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface DetailItem {
  label: string
  value: string | React.ReactNode
  highlight?: boolean
}

export interface ConfirmationModalData {
  productName: string
  productIcon: string
  details: DetailItem[]
  totalAmount: number
  currentBalance: number
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
  isLoading: boolean
  data: ConfirmationModalData | null
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  data
}: ConfirmationModalProps) {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [pinError, setPinError] = useState('')

  if (!isOpen || !data) return null

  const isInsufficientBalance = data.currentBalance < data.totalAmount
  const remainingBalance = data.currentBalance - data.totalAmount

  const handleConfirm = () => {
    if (!pin || pin.length < 6) {
      setPinError('PIN harus 6 digit')
      return
    }
    setPinError('')
    onConfirm(pin)
  }

  const handleClose = () => {
    if (!isLoading) {
      setPin('')
      setPinError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={handleClose} />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Handle Bar for mobile swipe hint */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Konfirmasi</h3>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="overflow-y-auto p-5 space-y-5">
          
          {/* Product Header Info */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
              {data.productIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {data.productName}
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-3 px-1">
            {data.details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`text-sm text-right ${item.highlight ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Payment Summary */}
          <div className="bg-[#E6F7F5] rounded-2xl p-4 space-y-3 border border-teal-100/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Saldo Saat Ini</span>
              <span className="font-semibold">{formatRupiah(data.currentBalance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total Bayar</span>
              <span className="text-xl font-black text-[#00B4A0]">
                {formatRupiah(data.totalAmount)}
              </span>
            </div>
            <div className="pt-3 border-t border-teal-200/50 flex justify-between items-center text-sm">
              <span className="text-gray-600">Sisa Saldo Nanti</span>
              <span className={`font-bold ${isInsufficientBalance ? 'text-red-500' : 'text-gray-900'}`}>
                {isInsufficientBalance ? 'Kurang ' : ''}
                {formatRupiah(Math.abs(remainingBalance))}
              </span>
            </div>
          </div>

          {/* Warning Insufficient Balance */}
          {isInsufficientBalance && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3 text-red-600">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">
                Saldo tidak mencukupi untuk transaksi ini. Silakan isi saldo terlebih dahulu.
              </p>
            </div>
          )}

          {/* PIN Input */}
          {!isInsufficientBalance && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[#00B4A0]" />
                <span className="text-sm font-bold text-gray-800">Konfirmasi PIN</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Masukkan PIN yang sama dengan PIN login Anda untuk melanjutkan.</p>
              <div className="relative">
                <input 
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError('') }}
                  placeholder="● ● ● ● ● ●"
                  className={`w-full text-center text-xl tracking-[0.5em] font-mono py-3 px-4 pr-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B4A0] transition-all ${pinError ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'}`}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPin(!showPin)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pinError && <p className="text-xs text-red-500 mt-1.5 font-semibold">{pinError}</p>}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-2 mt-auto">
          {isInsufficientBalance ? (
            <Link 
              href="/reseller/deposit"
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
            >
              <Wallet className="w-5 h-5" />
              Top Up Saldo
            </Link>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isLoading || pin.length < 6}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Konfirmasi &amp; Bayar
                </>
              )}
            </button>
          )}
          
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full mt-3 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  )
}
