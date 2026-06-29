import { Quote } from 'lucide-react'

export default function Testimonials() {
  const testis = [
    {
      name: "Budi Santoso",
      role: "Mahasiswa Semester 5",
      text: "Iseng-iseng daftar InoviStore buat jualan pulsa & ML ke temen kampus. Eh sekarang malah bisa bayar UKT sendiri. Margin-nya lumayan banget karena harga aslinya murah!",
      img: "https://i.pravatar.cc/150?img=11"
    },
    {
      name: "Siti Rahma",
      role: "Karyawan Swasta",
      text: "Lumayan banget buat sidejob. Temen sekantor pada beli token listrik sama paketan di saya. Aplikasi InoviStore-nya enteng dan transaksinya secepat kilat.",
      img: "https://i.pravatar.cc/150?img=5"
    },
    {
      name: "Andi Wijaya",
      role: "Penjaga Warkop",
      text: "Sambil jaga warkop, saya tawarin topup game ke bocah-bocah. Sehari bisa untung 50rb bersih. Rekomen banget jadi Mitra Inovi, daftarnya beneran gratis.",
      img: "https://i.pravatar.cc/150?img=12"
    }
  ]

  return (
    <section id="testimoni" className="py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">
            Cerita Sukses <span className="text-amber-500">Mitra Inovi</span>
          </h2>
          <p className="text-lg text-gray-400">
            Mereka sudah membuktikan bahwa waktu luang bisa jadi peluang emas. Kapan giliran Anda?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testis.map((t, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-amber-500 transition-colors">
              <Quote className="w-10 h-10 text-amber-500/20 mb-4" />
              <p className="text-gray-300 italic mb-6 leading-relaxed line-clamp-4">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border-2 border-gray-600" />
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-xs text-amber-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
