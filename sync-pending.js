
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const BASE_URL = 'https://api.digiflazz.com/v1'
const username = process.env.DIGIFLAZZ_USERNAME
const apiKey = process.env.DIGIFLAZZ_MODE === 'production'
  ? process.env.DIGIFLAZZ_API_KEY_PROD
  : process.env.DIGIFLAZZ_API_KEY_DEV

function sign(suffix) {
  return crypto.createHash('md5').update(username + apiKey + suffix).digest('hex')
}

async function checkTransaction(refId) {
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
  return data.data
}

async function syncPending() {
  console.log('Mencari transaksi PENDING...')
  const pendings = await prisma.transaction.findMany({ where: { status: 'PENDING' } })

  if (pendings.length === 0) {
    console.log('Tidak ada transaksi PENDING.')
    return
  }

  for (const trx of pendings) {
    console.log(`Mengecek status TRX: ${trx.refIdH2h}`)
    const result = await checkTransaction(trx.refIdH2h)
    
    if (result.status === 'Sukses') {
      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId: trx.userId },
          data: {
            balance: { decrement: trx.sellPrice },
            balanceHold: { decrement: trx.sellPrice },
          },
        })
        await tx.transaction.update({
          where: { id: trx.id },
          data: { status: 'SUCCESS', sn: result.sn || null },
        })
      })
      console.log(`✅ Berhasil diupdate ke SUCCESS (SN: ${result.sn})`)
    } else if (result.status === 'Gagal') {
      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId: trx.userId },
          data: { balanceHold: { decrement: trx.sellPrice } },
        })
        await tx.transaction.update({
          where: { id: trx.id },
          data: { status: 'FAILED', failReason: result.message },
        })
      })
      console.log(`❌ Berhasil diupdate ke FAILED (${result.message})`)
    } else {
      console.log(`⏳ Masih PENDING di Digiflazz`)
    }
  }
}

syncPending().catch(console.error).finally(() => prisma.$disconnect())
