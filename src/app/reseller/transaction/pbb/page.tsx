'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Home, X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useWilayah } from '@/hooks/useWilayah'

export default function PbbPage() {
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
  const [manualRegion, setManualRegion] = useState('')

  const [nop, setNop] = useState('')
  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
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

  const regionName = useMemo(() => {
    if (isFallbackMode) return manualRegion
    if (!regencyId) return ''
    const reg = regencies.find(r => r.code === regencyId)
    return reg ? `PBB ${reg.name}` : ''
  }, [isFallbackMode, manualRegion, regencyId, regencies])

  const isValidToCek = isFallbackMode 
    ? manualRegion.trim().length > 0 && nop.length >= 18 && year
    : regencyId !== '' && nop.length >= 18 && year

  const checkBill = () => {
    if (!isValidToCek) return toast.error('Lengkapi form PBB dengan benar')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (nop.startsWith('3')) {
        setBillData({
          name: 'BAPAK SUSANTO',
          id: nop,
          regionName: regionName,
          year: year,
          address: 'JL JEND SUDIRMAN NO 12',
          billAmount: 1250000,
          penalty: 0,
          adminFee: 2500,
        })
      } else {
        toast.error('Tagihan tidak ditemukan atau SPPT PBB sudah lunas.')
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
        productCode: 'PBB',
        targetNumber: nop,
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
        productName="Pembayaran PBB"
        productIcon="🏠"
        details={[
          { label: 'Wilayah', value: billData?.regionName || '-' },
          { label: 'NOP', value: nop },
          { label: 'Nama Wajib Pajak', value: billData?.name || '-' },
          { label: 'Tahun Pajak', value: billData?.year || '-' },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setNop('')
          setBillData(null)
          setRegencyId('')
          setProvinceId('')
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = billData ? {
    productName: 'Tagihan PBB',
    productIcon: '🏠',
    details: [
      { label: 'Wilayah', value: billData.regionName },
      { label: 'NOP', value: nop, highlight: true },
      { label: 'Nama WP', value: billData.name },
      { label: 'Tahun Pajak', value: billData.year },
      { label: 'Pokok Pajak', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  // Generate years from 2010 to current
  const currentYear = new Date().getFullYear()
  const years = Array.from({length: currentYear - 2009}, (_, i) => (currentYear - i).toString())

  return (
    <div className="pb-24">
      <PageHeader title="PBB" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Wilayah / Kabupaten / Kota</label>
        
        {isFallbackMode ? (
          <input 
            type="text"
            value={manualRegion}
            onChange={(e) => { setManualRegion(e.target.value); setBillData(null) }}
            placeholder="Masukkan Nama Kota/Kabupaten PBB"
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
        
        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Objek Pajak (NOP)</label>
        <div className="relative flex items-center mb-4">
          <div className="absolute left-4 text-gray-400">
            <Home className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={nop}
            onChange={(e) => { setNop(e.target.value.replace(/\D/g, '').substring(0, 18)); setBillData(null) }}
            placeholder="18 Digit NOP"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-transparent transition-all"
          />
          {nop && (
            <button 
              onClick={() => { setNop(''); setBillData(null) }}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <label className="block text-sm font-bold text-gray-700 mb-2">Tahun Pajak</label>
        <div className="relative">
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setBillData(null) }}
            className="w-full mb-4 pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] appearance-none"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-[25px] -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
        <div className="px-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900 text-lg">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{billData.id}</p>
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">
                TAHUN {billData.year}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs block mb-1">Letak Objek Pajak</span>
                <span className="font-medium text-gray-900 block leading-tight">{billData.address}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">Wilayah</span>
                <span className="font-medium text-right">{billData.regionName}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">Pokok Pajak PBB</span>
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
        <div className="max-w-md mx-auto bg-white border border-orange-100 shadow-[0_-10px_40px_-15px_rgba(249,115,22,0.2)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Pajak (Inc. Admin)</p>
            <p className="text-lg font-black text-orange-600">
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-colors"
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
