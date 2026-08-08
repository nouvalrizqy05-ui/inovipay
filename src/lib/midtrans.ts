import midtransClient from 'midtrans-client'
import crypto from 'crypto'

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
})

// Kelompok metode pembayaran yang ditampilkan di UI -> channel Midtrans Snap
// yang diaktifkan lewat parameter enabled_payments.
// Catatan: OVO tidak tersedia sebagai channel langsung di Snap untuk sebagian
// besar merchant (butuh approval khusus/OVO Push API terpisah). Sementara
// dipetakan ke gopay agar tidak error; sebaiknya UI kategori "OVO" dihapus
// atau diganti jadi "GoPay" supaya tidak menyesatkan reseller.
export const PAYMENT_CATEGORY_MAP: Record<string, string[]> = {
  VA: ['bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va', 'echannel'],
  QRIS: ['qris'],
  SHOPEEPAY: ['shopeepay'],
  OVO: ['gopay'],
  INDOMARET: ['indomaret'],
}

export interface CreateDepositTransactionParams {
  orderId: string
  amount: number
  category: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export async function createDepositTransaction(params: CreateDepositTransactionParams) {
  const { orderId, amount, category, customerName, customerEmail, customerPhone } = params

  const parameter: Record<string, any> = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    credit_card: { secure: true },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: customerPhone,
    },
    // Batas waktu bayar 1 jam sebelum transaksi otomatis expire
    expiry: { unit: 'hours', duration: 1 },
    item_details: [
      {
        id: 'DEPOSIT',
        price: amount,
        quantity: 1,
        name: 'Deposit Saldo Reseller',
      },
    ],
  }

  const enabledPayments = PAYMENT_CATEGORY_MAP[category]
  if (enabledPayments) parameter.enabled_payments = enabledPayments

  return snap.createTransaction(parameter as any)
}

// Verifikasi signature_key yang dikirim Midtrans di notification webhook.
// Formula resmi: SHA512(order_id + status_code + gross_amount + ServerKey)
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const expected = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex')
  return expected === signatureKey
}
