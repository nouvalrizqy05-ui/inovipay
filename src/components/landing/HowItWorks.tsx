export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Daftar Akun Gratis",
      desc: "Tidak ada biaya pendaftaran. Cukup siapkan email, password, dan nomor WhatsApp. Dalam hitungan detik, akun InoviStore Anda langsung aktif!"
    },
    {
      num: "02",
      title: "Isi Saldo Semampunya",
      desc: "Tanpa minimum deposit yang memberatkan. Mulai dengan Rp50.000 saja sudah bisa langsung berjualan ratusan produk PPOB."
    },
    {
      num: "03",
      title: "Jualan & Untung!",
      desc: "Tawarkan ke keluarga, teman kampus, atau rekan kerja. Tentukan harga jual Anda sendiri, dan margin keuntungan langsung masuk kantong!"
    }
  ]

  return (
    <section id="cara-kerja" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Mulai Kurang dari <span className="text-amber-500">5 Menit</span>
          </h2>
          <p className="text-lg text-gray-600">
            Cara bergabung sangat mudah dan tidak ribet. Cukup ikuti 3 langkah sederhana ini:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative z-10">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-amber-100 -z-10"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative bg-white pt-8 px-6 pb-8 rounded-2xl border border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-black text-white absolute -top-8 left-1/2 -translate-x-1/2 shadow-lg group-hover:scale-110 transition-transform">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
