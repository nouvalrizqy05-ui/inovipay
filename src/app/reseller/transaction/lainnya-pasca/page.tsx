'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Hash, X, CheckCircle2, ChevronRight, FileText, CreditCard, Shield, GraduationCap, Car, Heart, Gift } from 'lucide-react'
import { toast } from 'sonner'

const EXTRA_CATEGORIES = [
  { id: 'KARTU_KREDIT', name: 'Kartu Kredit', icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'ASURANSI', name: 'Asuransi', icon: Shield, color: 'text-rose-600 bg-rose-50' },
  { id: 'PENDIDIKAN', name: 'Pendidikan', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
  { id: 'SAMSAT', name: 'E-Samsat', icon: Car, color: 'text-orange-600 bg-orange-50' },
  { id: 'ZAKAT', name: 'Zakat', icon: Heart, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'DONASI', name: 'Donasi', icon: Gift, color: 'text-pink-600 bg-pink-50' },
]

export default function LainnyaPascaPage() {
  const [category, setCategory] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState('')
  
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  const [billData, setBillData] = useState<any>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  const checkBill = () => {
    if (!category) return toast.error('Pilih kategori pembayaran')
    if (customerId.length < 5) return toast.error('Nomor Pelanggan tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (customerId.startsWith('1')) {
        setBillData({
          name: 'NAMA PELANGGAN',
          id: customerId,
          categoryName: EXTRA_CATEGORIES.find(c => c.id === category)?.name,
          billAmount: 250000,
          penalty: 0,
          adminFee: 2500,
        })
      } else {
        toast.error('Tagihan tidak ditemukan atau sudah dibayar.')
        setBillData(null)
      }
      setLoadingInfo(false)
    }, 1200)
  }

  const handleBuyClick = () => {
    if (!billData) return
    setShowConfirm(true)
  }

  const total = billData ? billData.billAmount + billData.penalty + billData.adminFee : 0

  const handleConfirm = async (pin: string) => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: category || 'LAINNYA_PASCA',
        targetNumber: customerId,
        pin
      })
      setShowConfirm(false)
      setReceiptTx({
        id: res.data.transaction?.id || `TRX-${Date.now()}`,
        date: new Date(),
        amount: total,
      })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transaksi gagal')
    } finally {
      setIsProcessing(false)
    }
  }

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={EXTRA_CATEGORIES.find(c => c.id === category)?.name || 'Tagihan Pascabayar'}
        productIcon="🧾"
        details={[
          { label: 'Nomor Pelanggan', value: customerId },
          { label: 'Nama', value: billData?.name || '-' },
          { label: 'Kategori', value: billData?.categoryName || '-' },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setCustomerId('')
          setBillData(null)
          setCategory(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = billData ? {
    productName: billData.categoryName,
    productIcon: '🧾',
    details: [
      { label: 'No Pelanggan', value: customerId, highlight: true },
      { label: 'Nama', value: billData.name },
      { label: 'Tagihan', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Lainnya (Pascabayar)" />

      {/* Category Selection */}
      <div className="px-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Kategori Tagihan</label>
        <div className="grid grid-cols-3 gap-3">
          {EXTRA_CATEGORIES.map(cat => {
            const isSelected = category === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id)
                  setBillData(null)
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-50/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 text-orange-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${cat.color}`}>
                  <cat.icon className="w-5 h-5 drop-shadow-sm" strokeWidth={1.5} />
                </div>
                <div className={`text-[10px] font-bold px-1 text-center ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                  {cat.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input Section */}
      {category && (
        <div className="bg-white mx-4 p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Kontrak / Pelanggan</label>
          <div className="relative flex items-center mb-4">
            <div className="absolute left-4 text-gray-400">
              <Hash className="w-5 h-5" />
            </div>
            <input 
              type="tel"
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value.replace(/\D/g, '')); setBillData(null) }}
              placeholder="Masukkan ID Pelanggan"
              className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-transparent transition-all"
            />
            {customerId && (
              <button 
                onClick={() => { setCustomerId(''); setBillData(null) }}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button 
            onClick={checkBill}
            disabled={loadingInfo || customerId.length < 5}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loadingInfo ? 'Mengecek Tagihan...' : 'Cek Tagihan'}
          </button>
        </div>
      )}

      {/* Bill Details */}
      {billData && (
        <div className="px-4 mb-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Kategori Tagihan</span>
                <span className="font-medium text-right w-1/2">{billData.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Tagihan</span>
                <span className="font-bold">{formatRupiah(billData.billAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${billData ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto bg-white border border-teal-100 shadow-[0_-10px_40px_-15px_rgba(0,180,160,0.3)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Bayar (Inc. Admin)</p>
            <p className="text-lg font-black text-[#00B4A0]">
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className="px-6 py-2.5 bg-[#00B4A0] hover:bg-[#009B8A] text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-colors disabled:opacity-50 disabled:shadow-none"
          >
            Lanjut Bayar
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        isLoading={isProcessing}
        data={modalData}
      />
    </div>
  )
}
