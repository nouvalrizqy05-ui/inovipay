'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Phone, X, User } from 'lucide-react'
import { toast } from 'sonner'

const OPERATOR_PREFIXES: Record<string, string[]> = {
  'Telkomsel Halo': ['0811', '0812'],
  'Indosat Matrix': ['0814', '0815', '0816'],
  'XL Prioritas': ['0817', '0818', '0819'],
  'Smartfren Pascabayar': ['0881', '0882', '0888'],
}

function getOperator(phone: string): string | null {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) cleaned = '0' + cleaned.substring(2)
  if (cleaned.length < 4) return null
  const prefix = cleaned.substring(0, 4)
  for (const [op, prefixes] of Object.entries(OPERATOR_PREFIXES)) {
    if (prefixes.includes(prefix)) return op
  }
  return null
}

export default function HpPascaPage() {
  const [phone, setPhone] = useState('')
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

  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('62')) cleanPhone = '0' + cleanPhone.substring(2)
  const opName = getOperator(cleanPhone)

  const checkBill = () => {
    if (cleanPhone.length < 10) return toast.error('Nomor HP tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (cleanPhone.startsWith('0811')) { // Mocking Telkomsel Halo
        setBillData({
          name: 'DIANA PUTRI',
          id: cleanPhone,
          operator: 'Telkomsel Halo',
          period: 'Juni 2026',
          billAmount: 110000,
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

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: 'HP_PASCA',
        targetNumber: cleanPhone,
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
        productName="HP Pascabayar"
        productIcon="📱"
        details={[
          { label: 'Nomor HP', value: cleanPhone },
          { label: 'Nama Pelanggan', value: billData?.name || '-' },
          { label: 'Operator', value: billData?.operator || '-' },
          { label: 'Periode Tagihan', value: billData?.period || '-' },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setPhone('')
          setBillData(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = billData ? {
    productName: 'Tagihan HP Pascabayar',
    productIcon: '📱',
    details: [
      { label: 'Nomor HP', value: cleanPhone, highlight: true },
      { label: 'Nama Pelanggan', value: billData.name },
      { label: 'Operator', value: billData.operator },
      { label: 'Tagihan Pokok', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="HP Pascabayar" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor HP (Halo, Matrix, Xplor)</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Phone className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setBillData(null) }}
            placeholder="0811xxxxxxxx"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          {phone && (
            <button 
              onClick={() => { setPhone(''); setBillData(null) }}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {phone.length >= 4 && (
          <div className="mb-4">
            {opName ? (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700`}>
                Terdeteksi: {opName}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                Operator belum diketahui
              </span>
            )}
          </div>
        )}
        
        <button 
          onClick={checkBill}
          disabled={loadingInfo || cleanPhone.length < 10}
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
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Operator</span>
                <span className="font-medium text-right">{billData.operator}</span>
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
        <div className="max-w-md mx-auto bg-white border border-green-100 shadow-[0_-10px_40px_-15px_rgba(34,197,94,0.3)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Bayar</p>
            <p className="text-lg font-black text-green-600">
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-colors"
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
