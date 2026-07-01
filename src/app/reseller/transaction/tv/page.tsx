'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Tv, X, CheckCircle2, Search } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

const PROVIDERS = [
  { id: 'kvision', name: 'K-Vision', type: 'both' },
  { id: 'nexparabola', name: 'Nex Parabola', type: 'prabayar' },
  { id: 'transvision', name: 'Transvision', type: 'both' },
  { id: 'mncvision', name: 'MNC Vision', type: 'pascabayar' },
  { id: 'skynindo', name: 'Skynindo', type: 'prabayar' },
  { id: 'vidio', name: 'Vidio Premier', type: 'prabayar' }, // streaming
]

export default function TvPage() {
  const [activeTab, setActiveTab] = useState<'prabayar' | 'pascabayar'>('prabayar')
  const [provider, setProvider] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState('')
  
  // Prabayar state
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  // Pascabayar state
  const [billData, setBillData] = useState<any>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })
  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=TV_PRABAYAR')
      .then(r => setProducts(r.data.products))
      .catch(() => {})
      .finally(() => setLoadingProducts(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  const availableProviders = useMemo(() => {
    return PROVIDERS.filter(p => p.type === 'both' || p.type === activeTab)
  }, [activeTab])

  // If active tab changes and provider not available in new tab, reset it
  useEffect(() => {
    if (provider && !availableProviders.find(p => p.id === provider)) {
      setProvider(null)
      setSelectedProduct(null)
      setBillData(null)
    }
  }, [activeTab, provider, availableProviders])

  // Filter Prabayar products
  const filteredProducts = useMemo(() => {
    if (activeTab !== 'prabayar' || !provider) return []
    const provName = PROVIDERS.find(p => p.id === provider)?.name || ''
    return products.filter(p => p.name.toLowerCase().includes(provName.toLowerCase()) || p.name.toLowerCase().includes(provider.toLowerCase()))
      .sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, provider, activeTab])

  // Check Pascabayar Bill
  const checkBill = () => {
    if (!provider) return toast.error('Pilih provider TV')
    if (customerId.length < 5) return toast.error('Nomor Pelanggan tidak valid')
    setLoadingInfo(true)
    
    // MOCK API CALL
    setTimeout(() => {
      if (customerId.startsWith('1')) {
        setBillData({
          name: 'BAPAK JONATAN',
          id: customerId,
          providerName: PROVIDERS.find(p => p.id === provider)?.name,
          period: 'Juni 2026',
          billAmount: 150000,
          penalty: 0,
          adminFee: 2500,
        })
      } else {
        toast.error('Tagihan tidak ditemukan atau sudah dibayar.')
        setBillData(null)
      }
      setLoadingInfo(false)
    }, 1000)
  }

  const handleBuyClick = () => {
    if (activeTab === 'prabayar' && !selectedProduct) return
    if (activeTab === 'pascabayar' && !billData) return
    setShowConfirm(true)
  }

  const total = activeTab === 'prabayar' && selectedProduct 
    ? selectedProduct.sellPrice 
    : (billData ? billData.billAmount + billData.penalty + billData.adminFee : 0)

  const handleConfirm = async (pin: string) => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: activeTab === 'prabayar' ? selectedProduct.code : 'TV_PASCA',
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

  const selectedProviderObj = PROVIDERS.find(p => p.id === provider)

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={activeTab === 'prabayar' ? selectedProduct.name : `Tagihan ${selectedProviderObj?.name}`}
        productIcon="📺"
        details={[
          { label: 'Provider', value: selectedProviderObj?.name || '-' },
          { label: 'Nomor Pelanggan', value: customerId },
          activeTab === 'pascabayar' ? { label: 'Nama Pelanggan', value: billData?.name || '-' } : null,
          activeTab === 'pascabayar' ? { label: 'Periode Tagihan', value: billData?.period || '-' } : null,
        ].filter(Boolean) as any}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setCustomerId('')
          setBillData(null)
          setSelectedProduct(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = (activeTab === 'prabayar' && selectedProduct) || (activeTab === 'pascabayar' && billData) ? {
    productName: activeTab === 'prabayar' ? selectedProduct.name : `Tagihan ${selectedProviderObj?.name}`,
    productIcon: '📺',
    details: activeTab === 'prabayar' ? [
      { label: 'Provider', value: selectedProviderObj?.name || '-' },
      { label: 'No. Pelanggan/Receiver', value: customerId, highlight: true },
    ] : [
      { label: 'Provider', value: billData.providerName },
      { label: 'No. Pelanggan', value: customerId, highlight: true },
      { label: 'Nama Pelanggan', value: billData.name },
      { label: 'Tagihan Pokok', value: formatRupiah(billData.billAmount) },
      { label: 'Biaya Admin', value: formatRupiah(billData.adminFee) },
    ],
    totalAmount: total,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="TV & Streaming" />

      {/* Tabs */}
      <div className="flex bg-white mx-4 rounded-xl shadow-sm border border-gray-100 p-1 mb-6">
        <button
          onClick={() => { setActiveTab('prabayar'); setCustomerId(''); setBillData(null) }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'prabayar' ? 'bg-[#00B4A0] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Prabayar (Voucher)
        </button>
        <button
          onClick={() => { setActiveTab('pascabayar'); setCustomerId(''); setSelectedProduct(null) }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'pascabayar' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Pascabayar (Tagihan)
        </button>
      </div>

      {/* Grid Provider */}
      <div className="px-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Layanan / Provider</label>
        <div className="grid grid-cols-3 gap-3">
          {availableProviders.map(p => {
            const isSelected = provider === p.id
            return (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id)
                  setSelectedProduct(null)
                  setBillData(null)
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  isSelected 
                    ? `border-${activeTab === 'prabayar' ? '[#00B4A0]' : 'blue-500'} bg-${activeTab === 'prabayar' ? 'teal-50' : 'blue-50'}/50 shadow-sm` 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-1 right-1 ${activeTab === 'prabayar' ? 'text-[#00B4A0]' : 'text-blue-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className={`w-10 h-10 ${activeTab === 'prabayar' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mb-2`}>
                  <Tv className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold text-center leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                  {p.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input Section */}
      {provider && (
        <div className="px-4 mb-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">No. Pelanggan / ID Receiver</label>
            <div className="relative flex items-center mb-4">
              <div className="absolute left-4 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="tel"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value.replace(/\D/g, ''))
                  setSelectedProduct(null)
                  setBillData(null)
                }}
                placeholder="Masukkan Nomor"
                className={`w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 ${activeTab === 'prabayar' ? 'focus:ring-[#00B4A0]' : 'focus:ring-blue-500'} focus:border-transparent transition-all`}
              />
              {customerId && (
                <button 
                  onClick={() => { setCustomerId(''); setSelectedProduct(null); setBillData(null) }}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {activeTab === 'pascabayar' && (
              <button 
                onClick={checkBill}
                disabled={loadingInfo || customerId.length < 5}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingInfo ? 'Mengecek Tagihan...' : 'Cek Tagihan'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* PRABAYAR: Grid Nominal */}
      {activeTab === 'prabayar' && provider && customerId.length >= 5 && filteredProducts.length > 0 && (
        <div className="px-4 space-y-3 mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Paket Voucher</h3>
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id
            return (
              <div 
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`bg-white rounded-2xl p-4 border shadow-sm relative flex justify-between items-center cursor-pointer transition-all ${
                  isSelected ? 'border-[#00B4A0] ring-1 ring-[#00B4A0]' : 'border-gray-100 hover:border-teal-200'
                }`}
              >
                <div className="flex-1 pr-4">
                  <p className="font-bold text-sm text-gray-900 mb-1">{p.name}</p>
                  <p className="font-black text-lg text-[#00B4A0]">{formatRupiah(p.sellPrice)}</p>
                </div>
                <div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[#00B4A0] bg-[#00B4A0]' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PASCABAYAR: Bill Details */}
      {activeTab === 'pascabayar' && billData && (
        <div className="px-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{billData.name}</p>
                <p className="text-xs text-gray-500 font-mono">{billData.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="font-medium text-right">{billData.providerName}</span>
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
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${(activeTab === 'prabayar' && selectedProduct) || (activeTab === 'pascabayar' && billData) ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className={`max-w-md mx-auto bg-white border ${activeTab === 'prabayar' ? 'border-teal-100 shadow-[0_-10px_40px_-15px_rgba(0,180,160,0.3)]' : 'border-blue-100 shadow-[0_-10px_40px_-15px_rgba(59,130,246,0.3)]'} rounded-2xl p-4 flex items-center justify-between`}>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Bayar</p>
            <p className={`text-lg font-black ${activeTab === 'prabayar' ? 'text-[#00B4A0]' : 'text-blue-600'}`}>
              {formatRupiah(total)}
            </p>
          </div>
          <button 
            onClick={handleBuyClick}
            disabled={total === 0}
            className={`px-6 py-2.5 ${activeTab === 'prabayar' ? 'bg-[#00B4A0] hover:bg-[#009B8A] shadow-teal-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'} text-white font-bold rounded-xl shadow-lg transition-colors`}
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
