'use client'

import React, { useState, useEffect, useMemo } from 'react'
import PageHeader from '@/components/transaction/PageHeader'
import ConfirmationModal, { ConfirmationModalData } from '@/components/transaction/ConfirmationModal'
import TransactionReceipt from '@/components/transaction/TransactionReceipt'
import api from '@/lib/api-client'
import { formatRupiah } from '@/lib/utils'
import { Gamepad2, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

const GAMES = [
  { id: 'mlbb', name: 'Mobile Legends', img: 'M' },
  { id: 'ff', name: 'Free Fire', img: 'F' },
  { id: 'pubg', name: 'PUBG Mobile', img: 'P' },
  { id: 'genshin', name: 'Genshin Impact', img: 'G' },
  { id: 'valorant', name: 'Valorant', img: 'V' },
]

export default function GamesPage() {
  const [provider, setProvider] = useState<string | null>(null)
  
  // Game inputs
  const [userId, setUserId] = useState('')
  const [zoneId, setZoneId] = useState('') // MLBB only
  const [server, setServer] = useState('') // Genshin only

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [wallet, setWallet] = useState<{available: number}>({ available: 0 })

  // Mock Info
  const [accountName, setAccountName] = useState<string | null>(null)
  const [checkingAccount, setCheckingAccount] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptTx, setReceiptTx] = useState<any>(null)

  useEffect(() => {
    api.get('/reseller/products?category=GAMES')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false))
      
    api.get('/reseller/dashboard')
      .then(r => setWallet(r.data.wallet || { available: 0 }))
      .catch(() => {})
  }, [])

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!provider) return []
    const provName = GAMES.find(g => g.id === provider)?.name || ''
    return products.filter(p => p.name.toLowerCase().includes(provName.toLowerCase()) || p.name.toLowerCase().includes(provider.toLowerCase()))
      .sort((a, b) => a.sellPrice - b.sellPrice)
  }, [products, provider])

  // Mock Check Account
  const checkAccount = () => {
    if (!userId) return toast.error('Masukkan User ID')
    if (provider === 'mlbb' && !zoneId) return toast.error('Masukkan Zone ID')
    if (provider === 'genshin' && !server) return toast.error('Pilih Server')
    
    setCheckingAccount(true)
    setTimeout(() => {
      // Mock success check
      setAccountName(`PLAYER_${userId.substring(0, 4)}`)
      setCheckingAccount(false)
    }, 1000)
  }

  const handleBuyClick = () => {
    if (!accountName) return toast.error('Silakan cek ID terlebih dahulu')
    if (!selectedProduct) return toast.error('Pilih nominal')
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      const res = await api.post('/transactions', {
        productCode: selectedProduct.code,
        targetNumber: provider === 'mlbb' ? `${userId}${zoneId}` : userId,
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

  if (loading) return <Loading text="Memuat produk Games..." />

  const selectedGame = GAMES.find(g => g.id === provider)

  if (receiptTx) {
    const fullId = provider === 'mlbb' ? `${userId} (${zoneId})` : 
                   provider === 'genshin' ? `${userId} (${server})` : userId
    return (
      <TransactionReceipt
        transactionId={receiptTx.id}
        productName={selectedProduct.name}
        productIcon="🎮"
        details={[
          { label: 'Game', value: selectedGame?.name || '-' },
          { label: 'Player ID', value: fullId },
          { label: 'Nickname', value: accountName || '-' },
        ]}
        totalAmount={receiptTx.amount}
        timestamp={receiptTx.date}
        onNewTransaction={() => {
          setReceiptTx(null)
          setUserId('')
          setZoneId('')
          setServer('')
          setAccountName(null)
          setProvider(null)
          setSelectedProduct(null)
        }}
      />
    )
  }

  const fullId = provider === 'mlbb' ? `${userId} (${zoneId})` : 
                 provider === 'genshin' ? `${userId} (${server})` : userId

  const modalData: ConfirmationModalData | null = selectedProduct && accountName ? {
    productName: selectedProduct.name,
    productIcon: '🎮',
    details: [
      { label: 'Game', value: selectedGame?.name || '-' },
      { label: 'Player ID', value: fullId, highlight: true },
      { label: 'Nickname', value: accountName },
    ],
    totalAmount: selectedProduct.sellPrice,
    currentBalance: wallet.available
  } : null

  return (
    <div className="pb-24">
      <PageHeader title="Top Up Game" />

      {/* Grid Game */}
      <div className="px-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Game</label>
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
          {GAMES.map(g => {
            const isSelected = provider === g.id
            return (
              <button
                key={g.id}
                onClick={() => {
                  setProvider(g.id)
                  setSelectedProduct(null)
                  setAccountName(null)
                  setUserId('')
                  setZoneId('')
                  setServer('')
                }}
                className={`flex-shrink-0 w-24 h-24 relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                  isSelected 
                    ? 'border-[#00B4A0] bg-teal-50/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 text-[#00B4A0]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className={`w-10 h-10 bg-gray-900 text-white font-black text-xl rounded-xl flex items-center justify-center mb-2 shadow-sm`}>
                  {g.img}
                </div>
                <span className={`text-[10px] font-bold text-center leading-tight px-1 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                  {g.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input Form based on Game */}
      {provider && (
        <div className="px-4 mb-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            {provider === 'mlbb' ? (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-2">User ID</label>
                  <input type="text" value={userId} onChange={e => {setUserId(e.target.value); setAccountName(null)}}
                    placeholder="User ID" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4A0]" />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Zone ID</label>
                  <input type="text" value={zoneId} onChange={e => {setZoneId(e.target.value); setAccountName(null)}}
                    placeholder="(Zone)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4A0]" />
                </div>
              </div>
            ) : provider === 'genshin' ? (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">UID Genshin</label>
                  <input type="text" value={userId} onChange={e => {setUserId(e.target.value); setAccountName(null)}}
                    placeholder="Masukkan UID" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4A0]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Server</label>
                  <select value={server} onChange={e => {setServer(e.target.value); setAccountName(null)}}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B4A0]">
                    <option value="" disabled>Pilih Server</option>
                    <option value="Asia">Asia</option>
                    <option value="America">America</option>
                    <option value="Europe">Europe</option>
                    <option value="TW, HK, MO">TW, HK, MO</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-2">Player ID / User ID</label>
                <input type="text" value={userId} onChange={e => {setUserId(e.target.value); setAccountName(null)}}
                  placeholder={`Masukkan ID ${selectedGame?.name}`} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#00B4A0]" />
              </div>
            )}

            {!accountName ? (
              <button 
                onClick={checkAccount}
                disabled={checkingAccount || !userId}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {checkingAccount ? 'Mengecek ID...' : 'Cek Nickname'}
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-emerald-600 font-bold mb-0.5">Nickname Ditemukan</p>
                  <p className="font-black text-emerald-900">{accountName}</p>
                </div>
                <button onClick={() => setAccountName(null)} className="text-xs text-gray-500 font-medium underline">
                  Ganti ID
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid Nominal */}
      {provider && accountName && filteredProducts.length > 0 ? (
        <div className="mb-8 px-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Pilih Item</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(p => {
              const isSelected = selectedProduct?.id === p.id
              // Extract diamonds count (mock)
              const itemName = p.name.match(/\d+\s*(Diamonds|UC|Genesis Crystals|VP)/i)?.[0] || p.name
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
                  <span className="font-black text-sm text-gray-900 mb-1 leading-tight line-clamp-2">
                    {itemName}
                  </span>
                  <span className="text-sm font-black text-[#00B4A0] mt-auto pt-2">
                    {formatRupiah(p.sellPrice)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : provider && accountName ? (
        <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 border-dashed mx-4">
          <p className="text-gray-500 text-sm">Belum ada produk untuk game ini.</p>
        </div>
      ) : null}

      {/* Floating Action Button (Summary) */}
      <div className={`fixed bottom-[70px] left-0 right-0 p-4 transition-transform duration-300 ${selectedProduct && accountName ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
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
