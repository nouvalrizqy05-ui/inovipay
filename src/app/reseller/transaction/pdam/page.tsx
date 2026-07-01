'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Droplet, X, User, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useWilayah } from '@/hooks/useWilayah'
import Loading from '@/components/ui/loading'

export default function PdamPage() {
  const { 
    provinces, 
    regencies, 
    loadingProvinces, 
    loadingRegencies, 
    isFallbackMode, 
    fetchRegencies, 
    resetRegencies 
  } = useWilayah()

  const [provinceId, setProvinceId] = useState('')
  const [regencyId, setRegencyId] = useState('')
  const [manualRegion, setManualRegion] = useState('') // For fallback mode
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

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setProvinceId(code)
    setRegencyId('')
    setBillData(null)
    if (code) {
      fetchRegencies(code)
    } else {
      resetRegencies()
    }
  }

  const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegencyId(e.target.value)
    setBillData(null)
  }

  // Get selected region name
  const regionName = useMemo(() => {
    if (isFallbackMode) return manualRegion
    if (!regencyId) return ''
    const reg = regencies.find(r => r.code === regencyId)
    return reg ? `PDAM ${reg.name}` : ''
  }, [isFallbackMode, manualRegion, regencyId, regencies])

  const isValidToCek = isFallbackMode 
    ? manualRegion.trim().length > 0 && customerId.length >= 4 
    : regencyId !== '' && customerId.length >= 4

  const checkBill = () => {
    if (!isValidToCek) return toast.error('Pilih wilayah PDAM dan masukkan nomor pelanggan')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      // Mocking fetch to Digiflazz
      if (customerId.startsWith('1')) {
        setBillData({
          name: 'SITI AMINAH',
          id: customerId,
          regionName: regionName,
          period: 'Juni 2026',
          usage: '15 m³',
          billAmount: 85000,
          penalty: 0,
          adminFee: 2500,
        })
      } else {
        toast.error('Tagihan tidak ditemukan atau sudah lunas.')
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
        productCode: 'PDAM',
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
        productName="Pembayaran PDAM"
        productIcon="💧"
        details={[
          { label: 'Wilayah', value: billData?.regionName || '-' },
          { label: 'No Pelanggan', value: customerId },
          { label: 'Nama Pelanggan', value: billData?.name || '-' },
          { label: 'Periode Tagihan', value: billData?.period || '-' },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setCustomerId('')
          setBillData(null)
          setRegencyId('')
          setProvinceId('')
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = billData ? {
    productName: 'Tagihan PDAM',
    productIcon: '💧',
    details: [
      { label: 'Wilayah', value: billData.regionName },
      { label: 'No Pelanggan', value: customerId, highlight: true },
      { label: 'Nama Pelanggan', value: billData.name },
      { label: 'Tagihan Pokok', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="PDAM" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
        <label className="block text-sm font-bold text-gray-700 mb-2">Wilayah PDAM</label>
        
        {isFallbackMode ? (
          <input 
            type="text"
            value={manualRegion}
            onChange={(e) => { setManualRegion(e.target.value); setBillData(null) }}
            placeholder="Masukkan Nama Kota/Kabupaten PDAM"
            className="w-full mb-4 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] transition-all"
          />
        ) : (
          <div className="space-y-3 mb-4">
            <div className="relative">
              <select
                value={provinceId}
                onChange={handleProvinceChange}
                disabled={loadingProvinces}
                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] appearance-none"
              >
                <option value="">{loadingProvinces ? 'Memuat Provinsi...' : 'Pilih Provinsi...'}</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={regencyId}
                onChange={handleRegencyChange}
                disabled={!provinceId || loadingRegencies}
                className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] appearance-none disabled:opacity-50"
              >
                <option value="">{loadingRegencies ? 'Memuat Kabupaten/Kota...' : 'Pilih Kabupaten/Kota...'}</option>
                {regencies.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
        
        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Pelanggan</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Droplet className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value.replace(/\D/g, '')); setBillData(null) }}
            placeholder="Nomor pelanggan PDAM"
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
          disabled={loadingInfo || !isValidToCek}
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
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Wilayah</span>
                <span className="font-medium text-right w-1/2">{billData.regionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Periode Tagihan</span>
                <span className="font-medium">{billData.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pemakaian Air</span>
                <span className="font-medium">{billData.usage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tagihan Pokok</span>
                <span className="font-bold">{formatRupiah(billData.billAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Denda</span>
                <span className="font-medium">{formatRupiah(billData.penalty)}</span>
              </div>
            </div>
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
