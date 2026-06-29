'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { CreditCard, X, Info, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

const CARD_PROVIDERS = [
  { id: 'Mandiri', name: 'Mandiri e-Money', color: 'bg-yellow-500 text-blue-900' },
  { id: 'BCA', name: 'BCA Flazz', color: 'bg-blue-600 text-white' },
  { id: 'BRI', name: 'BRI Brizzi', color: 'bg-blue-800 text-white' },
  { id: 'BNI', name: 'BNI TapCash', color: 'bg-orange-500 text-white' },
]

export default function EmoneyPascaPage() {
  const [provider, setProvider] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=EMONEY_PASCABAYAR')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  const cleanCardNumber = cardNumber.replace(/\D/g, '')
  const isCardValid = cleanCardNumber.length >= 10

  const filteredProducts = useMemo(() => {
    if (!provider) return []
    let list = products.filter(p => p.name.toLowerCase().includes(provider.toLowerCase()))
    
    // Mocking products if none exist
    if (list.length === 0) {
      list = [
        { id: `${provider}-1`, name: `${provider} 20.000`, sellPrice: 21500, code: 'MOCK1' },
        { id: `${provider}-2`, name: `${provider} 50.000`, sellPrice: 51500, code: 'MOCK2' },
        { id: `${provider}-3`, name: `${provider} 100.000`, sellPrice: 101500, code: 'MOCK3' },
      ]
    }
    
    return list.sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, provider])

  const handleBuyClick = () => {
    if (!provider) return toast.error('Pilih jenis kartu')
    if (!isCardValid) return toast.error('Masukkan nomor kartu yang valid')
    if (!selectedProduct) return
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: selectedProduct.code,
        targetNumber: cleanCardNumber,
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

  if (loading) return <Loading text="Memuat produk e-money fisik..." />

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="💳"
        details={[
          { label: 'Nomor Kartu', value: cleanCardNumber },
          { label: 'Jenis Kartu', value: CARD_PROVIDERS.find(p => p.id === provider)?.name || '-' },
          { label: 'Kategori', value: 'Top Up E-Money Fisik' },
          { label: 'Catatan', value: 'Segera Update Saldo di ATM/NFC' }
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setCardNumber('')
          setSelectedProduct(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = selectedProduct ? {
    productName: selectedProduct.name,
    productIcon: '💳',
    details: [
      { label: 'Nomor Kartu', value: cleanCardNumber, highlight: true },
      { label: 'Jenis Kartu', value: CARD_PROVIDERS.find(p => p.id === provider)?.name || '-' },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="E-Money Fisik" />

      <div className="px-4 mb-4">
        <div className="bg-orange-50 text-orange-800 text-xs p-3 rounded-xl border border-orange-100 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Top up kartu e-money fisik. <strong>Kartu harus di-tap (update saldo)</strong> ke mesin EDC, ATM, atau HP ber-NFC setelah transaksi berhasil.</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="px-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Jenis Kartu</label>
        <div className="grid grid-cols-2 gap-3">
          {CARD_PROVIDERS.map(p => {
            const isSelected = provider === p.id
            return (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id)
                  setSelectedProduct(null)
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
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
                <div className={`text-[11px] font-bold px-3 py-1.5 rounded-lg mb-1 ${p.color}`}>
                  {p.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input Section */}
      {provider && (
        <div className="bg-white mx-4 p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Kartu {provider}</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <input 
              type="tel"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value.replace(/\D/g, ''))
                setSelectedProduct(null)
              }}
              placeholder="16 Digit Nomor Kartu"
              className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-transparent transition-all"
            />
            {cardNumber && (
              <button 
                onClick={() => { setCardNumber(''); setSelectedProduct(null) }}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid Nominal */}
      {provider && isCardValid && filteredProducts.length > 0 ? (
        <div className="px-4 space-y-3 mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Nominal Top Up</h3>
          {filteredProducts.map((p, idx) => {
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
      ) : provider && cardNumber.length >= 4 ? (
        <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed mx-4">
          <p className="text-gray-500 text-sm">Belum ada produk untuk kartu ini.</p>
        </div>
      ) : null}

      {/* Floating Action Button */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${selectedProduct && isCardValid ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
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
            Beli Sekarang
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
