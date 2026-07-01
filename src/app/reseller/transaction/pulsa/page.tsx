'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Phone, X, Search } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

// --- Helper Deteksi Operator ---
const OPERATOR_PREFIXES: Record<string, string[]> = {
  Telkomsel: ['0811', '0812', '0813', '0821', '0822', '0852', '0853', '0823', '0851'],
  Indosat: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
  XL: ['0817', '0818', '0819', '0859', '0877', '0878'],
  Axis: ['0838', '0831', '0832', '0833'],
  Tri: ['0895', '0896', '0897', '0898', '0899'],
  Smartfren: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'],
}

function getOperator(phone: string): string | null {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) cleaned = '0' + cleaned.substring(2)
  if (cleaned.length < 4) return null
  const prefix = cleaned.substring(0, 4)
  for (const [op, prefixes] of Object.entries(OPERATOR_PREFIXES)) {
    if (prefixes.includes(prefix)) return op
  }
  return null
}

function getOperatorColor(op: string) {
  switch (op) {
    case 'Telkomsel': return 'bg-red-500 text-white'
    case 'Indosat': return 'bg-yellow-400 text-black'
    case 'XL': return 'bg-blue-600 text-white'
    case 'Axis': return 'bg-purple-600 text-white'
    case 'Tri': return 'bg-black text-white'
    case 'Smartfren': return 'bg-pink-500 text-white'
    default: return 'bg-gray-200 text-gray-700'
  }
}

export default function PulsaPage() {
  const [phone, setPhone] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  // Wallet
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  // Modals state
  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    // Ambil produk kategori PULSA
    api.get('/reseller/products?category=PULSA')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    // Ambil saldo
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  // Derived state
  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('62')) cleanPhone = '0' + cleanPhone.substring(2)
  const opName = getOperator(cleanPhone)
  
  const isValidLength = cleanPhone.length >= 10 && cleanPhone.length <= 13
  const isPhoneValid = cleanPhone.startsWith('08') && isValidLength

  // Filter produk berdasar operator (asumsi nama produk mengandung nama operator, e.g. "Telkomsel Pulsa 10.000")
  const filteredProducts = useMemo(() => {
    if (!opName) return []
    // Filter produk yang namanya mengandung nama operator (case insensitive)
    return products.filter(p => p.name.toLowerCase().includes(opName.toLowerCase()))
      .sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, opName])

  // Cari produk terlaris buatan (nominal realistis 5rb, 10rb, 20rb)
  const isTerlaris = (name: string) => {
    const match = name.match(/\d+/)
    if (!match) return false
    const nominal = parseInt(match[0], 10)
    return [5, 10, 20, 5000, 10000, 20000].includes(nominal)
  }

  const handleBuyClick = () => {
    if (!isPhoneValid || !selectedProduct) return
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
      // Show receipt
      setReceiptTx({
        id: res.data.transactionId || `TRX-${Date.now()}`,
        date: new Date(),
        amount: selectedProduct.sellPrice,
      })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transaksi gagal')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <Loading text="Memuat produk pulsa..." />

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="📱"
        details={[
          { label: 'Nomor Tujuan', value: cleanPhone },
          { label: 'Operator', value: opName || '-' },
          { label: 'Kategori', value: 'Pulsa Prabayar' }
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
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
    productIcon: '📱',
    details: [
      { label: 'Nomor Tujuan', value: cleanPhone, highlight: true },
      { label: 'Operator', value: opName || '-' },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Pulsa Prabayar" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Tujuan</label>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <Phone className="w-5 h-5" />
          </div>
          <input 
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setSelectedProduct(null) // reset selection on change
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
        
        {/* Operator Badge */}
        <div className="mt-3 min-h-[24px]">
          {phone.length >= 4 && (
            opName ? (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getOperatorColor(opName)}`}>
                {opName}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                Operator tidak dikenali
              </span>
            )
          )}
        </div>
      </div>

      {/* Grid Nominal */}
      {opName && filteredProducts.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Nominal</h3>
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map(p => {
              const isSelected = selectedProduct?.id === p.id
              const laris = isTerlaris(p.name)
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    isSelected 
                      ? 'border-[#00B4A0] bg-teal-50/50 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-teal-200'
                  }`}
                >
                  {laris && (
                    <div className="absolute -top-2.5 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      TERLARIS
                    </div>
                  )}
                  {/* Ekstrak angka dari nama (e.g. "Telkomsel Pulsa 10.000" -> "10.000") */}
                  <span className="font-black text-lg text-gray-900 mb-1">
                    {p.name.match(/\d+[\.,]?\d*/)?.[0] || 'Pulsa'}
                  </span>
                  <span className="text-[11px] font-bold text-[#00B4A0]">
                    {formatRupiah(p.sellPrice)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : phone.length >= 4 ? (
        <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed">
          <p className="text-gray-500 text-sm">Belum ada produk untuk nomor ini.</p>
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
