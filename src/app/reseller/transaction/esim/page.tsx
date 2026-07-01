'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Mail, X, CheckCircle2, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import { QRCodeSVG } from 'qrcode.react'

const OPERATORS = [
  { id: 'Telkomsel', name: 'Telkomsel', color: 'bg-red-500 text-white' },
  { id: 'Indosat', name: 'Indosat', color: 'bg-yellow-400 text-black' },
  { id: 'XL', name: 'XL', color: 'bg-blue-600 text-white' },
  { id: 'Smartfren', name: 'Smartfren', color: 'bg-pink-500 text-white' },
]

export default function EsimPage() {
  const [operator, setOperator] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=ESIM')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const filteredProducts = useMemo(() => {
    if (!operator) return []
    return products.filter(p => p.name.toLowerCase().includes(operator.toLowerCase()))
      .sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, operator])

  const handleBuyClick = () => {
    if (!operator) return toast.error('Pilih operator eSIM')
    if (!isEmailValid) return toast.error('Masukkan email yang valid')
    if (!selectedProduct) return
    setShowConfirm(true)
  }

  const handleConfirm = async (pin: string) => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: selectedProduct.code,
        targetNumber: email,
        pin
      })
      
      setShowConfirm(false)
      
      // Mocking eSIM data response
      const activationCode = `LPA:1$rsp.esim.id$${Math.random().toString(36).substring(2,15).toUpperCase()}`
      
      setReceiptTx({
        id: res.data.transaction?.id || `TRX-${Date.now()}`,
        date: new Date(),
        amount: selectedProduct.sellPrice,
        activationCode,
        smdpAddress: 'rsp.esim.id'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transaksi gagal')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <Loading text="Memuat produk eSIM..." />

  if (receiptTx) {
    return (
      <div className="pb-24 min-h-screen bg-gray-50 flex flex-col items-center">
        <PageHeader title="Struk Pembelian eSIM" />
        
        <div className="bg-white rounded-3xl p-6 m-4 mt-8 w-full max-w-sm shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#00B4A0]/10 rounded-full flex items-center justify-center mb-3">
              <QrCode className="w-8 h-8 text-[#00B4A0]" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Aktivasi eSIM</h2>
            <p className="text-sm font-medium text-[#00B4A0]">Transaksi Berhasil</p>
          </div>

          <div className="border-t border-dashed border-gray-200 my-5"></div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-white p-3 border-2 border-gray-100 rounded-2xl shadow-sm mb-3">
              <QRCodeSVG value={receiptTx.activationCode} size={180} level="M" />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">SM-DP+ Address</p>
            <p className="font-mono text-sm font-bold text-gray-900">{receiptTx.smdpAddress}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Activation Code</p>
            <p className="font-mono text-xs font-bold text-gray-900 break-all">{receiptTx.activationCode}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
            <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Cara Aktivasi
            </p>
            <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
              <li>Pastikan HP Anda terhubung ke WiFi</li>
              <li>Buka <strong>Pengaturan</strong> {'>'} <strong>Seluler</strong></li>
              <li>Pilih <strong>Tambah eSIM</strong> / <strong>Tambah Paket Seluler</strong></li>
              <li>Pilih <strong>Gunakan Kode QR</strong></li>
              <li>Pindai QR Code di atas</li>
            </ol>
          </div>

          <div className="border-t border-dashed border-gray-200 my-5"></div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Produk</span>
              <span className="font-bold text-gray-900 text-right">{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="font-bold text-gray-900">{email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Pembayaran</span>
              <span className="font-black text-[#00B4A0] text-lg">{formatRupiah(receiptTx.amount)}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              setReceiptTx(null)
              setEmail('')
              setSelectedProduct(null)
              setOperator(null)
            }}
            className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    )
  }

  const modalData: ConfirmationModalData | null = selectedProduct ? {
    productName: selectedProduct.name,
    productIcon: '🔗',
    details: [
      { label: 'Email Tujuan', value: email, highlight: true },
      { label: 'Operator', value: operator || '-' },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Aktivasi eSIM" />

      {/* Operator Selection */}
      <div className="px-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Operator eSIM</label>
        <div className="grid grid-cols-2 gap-3">
          {OPERATORS.map(op => {
            const isSelected = operator === op.id
            return (
              <button
                key={op.id}
                onClick={() => {
                  setOperator(op.id)
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
                <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg mb-2 ${op.color}`}>
                  {op.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input Section */}
      {operator && (
        <div className="bg-white mx-4 p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Pengiriman</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              placeholder="nama@email.com"
              className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-base focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-transparent transition-all"
            />
            {email && (
              <button 
                onClick={() => setEmail('')}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
            <span className="text-red-500">*</span>
            QR Code akan dikirim ke email ini dan juga akan muncul di struk pembayaran.
          </p>
        </div>
      )}

      {/* Grid Nominal */}
      {operator && isEmailValid && filteredProducts.length > 0 ? (
        <div className="px-4 space-y-3 mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Paket eSIM</h3>
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
      ) : operator && email.length >= 5 ? (
        <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed mx-4">
          <p className="text-gray-500 text-sm">Belum ada produk eSIM untuk operator ini.</p>
        </div>
      ) : null}

      {/* Floating Action Button (Summary) */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${selectedProduct && isEmailValid ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
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
