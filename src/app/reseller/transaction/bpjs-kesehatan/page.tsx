'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { HeartPulse, X, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function BpjsPage() {
  const [customerId, setCustomerId] = useState('')
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  const [billData, setBillData] = useState<any>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [monthsCount, setMonthsCount] = useState(1)

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  const checkBill = () => {
    if (customerId.length < 11) return toast.error('Nomor VA/NIK tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      // TODO: replace with real API call
      if (customerId.startsWith('8')) {
        setBillData({
          name: 'AHMAD FAUZI',
          id: customerId,
          class: 'Kelas I',
          status: 'AKTIF',
          members: 3, // Jumlah tanggungan
          baseAmount: 150000 * 3, // Per bulan total
          adminFee: 2500,
        })
        setMonthsCount(1)
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

  const totalBill = billData ? billData.baseAmount * monthsCount : 0
  const total = billData ? totalBill + billData.adminFee : 0

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: 'BPJS_KES',
        targetNumber: customerId,
        pin: '123456'
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
        productName="BPJS Kesehatan"
        productIcon="🏥"
        details={[
          { label: 'No VA / NIK', value: customerId },
          { label: 'Nama Peserta', value: billData?.name || '-' },
          { label: 'Kelas', value: billData?.class || '-' },
          { label: 'Jumlah Bulan', value: `${monthsCount} Bulan` },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setCustomerId('')
          setBillData(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = billData ? {
    productName: 'BPJS Kesehatan',
    productIcon: '🏥',
    details: [
      { label: 'No VA', value: customerId, highlight: true },
      { label: 'Nama Peserta', value: billData.name },
      { label: 'Bayar Untuk', value: `${monthsCount} Bulan (${billData.members} Orang)` },
      { label: 'Tagihan Pokok', value: formatRupiah(totalBill) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="BPJS Kesehatan" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">No VA Keluarga / NIK</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value.replace(/\D/g, '')); setBillData(null) }}
            placeholder="Contoh: 8888800012345678"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
          disabled={loadingInfo || customerId.length < 11}
          className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loadingInfo ? 'Mengecek Tagihan...' : 'Cek Tagihan'}
        </button>
      </div>

      {/* Bill Details */}
      {billData && (
        <div className="px-4 mb-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-900">{billData.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{billData.id}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${billData.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {billData.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-dashed border-gray-200">
                <div>
                  <p className="text-gray-500 text-[10px] mb-1">Kelas Rawat</p>
                  <p className="font-semibold text-gray-900">{billData.class}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] mb-1">Jumlah Peserta</p>
                  <p className="font-semibold text-gray-900">{billData.members} Orang</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Pilih Bulan Pembayaran</h3>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
              <button 
                onClick={() => setMonthsCount(Math.max(1, monthsCount - 1))}
                className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="font-black text-xl text-emerald-600">{monthsCount}</span>
                <span className="text-xs font-bold text-gray-500 ml-1">Bulan</span>
              </div>
              <button 
                onClick={() => setMonthsCount(Math.min(12, monthsCount + 1))}
                className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-[#FFF9E5] border border-[#FFEAB3] p-4 rounded-xl text-xs text-yellow-800 space-y-1">
            <p><strong>Penting:</strong> Pembayaran BPJS diproses oleh sistem BPJS. Aktivasi status max. 1x24 jam kerja.</p>
            <p>Bayar sebelum tanggal 10 setiap bulan untuk menghindari denda.</p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${billData ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto bg-white border border-emerald-100 shadow-[0_-10px_40px_-15px_rgba(16,185,129,0.2)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Bayar</p>
            <p className="text-lg font-black text-emerald-600">
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-colors"
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
