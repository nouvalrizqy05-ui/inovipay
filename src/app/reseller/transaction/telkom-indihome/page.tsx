'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Wifi, X, User } from 'lucide-react'
import { toast } from 'sonner'

export default function TelkomIndihomePage() {
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

  const cleanId = customerId.replace(/\D/g, '')

  const checkBill = () => {
    if (cleanId.length < 6) return toast.error('Nomor Pelanggan tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (cleanId.startsWith('1')) {
        setBillData({
          name: 'PT JAYA ABADI',
          id: cleanId,
          service: 'Telkom IndiHome',
          period: 'Juni 2026',
          billAmount: 450000,
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
        productCode: 'TELKOM_INDIHOME',
        targetNumber: cleanId,
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
        productName="Tagihan IndiHome"
        productIcon="📡"
        details={[
          { label: 'Nomor Pelanggan', value: cleanId },
          { label: 'Nama Pelanggan', value: billData?.name || '-' },
          { label: 'Periode Tagihan', value: billData?.period || '-' },
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
    productName: 'Tagihan Telkom / IndiHome',
    productIcon: '📡',
    details: [
      { label: 'No. Pelanggan', value: cleanId, highlight: true },
      { label: 'Nama Pelanggan', value: billData.name },
      { label: 'Tagihan Pokok', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Telkom / IndiHome" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">No. Telepon / ID IndiHome</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Wifi className="w-5 h-5 text-red-600" />
          </div>
          <input 
            type="tel"
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value.replace(/\D/g, '')); setBillData(null) }}
            placeholder="021xxxxxx / 122xxxxxx"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
          disabled={loadingInfo || cleanId.length < 6}
          className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loadingInfo ? 'Mengecek Tagihan...' : 'Cek Tagihan'}
        </button>
      </div>

      {/* Bill Details */}
      {billData && (
        <div className="px-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Layanan</span>
                <span className="font-medium">{billData.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Periode Tagihan</span>
                <span className="font-medium">{billData.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tagihan Pokok</span>
                <span className="font-bold">{formatRupiah(billData.billAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Denda</span>
                <span className="font-medium">{formatRupiah(billData.penalty)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biaya Admin</span>
                <span className="font-medium">{formatRupiah(billData.adminFee)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${billData ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto bg-white border border-red-100 shadow-[0_-10px_40px_-15px_rgba(239,68,68,0.2)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Bayar</p>
            <p className="text-lg font-black text-red-600">
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors"
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
