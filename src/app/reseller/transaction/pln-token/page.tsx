'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Zap, X, Search, Home as HomeIcon } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

export default function PlnTokenPage() {
  const [customerId, setCustomerId] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  // Mock Info State
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=TOKEN_PLN')
      .then(r => setProducts(r.data.products.sort((a: any, b: any) => a.sellPrice - b.sellPrice)))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  // Auto format 16 digits
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16)
    // Add spaces every 4 digits for readability
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val
    setCustomerId(formatted)
    
    // Reset selection and info if ID changes
    setCustomerInfo(null)
    setSelectedProduct(null)

    if (val.length === 11 || val.length === 12 || val.length === 16) {
      // Mock API call to check customer ID (Wait a moment to simulate network)
      setLoadingInfo(true)
      setTimeout(() => {
        // TODO: replace with real API call to Digiflazz Inquiry
        if (val.startsWith('1')) {
          setCustomerInfo({
            name: 'JOKO WIDODO',
            id: val,
            power: 'R1M/900VA'
          })
        } else if (val.startsWith('2')) {
          setCustomerInfo({
            name: 'BUDI SANTOSO',
            id: val,
            power: 'R1/1300VA'
          })
        } else {
          setCustomerInfo(null) // Simulate not found
        }
        setLoadingInfo(false)
      }, 1000)
    }
  }

  const cleanId = customerId.replace(/\D/g, '')

  const handleBuyClick = () => {
    if (!customerInfo || !selectedProduct) return
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: selectedProduct.code,
        targetNumber: cleanId,
        pin: '123456'
      })
      setShowConfirm(false)
      setReceiptTx({
        id: res.data.transaction?.id || `TRX-${Date.now()}`,
        date: new Date(),
        amount: selectedProduct.sellPrice,
        // Mock token for demo
        token: '1234-5678-9012-3456-7890'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transaksi gagal')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <Loading text="Memuat nominal..." />

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="⚡"
        details={[
          { label: 'ID Pelanggan', value: cleanId },
          { label: 'Nama Pelanggan', value: customerInfo?.name || '-' },
          { label: 'Tarif / Daya', value: customerInfo?.power || '-' },
          { label: 'Kategori', value: 'Token Listrik PLN' }
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        receiptCode={receiptTx.token}
        receiptCodeLabel="TOKEN PLN (20 DIGIT)"
        onNewTransaction={() => {
          setReceiptTx(null)
          setCustomerId('')
          setCustomerInfo(null)
          setSelectedProduct(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = selectedProduct && customerInfo ? {
    productName: selectedProduct.name,
    productIcon: '⚡',
    details: [
      { label: 'ID Pelanggan', value: cleanId, highlight: true },
      { label: 'Nama Pelanggan', value: customerInfo.name },
      { label: 'Tarif / Daya', value: customerInfo.power },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  // Helper for mock kWh
  const getMockKwh = (price: number) => {
    // approx 1500 / kWh + adm
    const admin = 2750;
    const netto = price - admin;
    return `± ${Math.max(0, Math.floor(netto / 1500))} kWh`
  }

  return (
    <div className="pb-24">
      <PageHeader title="PLN Prabayar" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">No. Meter / ID Pelanggan</label>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <Zap className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={customerId}
            onChange={handleIdChange}
            placeholder="Contoh: 1234 5678 9012"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
          {customerId && (
            <button 
              onClick={() => { setCustomerId(''); setCustomerInfo(null); setSelectedProduct(null) }}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Terdiri dari 11, 12, atau 16 digit angka.</p>
        
        {/* Info Card */}
        {loadingInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-center gap-2">
            <Loading text="Mengecek ID..." />
          </div>
        )}
        
        {customerInfo && !loadingInfo && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0">
              <HomeIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{customerInfo.name}</p>
              <p className="text-xs text-gray-600 font-mono mt-0.5">{customerInfo.id}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">
                {customerInfo.power}
              </span>
            </div>
          </div>
        )}

        {cleanId.length >= 11 && !customerInfo && !loadingInfo && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600 font-medium">ID Pelanggan tidak ditemukan. (Coba awalan angka 1 atau 2 untuk demo mockup).</p>
          </div>
        )}
      </div>

      {/* Grid Nominal */}
      {customerInfo && products.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Nominal</h3>
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => {
              const isSelected = selectedProduct?.id === p.id
              const isHemat = p.sellPrice >= 100000
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-yellow-400 bg-yellow-50/30 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-yellow-200'
                  }`}
                >
                  {isHemat && (
                    <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                      HEMAT
                    </div>
                  )}
                  {/* Extract nominal */}
                  <span className="font-black text-xl text-gray-900 mb-1">
                    {p.name.match(/\d+[\.,]?\d*/)?.[0] || p.name}
                  </span>
                  <span className="text-sm font-bold text-[#00B4A0] mb-2">
                    {formatRupiah(p.sellPrice)}
                  </span>
                  
                  <div className="w-full bg-gray-50 p-2 rounded-lg mt-auto flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">Estimasi</span>
                    <span className="text-xs font-bold text-gray-700">{getMockKwh(p.sellPrice)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Floating Action Button (Summary) */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${selectedProduct && customerInfo ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto bg-white border border-teal-100 shadow-[0_-10px_40px_-15px_rgba(0,180,160,0.3)] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Pembayaran</p>
            <p className="text-lg font-black text-[#00B4A0]">
              {selectedProduct ? formatRupiah(selectedProduct.sellPrice) : '-'}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            className="px-6 py-2.5 bg-[#00B4A0] hover:bg-[#009B8A] text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-colors"
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
