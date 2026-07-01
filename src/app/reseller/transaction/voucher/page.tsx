'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Gift, X, Phone } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

export default function VoucherPage() {
  const [phone, setPhone] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=VOUCHER')
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

  const handleBuyClick = () => {
    if (!isPhoneValid) return toast.error('Masukkan nomor HP penerima voucher yang valid')
    if (!selectedProduct) return
    setShowConfirm(true)
  }

  const handleConfirm = async (pin: string) => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: selectedProduct.code,
        targetNumber: cleanPhone,
        pin
      })
      
      setShowConfirm(false)
      setReceiptTx({
        id: res.data.transaction?.id || `TRX-${Date.now()}`,
        date: new Date(),
        amount: selectedProduct.sellPrice,
        token: 'VCR-ABCD-1234-EFGH-5678' // Mock voucher code
      })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transaksi gagal')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <Loading text="Memuat produk voucher..." />

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="🎁"
        details={[
          { label: 'Nomor Penerima', value: cleanPhone },
          { label: 'Kategori', value: 'Voucher Digital' }
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        receiptCode={receiptTx.token}
        receiptCodeLabel="KODE VOUCHER"
        onNewTransaction={() => {
          setReceiptTx(null)
          setPhone('')
          setSelectedProduct(null)
        }}
      />
    )
  }

  const modalData: ConfirmationModalData | null = selectedProduct ? {
    productName: selectedProduct.name,
    productIcon: '🎁',
    details: [
      { label: 'Nomor Penerima', value: cleanPhone, highlight: true },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Voucher Digital" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
        <label className="block text-sm font-bold text-gray-700 mb-2">No. HP Penerima (Untuk SMS Kode)</label>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <Phone className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
            }}
            placeholder="08xxxxxxxxxx"
            className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-transparent transition-all"
          />
          {phone && (
            <button 
              onClick={() => setPhone('')}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Kode voucher akan ditampilkan di struk pembayaran.</p>
      </div>

      {/* Grid Nominal */}
      <div className="px-4 space-y-3 mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Voucher</h3>
        {products.map((p, idx) => {
          const isSelected = selectedProduct?.id === p.id
          return (
            <div 
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className={`bg-white rounded-2xl p-4 border shadow-sm relative flex justify-between items-center cursor-pointer transition-all ${
                isSelected ? 'border-[#00B4A0] bg-teal-50/20 ring-1 ring-[#00B4A0]' : 'border-gray-100 hover:border-teal-200'
              }`}
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-[#00B4A0]" />
                  <p className="font-bold text-sm text-gray-900">{p.name}</p>
                </div>
                <p className="font-black text-lg text-[#00B4A0] mt-2">{formatRupiah(p.sellPrice)}</p>
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
        {products.length === 0 && !loading && (
          <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed">
            <p className="text-gray-500 text-sm">Belum ada produk voucher yang tersedia.</p>
          </div>
        )}
      </div>

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
