const crypto = require('crypto')

const username = 'zogicoDaev0D'
const apiKey = '7883ac7c-75ba-538f-bc82-db985abb93f1'

const sign = crypto
  .createHash('md5')
  .update(username + apiKey + 'depo')
  .digest('hex')

async function cek() {
  const res = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: 'deposit',
      username: username,
      sign: sign
    })
  })

  const data = await res.json()
  console.log(JSON.stringify(data, null, 2))
}

cek().catch(console.error)
