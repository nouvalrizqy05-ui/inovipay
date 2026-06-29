import React, { useEffect, useState } from 'react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Check, Share2, Download, Home, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export interface ReceiptDetail {
  label: string
  value: string
}

export interface TransactionReceiptProps {
  transactionId: string
  productName: string
  productIcon: string
  details: ReceiptDetail[]
  totalAmount: number
  timestamp: Date | string
  receiptCode?: string
  receiptCodeLabel?: string
  onClose?: () => void
  onShare?: () => void
}

export default function TransactionReceipt({
  transactionId,
  productName,
  productIcon,
  details,
  totalAmount,
  timestamp,
  receiptCode,
  receiptCodeLabel = 'Kode Voucher / Token',
  onClose,
  onShare
}: TransactionReceiptProps) {
  const [copiedId, setCopiedId] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    // Trigger bounce animation on mount
    setShowAnimation(true)
  }, [])

  const handleCopy = (text: string, type: 'id' | 'code') => {
    navigator.clipboard.writeText(text)
    toast.success('Disalin ke clipboard')
    if (type === 'id') {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } else {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const defaultShare = async () => {
    const text = `*Bukti Pembayaran InoviStore*\n\nNo: ${transactionId}\nTanggal: ${formatDate(new Date(timestamp))}\nProduk: ${productName}\nTotal: ${formatRupiah(totalAmount)}\n\n${receiptCode ? `${receiptCodeLabel}:\n${receiptCode}\n\n` : ''}Terima kasih telah bertransaksi!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Struk Transaksi',
          text: text,
        })
      } catch (err) {
        console.log('Error sharing', err)
      }
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Teks struk disalin ke clipboard')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col sm:justify-center overflow-y-auto">
      <div className="flex-1 w-full max-w-md mx-auto sm:my-8 flex flex-col p-4">
        
        {/* Success Header Animation */}
        <div className="text-center pt-8 pb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full mb-4 transition-transform duration-700 ${showAnimation ? 'scale-100' : 'scale-0'}`}>
            <Check className="w-10 h-10" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Transaksi Berhasil</h2>
          <p className="text-gray-500 text-sm mt-1">
            Diproses pada {formatDate(new Date(timestamp))}
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden mb-6">
          
          {/* Top Edge Decoration (jagged/dashed effect simulated with border) */}
          <div className="h-2 w-full bg-gray-100/50 flex space-x-1 px-2">
             {/* Simple visual separator at top */}
          </div>

          <div className="p-6 pb-2">
            {/* Branding */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-900 text-white px-3 py-1 text-xs font-black tracking-widest rounded">
                INOVISTORE
              </div>
            </div>

            {/* TRX ID */}
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg mb-6">
              <span className="text-xs text-gray-500 font-medium">No. Transaksi</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-700">{transactionId}</span>
                <button onClick={() => handleCopy(transactionId, 'id')} className="p-1 hover:bg-gray-200 rounded">
                  {copiedId ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl bg-gray-50 p-2 rounded-xl">{productIcon}</span>
              <p className="font-bold text-gray-900">{productName}</p>
            </div>

            {/* Details List */}
            <div className="space-y-3 mb-6">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right break-all">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="relative h-px w-full border-t-2 border-dashed border-gray-200 my-2">
            <div className="absolute -left-2 -top-2 w-4 h-4 bg-gray-50 rounded-full" />
            <div className="absolute -right-2 -top-2 w-4 h-4 bg-gray-50 rounded-full" />
          </div>

          <div className="p-6 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Total Pembayaran</span>
              <span className="text-xl font-black text-gray-900">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          {/* Special Receipt Code Highlight (e.g. PLN Token, Game Voucher) */}
          {receiptCode && (
            <div className="bg-[#E6F7F5] p-5 border-t border-teal-100">
              <p className="text-xs font-bold text-teal-800 text-center uppercase tracking-wider mb-2">
                {receiptCodeLabel}
              </p>
              <div className="bg-white border-2 border-dashed border-teal-300 rounded-xl p-3 flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-gray-900 tracking-widest">{receiptCode}</span>
                <button 
                  onClick={() => handleCopy(receiptCode, 'code')}
                  className="bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Disalin' : 'Salin'}
                </button>
              </div>
            </div>
          )}
          
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-auto">
          <div className="flex gap-3">
            <button 
              onClick={onShare || defaultShare} 
              className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
            <button 
              onClick={() => toast.info('Fitur unduh struk segera hadir')} 
              className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Simpan
            </button>
          </div>
          
          <Link href="/reseller/dashboard" className="block w-full">
            <button className="w-full py-3.5 bg-[#00B4A0] hover:bg-[#009B8A] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-500/20">
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
