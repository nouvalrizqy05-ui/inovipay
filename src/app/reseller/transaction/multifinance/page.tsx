'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Landmark, X, Search, FileText } from 'lucide-react'
import { toast } from 'sonner'

const PROVIDERS = [
  { id: 'fif', name: 'FIF Group' },
  { id: 'baf', name: 'BAF (Bussan Auto Finance)' },
  { id: 'wom', name: 'WOM Finance' },
  { id: 'mcf', name: 'Mega Central Finance (MCF)' },
  { id: 'adira', name: 'Adira Finance' },
  { id: 'oto', name: 'OTO Kredit Motor' },
]

export default function MultifinancePage() {
  const [provider, setProvider] = useState<string | null>(null)
  const [contractId, setContractId] = useState('')
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
    if (!provider) return toast.error('Pilih penyedia leasing')
    if (contractId.length < 5) return toast.error('Nomor Kontrak tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (contractId.startsWith('2')) {
        setBillData({
          name: 'HENDRA SAPUTRA',
          id: contractId,
          providerName: PROVIDERS.find(p => p.id === provider)?.name,
          tenor: 'Angsuran ke-14 dari 36',
          dueDate: '25 Juni 2026',
          billAmount: 850000,
          penalty: 50000, // mock denda
          adminFee: 2500,
        })
      } else {
        toast.error('Tagihan tidak ditemukan atau kontrak sudah lunas.')
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
        productCode: 'MULTIFINANCE',
        targetNumber: contractId,
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
        productName="Angsuran Kredit"
        productIcon="🏦"
        details={[
          { label: 'Leasing', value: billData?.providerName || '-' },
          { label: 'No. Kontrak', value: contractId },
          { label: 'Nama Pelanggan', value: billData?.name || '-' },
          { label: 'Keterangan', value: billData?.tenor || '-' },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setContractId('')
          setBillData(null)
          setProvider(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = billData ? {
    productName: 'Bayar Angsuran Kredit',
    productIcon: '🏦',
    details: [
      { label: 'Leasing', value: billData.providerName },
      { label: 'No. Kontrak', value: contractId, highlight: true },
      { label: 'Nama Pelanggan', value: billData.name },
      { label: 'Angsuran Ke', value: billData.tenor },
      { label: 'Tagihan Pokok', value: formatRupiah(billData.billAmount) },
      { label: 'Denda', value: formatRupiah(billData.penalty) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Multifinance" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Penyedia Layanan / Leasing</label>
        <select
          value={provider || ''}
          onChange={(e) => { setProvider(e.target.value); setBillData(null) }}
          className="w-full mb-4 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] appearance-none"
        >
          <option value="" disabled>Pilih Leasing...</option>
          {PROVIDERS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Kontrak</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={contractId}
            onChange={(e) => {
              setContractId(e.target.value.replace(/\D/g, ''))
              setBillData(null)
            }}
            placeholder="Masukkan Nomor Kontrak"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          {contractId && (
            <button 
              onClick={() => { setContractId(''); setBillData(null) }}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button 
          onClick={checkBill}
          disabled={loadingInfo || contractId.length < 5 || !provider}
          className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loadingInfo ? 'Mengecek Tagihan...' : 'Cek Tagihan'}
        </button>
      </div>

      {/* Bill Details */}
      {billData && (
        <div className="px-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-l-2xl"></div>
            
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 pl-2">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm pl-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Leasing</span>
                <span className="font-medium text-right text-gray-900">{billData.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Angsuran Ke</span>
                <span className="font-medium text-gray-900">{billData.tenor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jatuh Tempo</span>
                <span className="font-medium text-gray-900">{billData.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tagihan Pokok</span>
                <span className="font-bold text-gray-900">{formatRupiah(billData.billAmount)}</span>
              </div>
              {billData.penalty > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Denda Keterlambatan</span>
                  <span className="font-medium">{formatRupiah(billData.penalty)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${billData ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto bg-white border border-purple-100 shadow-[0_-10px_40px_-15px_rgba(168,85,247,0.3)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Bayar (Inc. Admin)</p>
            <p className="text-lg font-black text-purple-600">
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-colors"
          >
            Bayar Sekarang
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
