'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Phone, X, Wallet, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

const PROVIDERS = [
  { id: 'gopay', name: 'GoPay', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'ovo', name: 'OVO', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'dana', name: 'DANA', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'shopeepay', name: 'ShopeePay', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'linkaja', name: 'LinkAja', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'sakuku', name: 'Sakuku', color: 'text-blue-800', bg: 'bg-blue-50' },
]

export default function EMoneyPage() {
  const [provider, setProvider] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=EMONEY')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('62')) cleanPhone = '0' + cleanPhone.substring(2)
  const isPhoneValid = cleanPhone.length >= 10 && cleanPhone.length <= 13

  // Filter products by selected provider
  const filteredProducts = useMemo(() => {
    if (!provider) return []
    return products.filter(p => p.name.toLowerCase().includes(provider.toLowerCase()))
      .sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, provider])

  const handleBuyClick = () => {
    if (!isPhoneValid) return toast.error('Masukkan nomor tujuan dengan benar')
    if (!selectedProduct) return toast.error('Pilih nominal top up')
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: selectedProduct.code,
        targetNumber: cleanPhone,
        pin: '123456'
      })
      setShowConfirm(false)
      setReceiptTx({
        id: res.data.transaction?.id || `TRX-${Date.now()}`,
        date: new Date(),
        amount: selectedProduct.sellPrice,
      })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transaksi gagal')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <Loading text="Memuat produk E-Money..." />

  const selectedProviderObj = PROVIDERS.find(p => p.id === provider)

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="💳"
        details={[
          { label: 'Provider', value: selectedProviderObj?.name || '-' },
          { label: 'Nomor Tujuan', value: cleanPhone },
          { label: 'Kategori', value: 'Top Up E-Money' }
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setPhone('')
          setProvider(null)
          setSelectedProduct(null)
        }}
      />
    )
  }

  // Mock Admin Fee calculation
  const getAdminFee = (providerId: string) => {
    if (providerId === 'shopeepay') return 1000
    if (providerId === 'gopay') return 1500
    return 500
  }

  const modalData: ConfirmationModalData | null = selectedProduct ? {
    productName: selectedProduct.name,
    productIcon: '💳',
    details: [
      { label: 'Provider', value: selectedProviderObj?.name || '-' },
      { label: 'Nomor Tujuan', value: cleanPhone, highlight: true },
      { label: 'Biaya Admin', value: formatRupiah(getAdminFee(provider!)) },
    ],
    totalAmount: selectedProduct.sellPrice, // Admin fee already included in sell price in system, this is just display
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Top Up E-Money" />

      {/* Grid Provider */}
      <div className="px-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Provider</label>
        <div className="grid grid-cols-3 gap-3">
          {PROVIDERS.map(p => {
            const isSelected = provider === p.id
            return (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id)
                  setSelectedProduct(null)
                }}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  isSelected 
                    ? 'border-[#00B4A0] bg-teal-50/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-[#00B4A0]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className={`w-10 h-10 ${p.bg} ${p.color} rounded-full flex items-center justify-center mb-2`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nomor Akun / HP {selectedProviderObj?.name}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400">
                <Phone className="w-5 h-5" />
              </div>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setSelectedProduct(null)
                }}
                placeholder="08xxxxxxxxxx"
                className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-transparent transition-all"
              />
              {phone && (
                <button 
                  onClick={() => { setPhone(''); setSelectedProduct(null) }}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg mt-3 font-medium">
              Pastikan nomor terdaftar di {selectedProviderObj?.name}. Top up ke nomor salah tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      )}

      {/* Grid Nominal */}
      {provider && phone.length >= 10 && filteredProducts.length > 0 ? (
        <div className="mb-8 px-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Nominal</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(p => {
              const isSelected = selectedProduct?.id === p.id
              const adminFee = getAdminFee(provider)
              // Extract nominal amount from name (mock logic)
              const nominalText = p.name.match(/\d+[\.,]?\d*/)?.[0] || 'Nominal'
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-[#00B4A0] bg-teal-50/30 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-teal-200'
                  }`}
                >
                  <span className="font-black text-xl text-gray-900 mb-0.5">
                    {nominalText}
                  </span>
                  
                  <div className="flex flex-col mt-2 pt-2 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                      <span>Harga Asli</span>
                      <span>{formatRupiah(p.sellPrice - adminFee)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-2">
                      <span>Biaya Admin</span>
                      <span>{formatRupiah(adminFee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-gray-700">Total</span>
                      <span className="text-sm font-black text-[#00B4A0]">
                        {formatRupiah(p.sellPrice)}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : provider && phone.length >= 10 ? (
        <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed mx-4">
          <p className="text-gray-500 text-sm">Belum ada produk untuk provider ini.</p>
        </div>
      ) : null}

      {/* Floating Action Button (Summary) */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${selectedProduct && isPhoneValid ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
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
