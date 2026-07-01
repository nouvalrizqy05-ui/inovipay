'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Zap, X, Search, User } from 'lucide-react'
import { toast } from 'sonner'

export default function PlnPascaPage() {
  const [customerId, setCustomerId] = useState('')
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  // Mock Info State
  const [billData, setBillData] = useState<any>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)
  
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])

  useEffect(() => {
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setCustomerId(val)
    setBillData(null)
  }

  const checkBill = () => {
    if (customerId.length < 11) return toast.error('ID Pelanggan tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      // TODO: replace with real API call
      if (customerId.startsWith('1')) {
        const mockMonths = [
          { month: 'Mei 2026', amount: 150000, penalty: 0 },
          { month: 'Juni 2026', amount: 165000, penalty: 0 }
        ]
        setBillData({
          name: 'JOKO WIDODO',
          id: customerId,
          power: 'R1M/900VA',
          adminFee: 2500,
          months: mockMonths
        })
        setSelectedMonths(mockMonths.map(m => m.month))
      } else {
        toast.error('Tagihan tidak ditemukan atau sudah lunas.')
        setBillData(null)
      }
      setLoadingInfo(false)
    }, 1200)
  }

  const handleToggleMonth = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    )
  }

  const getPaymentSummary = () => {
    if (!billData) return { totalBill: 0, admin: 0, total: 0 }
    const selected = billData.months.filter((m: any) => selectedMonths.includes(m.month))
    const totalBill = selected.reduce((sum: number, m: any) => sum + m.amount + m.penalty, 0)
    const admin = selected.length > 0 ? billData.adminFee : 0
    return { totalBill, admin, total: totalBill + admin }
  }

  const { totalBill, admin, total } = getPaymentSummary()

  const handleBuyClick = () => {
    if (!billData || selectedMonths.length === 0) return toast.error('Pilih tagihan yang ingin dibayar')
    setShowConfirm(true)
  }

  const handleConfirm = async (pin: string) => {
    setIsProcessing(true)
    try {
      // Mock payment
      const res = await api.post('/transactions', {
        productCode: 'PLN_PASCA',
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
        productName="PLN Pascabayar"
        productIcon="⚡"
        details={[
          { label: 'ID Pelanggan', value: customerId },
          { label: 'Nama Pelanggan', value: billData?.name || '-' },
          { label: 'Bulan Tagihan', value: selectedMonths.join(', ') },
          { label: 'Kategori', value: 'Tagihan Listrik PLN' }
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
    productName: 'PLN Pascabayar',
    productIcon: '⚡',
    details: [
      { label: 'ID Pelanggan', value: customerId, highlight: true },
      { label: 'Nama Pelanggan', value: billData.name },
      { label: 'Bulan Dibayar', value: selectedMonths.join(', ') },
      { label: 'Tagihan Pokok', value: formatRupiah(totalBill) },
      { label: 'Biaya Admin', value: formatRupiah(admin) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="PLN Pascabayar" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">No. Meter / ID Pelanggan</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Zap className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={customerId}
            onChange={handleIdChange}
            placeholder="Contoh: 51234567890"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
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

      {/* Bill Details */}
      {billData && (
        <div className="px-4 mb-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id} - {billData.power}</p>
              </div>
            </div>

            <h3 className="font-bold text-sm text-gray-900 mb-3">Rincian Tagihan</h3>
            
            <div className="space-y-3">
              {billData.months.map((m: any, idx: number) => (
                <label key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox"
                      checked={selectedMonths.includes(m.month)}
                      onChange={() => handleToggleMonth(m.month)}
                      className="w-4 h-4 text-[#00B4A0] rounded border-gray-300 focus:ring-[#00B4A0]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 text-sm">{m.month}</span>
                      <span className="font-bold text-gray-900">{formatRupiah(m.amount + m.penalty)}</span>
                    </div>
                    {m.penalty > 0 && (
                      <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">
                        Denda: {formatRupiah(m.penalty)}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            
            {billData.months.length > 1 && (
              <p className="text-xs text-red-500 font-medium mt-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                Menunggak {billData.months.length} bulan
              </p>
            )}
          </div>
          
          <div className="bg-[#FFF9E5] border border-[#FFEAB3] p-4 rounded-xl text-sm text-yellow-800">
            <strong>Catatan:</strong> Pembayaran tagihan pascabayar diproses secara real-time. Simpan struk pembayaran sebagai bukti sah.
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${billData ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto bg-white border border-teal-100 shadow-[0_-10px_40px_-15px_rgba(0,180,160,0.3)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Tagihan (Inc. Admin)</p>
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
