const crypto = require('crypto');

const BASE_URL = 'https://api.digiflazz.com/v1';
const username = "zogicoDaev0D";
// Let's test both dev and prod key
const keys = {
  dev: "dev-03717d30-71ef-11f1-ae89-552786b6eb69",
  prod: "7883ac7c-75ba-538f-bc82-db985abb93f1"
};

function sign(apiKey, suffix) {
  return crypto.createHash('md5').update(username + apiKey + suffix).digest('hex');
}

async function test(mode, apiKey) {
  console.log(`Testing ${mode} mode...`);
  try {
    const res = await fetch(`${BASE_URL}/cek-saldo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'deposit', username, sign: sign(apiKey, 'depo') }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function run() {
  await test('development', keys.dev);
  console.log('-------------------');
  await test('production', keys.prod);
}

run();
