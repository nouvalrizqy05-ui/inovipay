import { formatRupiah } from '@/lib/utils'

const samplePrices = [
  { product: 'Telkomsel 10.000', costPrice: 10350, sellExample: 11500, category: 'Pulsa' },
  { product: 'XL 25.000', costPrice: 24500, sellExample: 26000, category: 'Pulsa' },
  { product: 'Token PLN 50.000', costPrice: 49800, sellExample: 52000, category: 'Token PLN' },
  { product: 'Token PLN 100.000', costPrice: 99500, sellExample: 102000, category: 'Token PLN' },
  { product: 'MLBB 86 Diamonds', costPrice: 18500, sellExample: 22000, category: 'Game' },
  { product: 'MLBB 172 Diamonds', costPrice: 36500, sellExample: 40000, category: 'Game' },
  { product: 'Free Fire 100 DM', costPrice: 14800, sellExample: 17000, category: 'Game' },
  { product: 'Indosat 5GB', costPrice: 29000, sellExample: 32000, category: 'Data' },
]

export default function PriceList() {
  return (
    <section id="harga" className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Harga Modal <span className="text-amber-500">Terbuka & Transparan</span>
          </h2>
          <p className="text-lg text-gray-600">
            Cek langsung perbandingan harga modal kami. Margin keuntungan Anda tentukan sendiri!
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Produk</th>
                  <th className="text-left px-6 py-4 font-semibold">Kategori</th>
                  <th className="text-right px-6 py-4 font-semibold">Harga Modal</th>
                  <th className="text-right px-6 py-4 font-semibold">Contoh Harga Jual</th>
                  <th className="text-right px-6 py-4 font-semibold">Profit / Trx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {samplePrices.map((item, idx) => {
                  const margin = item.sellExample - item.costPrice
                  return (
                    <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.product}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-700">{formatRupiah(item.costPrice)}</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-700">{formatRupiah(item.sellExample)}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">+{formatRupiah(margin)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 px-6 py-4 text-sm text-amber-800 border-t border-amber-100">
            💡 <strong>Catatan:</strong> Harga di atas adalah sampel dan dapat berubah sewaktu-waktu. Harga jual bisa Anda tentukan sendiri untuk memaksimalkan margin.
          </div>
        </div>
      </div>
    </section>
  )
}
