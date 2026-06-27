import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'InoviPay - Platform Keagenan PPOB & Top-Up Game Termurah',
  description: 'Gabung jadi Mitra Inovi! Platform reseller PPOB, pulsa, paket data, token PLN, dan top-up game dengan harga termurah. Daftar gratis, untung jutaan rupiah per bulan.',
  manifest: '/manifest.json',
  keywords: ['PPOB', 'reseller pulsa', 'agen PPOB', 'top up game', 'Mobile Legends', 'token PLN', 'InoviPay', 'mitra konter'],
  authors: [{ name: 'InoviPay' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'InoviPay',
    title: 'InoviPay - Platform Keagenan PPOB & Top-Up Game Termurah',
    description: 'Gabung jadi Mitra Inovi! Daftar gratis, jual pulsa, data, token PLN, dan game voucher. Raih penghasilan jutaan rupiah per bulan.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'InoviPay Platform PPOB' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f59e0b', // Amber-500
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
