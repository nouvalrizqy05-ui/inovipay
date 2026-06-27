import { Smartphone, Wifi, Gamepad2, Zap, Droplets, CreditCard } from 'lucide-react'

const categories = [
  { icon: Smartphone, name: 'Pulsa All Operator', brands: 'Telkomsel, XL, Indosat, Tri, Smartfren', color: 'bg-red-50 text-red-500' },
  { icon: Wifi, name: 'Paket Data', brands: 'Internet, Nelpon, SMS, Combo', color: 'bg-blue-50 text-blue-500' },
  { icon: Zap, name: 'Token Listrik PLN', brands: 'PLN Prepaid 20rb - 1jt', color: 'bg-yellow-50 text-yellow-600' },
  { icon: Gamepad2, name: 'Voucher Game', brands: 'Mobile Legends, Free Fire, Genshin, PUBG', color: 'bg-purple-50 text-purple-500' },
  { icon: Droplets, name: 'PDAM', brands: 'Tagihan air seluruh Indonesia', color: 'bg-cyan-50 text-cyan-500' },
  { icon: CreditCard, name: 'E-Wallet', brands: 'OVO, GoPay, DANA, ShopeePay', color: 'bg-green-50 text-green-500' },
]

export default function ProductCatalog() {
  return (
    <section id="katalog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Satu Saldo, <span className="text-amber-500">Ratusan Produk</span>
          </h2>
          <p className="text-lg text-gray-600">
            Jual semua kebutuhan digital pelanggan Anda — dari pulsa hingga top-up game premium, semuanya ada di InoviPay.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{cat.brands}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
