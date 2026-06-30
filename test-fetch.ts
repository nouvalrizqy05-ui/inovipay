import crypto from 'crypto'

async function run() {
  const username = 'zogicoDaev0D'
  const apiKey = '7883ac7c-75ba-538f-bc82-db985abb93f1'
  const sign = crypto.createHash('md5').update(username + apiKey + 'pricelist').digest('hex')
  const res = await fetch('https://api.digiflazz.com/v1/price-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'prepaid', username, sign })
  })
  const json = await res.json()
  console.log('STATUS:', res.status)
  console.log('JSON:', JSON.stringify(json).substring(0, 500))
}

run().catch(console.error)
