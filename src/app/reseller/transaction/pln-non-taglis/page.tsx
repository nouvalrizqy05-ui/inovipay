'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Zap, X, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function PlnNonTaglisPage() {
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
    if (customerId.length < 10) return toast.error('Nomor Registrasi tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (customerId.startsWith('5')) {
        setBillData({
          name: 'BAPAK JOKO (PESTA NIKAH)',
          id: customerId,
          unit: 'UP3 BANDUNG',
          transactionType: 'PENERANGAN SEMENTARA',
          billAmount: 350000,
          penalty: 0,
          adminFee: 2500,
        })
      } else {
        toast.error('Data registrasi tidak ditemukan atau sudah dibayar.')
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
        productCode: 'PLN_NONTAGLIS',
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
        productName="PLN Non-Taglis"
        productIcon="🔌"
        details={[
          { label: 'No Registrasi/BP', value: customerId },
          { label: 'Nama', value: billData?.name || '-' },
          { label: 'Jenis Transaksi', value: billData?.transactionType || '-' },
          { label: 'Unit PLN', value: billData?.unit || '-' },
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
    productName: 'PLN Non-Taglis',
    productIcon: '🔌',
    details: [
      { label: 'No Registrasi', value: customerId, highlight: true },
      { label: 'Nama Pemohon', value: billData.name },
      { label: 'Jenis', value: billData.transactionType },
      { label: 'Total Tagihan', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="PLN Non-Taglis" />

      <div className="px-4 mb-4">
        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-xl border border-blue-100 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>PLN Non-Taglis (Non-Tagihan Listrik) digunakan untuk pembayaran sambungan sementara, denda, atau biaya ubah daya.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 mx-4 relative">
        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Registrasi / BP</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Zap className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value.replace(/\D/g, '')); setBillData(null) }}
            placeholder="13 Digit Nomor Registrasi"
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
          disabled={loadingInfo || customerId.length < 10}
          className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loadingInfo ? 'Mengecek Data...' : 'Cek Tagihan'}
        </button>
      </div>

      {/* Bill Details */}
      {billData && (
        <div className="px-4 mb-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Jenis Transaksi</span>
                <span className="font-medium text-right w-1/2">{billData.transactionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unit PLN</span>
                <span className="font-medium">{billData.unit}</span>
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
