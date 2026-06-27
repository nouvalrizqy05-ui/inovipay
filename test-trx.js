
const crypto = require('crypto')

const username = process.env.DIGIFLAZZ_USERNAME
const apiKey = process.env.DIGIFLAZZ_API_KEY_PROD

const refId = 'TEST-' + Date.now()

const sign = crypto
  .createHash('md5')
  .update(username + apiKey + refId)
  .digest('hex')

async function cek() {
  const res = await fetch('https://api.digiflazz.com/v1/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      buyer_sku_code: 'xld10',
      customer_no: '087800001233',
      ref_id: refId,
      sign: sign,
      testing: false
    })
  })

  const data = await res.json()
  console.log(JSON.stringify(data, null, 2))
}

cek().catch(console.error)
