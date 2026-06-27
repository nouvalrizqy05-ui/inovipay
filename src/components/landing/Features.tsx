import { Zap, Wallet, ShieldCheck, Gamepad2 } from 'lucide-react'

const features = [
  {
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    title: 'Transaksi Secepat Kilat',
    description: 'Terintegrasi langsung dengan server H2H terbaik. Top-up pelanggan masuk dalam hitungan detik, pantang bikin pelanggan menunggu.'
  },
  {
    icon: <Wallet className="w-8 h-8 text-orange-500" />,
    title: 'Harga Dasar Agen',
    description: 'Sebagai Mitra Inovi, Anda mendapatkan akses harga modal termurah. Tentukan margin profit Anda sendiri secara bebas.'
  },
  {
    icon: <Gamepad2 className="w-8 h-8 text-blue-500" />,
    title: 'Katalog Super Lengkap',
    description: 'Dari Pulsa Reguler, Paket Data, Token PLN, hingga Voucher Game Premium (Mobile Legends, Genshin, dll) ada dalam satu saldo.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    title: 'Aman & Terpercaya',
    description: 'Sistem dilindungi enkripsi terkini dan proteksi PIN. Deposit dan saldo Anda terjamin keamanannya 24/7.'
  }
]

export default function Features() {
  return (
    <section id="fitur" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Kenapa Mitra Inovi <span className="text-amber-500">Pasti Untung?</span>
          </h2>
          <p className="text-lg text-gray-600">
            Kami merancang InoviPay khusus agar setiap mitra bisa berjualan dengan tenang, memuaskan pelanggan, dan mendapat untung maksimal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
