import crypto from 'crypto'
import axios from 'axios'
import url from 'url'

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

// Wrapper axios untuk otomatis pakai proxy jika ada FIXIE_URL
async function digiflazzRequest(endpoint: string, data: any) {
  const config: any = {}
  
  if (process.env.FIXIE_URL) {
    const fixieUrl = url.parse(process.env.FIXIE_URL)
    if (fixieUrl.auth && fixieUrl.hostname && fixieUrl.port) {
      const fixieAuth = fixieUrl.auth.split(':')
      config.proxy = {
        protocol: fixieUrl.protocol ? fixieUrl.protocol.replace(':', '') : 'http',
        host: fixieUrl.hostname,
        port: parseInt(fixieUrl.port),
        auth: { username: fixieAuth[0], password: fixieAuth[1] }
      }
    }
  }

  try {
    const res = await axios.post(`${BASE_URL}${endpoint}`, data, config)
    return res.data
  } catch (error: any) {
    if (error.response) {
      console.error('Digiflazz raw response:', error.response.data)
      throw new Error(error.response.data?.data?.message || error.response.data?.message || 'Gagal kirim transaksi')
    }
    throw error
  }
}

export async function cekSaldo(): Promise<number> {
  const data = await digiflazzRequest('/cek-saldo', { cmd: 'deposit', username, sign: sign('depo') })
  return data.data.deposit
}

export async function getPriceList(category?: string, cmd: 'prepaid' | 'pasca' = 'prepaid') {
  const body: Record<string, string> = {
    cmd,
    username,
    sign: sign('pricelist'),
  }
  if (category) body.category = category
  const data = await digiflazzRequest('/price-list', body)
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
  const data = await digiflazzRequest('/transaction', {
    username,
    buyer_sku_code: payload.skuCode,
    customer_no: payload.customerNo,
    ref_id: payload.refId,
    sign: sign(payload.refId),
    testing: mode !== 'production',
  })
  return data.data
}

export async function createTransactionPasca(payload: TransactionPayload): Promise<DigiflazzResponse> {
  const data = await digiflazzRequest('/transaction', {
    commands: 'pay-pasca',
    username,
    buyer_sku_code: payload.skuCode,
    customer_no: payload.customerNo,
    ref_id: payload.refId,
    sign: sign(payload.refId),
    testing: mode !== 'production',
  })
  return data.data
}

export async function checkTransaction(refId: string): Promise<DigiflazzResponse> {
  const data = await digiflazzRequest('/transaction', {
    username,
    buyer_sku_code: '',
    customer_no: '',
    ref_id: refId,
    sign: sign(refId),
    cmd: 'inquiry-transaction',
  })
  return data.data
}
