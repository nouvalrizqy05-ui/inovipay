'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Phone, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

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

const TABS = ['Semua', 'Harian', 'Mingguan', 'Bulanan', 'Malam/Weekend']

export default function DataPage() {
  const [phone, setPhone] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Semua')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=DATA')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('62')) cleanPhone = '0' + cleanPhone.substring(2)
  const opName = getOperator(cleanPhone)
  const isPhoneValid = cleanPhone.length >= 10 && cleanPhone.length <= 13

  const filteredProducts = useMemo(() => {
    if (!opName) return []
    let ops = products.filter(p => p.name.toLowerCase().includes(opName.toLowerCase()))
    
    // Fake filtering logic based on name heuristics (since real API might not have tags)
    if (activeTab === 'Harian') ops = ops.filter(p => p.name.match(/1[\s-]?Hari|2[\s-]?Hari/i))
    else if (activeTab === 'Mingguan') ops = ops.filter(p => p.name.match(/7[\s-]?Hari|14[\s-]?Hari|Minggu/i))
    else if (activeTab === 'Bulanan') ops = ops.filter(p => p.name.match(/30[\s-]?Hari|Bulan/i))
    else if (activeTab === 'Malam/Weekend') ops = ops.filter(p => p.name.match(/Malam|Weekend|Midnight/i))
    
    return ops.sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, opName, activeTab])

  const handleBuyClick = (product: any) => {
    if (!isPhoneValid) return toast.error('Masukkan nomor tujuan dengan benar')
    setSelectedProduct(product)
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

  if (loading) return <Loading text="Memuat paket data..." />

  if (receiptTx) {
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="📶"
        details={[
          { label: 'Nomor Tujuan', value: cleanPhone },
          { label: 'Operator', value: opName || '-' },
          { label: 'Kategori', value: 'Paket Data' }
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
    productIcon: '📶',
    details: [
      { label: 'Nomor Tujuan', value: cleanPhone, highlight: true },
      { label: 'Operator', value: opName || '-' },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  // Extract main quota for UI e.g., "10 GB"
  const extractQuota = (name: string) => {
    const match = name.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i)
    return match ? match[0].toUpperCase() : 'Data'
  }

  return (
    <div className="pb-8">
      <PageHeader title="Paket Data" />

      {/* Input Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4 sticky top-[72px] z-10">
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
        
        {phone.length >= 4 && (
          <div className="mt-3 min-h-[24px]">
            {opName ? (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getOperatorColor(opName)}`}>
                {opName}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                Operator tidak dikenali
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      {opName && (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 mb-4 pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-[#00B4A0] text-white shadow-md shadow-teal-500/20' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* List Paket */}
      <div className="px-4 space-y-3">
        {!phone ? (
          <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 border-dashed mt-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-8 h-8" />
            </div>
            <p className="text-gray-900 font-bold mb-1">Masukkan Nomor HP</p>
            <p className="text-gray-500 text-xs">Ketik nomor HP pelanggan terlebih dahulu untuk melihat paket yang tersedia.</p>
          </div>
        ) : !opName ? (
          null
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((p, idx) => {
            const isPopuler = idx === 1 || idx === 3 // fake popularity logic
            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative flex justify-between items-center"
              >
                {isPopuler && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-1 rounded-bl-lg rounded-tr-2xl shadow-sm">
                    POPULER
                  </div>
                )}
                <div className="flex-1 pr-4">
                  <p className="font-black text-xl text-gray-900 mb-0.5">{extractQuota(p.name)}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{p.name}</p>
                  <p className="font-black text-lg text-[#00B4A0]">{formatRupiah(p.sellPrice)}</p>
                </div>
                <div>
                  <button 
                    onClick={() => handleBuyClick(p)}
                    className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Pilih
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed">
            <p className="text-gray-500 text-sm">Paket tidak ditemukan untuk filter ini.</p>
          </div>
        )}
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
