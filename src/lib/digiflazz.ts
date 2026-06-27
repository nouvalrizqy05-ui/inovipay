import crypto from 'crypto'

const BASE_URL = 'https://api.digiflazz.com/v1'
const username = process.env.DIGIFLAZZ_USERNAME!
const mode = process.env.DIGIFLAZZ_MODE || 'development'
const apiKey =
  mode === 'production'
    ? process.env.DIGIFLAZZ_API_KEY_PROD!
    : process.env.DIGIFLAZZ_API_KEY_DEV!

function sign(suffix: string): string {
  return crypto.createHash('md5').update(username + apiKey + suffix).digest('hex')
}

export async function cekSaldo(): Promise<number> {
  const res = await fetch(`${BASE_URL}/cek-saldo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'deposit', username, sign: sign('depo') }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Gagal cek saldo Digiflazz')
  return data.data.deposit
}

export async function getPriceList(category?: string) {
  const body: Record<string, string> = {
    cmd: 'prepaid',
    username,
    sign: sign('pricelist'),
  }
  if (category) body.category = category
  const res = await fetch(`${BASE_URL}/price-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Gagal ambil price list')
  return data.data
}

export interface TransactionPayload {
  refId: string
  skuCode: string
  customerNo: string
}

export interface DigiflazzResponse {
  ref_id: string
  customer_no: string
  buyer_sku_code: string
  message: string
  status: 'Sukses' | 'Gagal' | 'Pending'
  sn: string
  price: number
}

export async function createTransaction(payload: TransactionPayload): Promise<DigiflazzResponse> {
  const res = await fetch(`${BASE_URL}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      buyer_sku_code: payload.skuCode,
      customer_no: payload.customerNo,
      ref_id: payload.refId,
      sign: sign(payload.refId),
      testing: mode !== 'production',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Gagal kirim transaksi')
  return data.data
}

export async function checkTransaction(refId: string): Promise<DigiflazzResponse> {
  const res = await fetch(`${BASE_URL}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      buyer_sku_code: '',
      customer_no: '',
      ref_id: refId,
      sign: sign(refId),
      cmd: 'inquiry-transaction',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Gagal cek transaksi')
  return data.data
}
