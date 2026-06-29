'use client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#F97316] z-50 flex items-center px-4 shadow-md">
        <button onClick={() => router.back()} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors absolute left-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium text-white flex-1 text-center">Syarat & Ketentuan</h1>
      </div>

      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Syarat & Ketentuan InoviStore</h1>
        <p className="text-gray-500 mb-8">Pembaruan Terakhir: 29 Juni 2026</p>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Kebijakan Layanan</h2>
            <p>Dengan mengunduh atau menggunakan aplikasi ini, syarat-syarat ini secara otomatis berlaku bagi Anda. Anda harus memastikan untuk membacanya dengan cermat sebelum menggunakan aplikasi. Anda dilarang menyalin atau memodifikasi aplikasi, bagian apa pun dari aplikasi, atau merek dagang kami dengan cara apa pun. Anda dilarang mencoba mengekstrak kode sumber aplikasi, dan Anda juga tidak boleh mencoba menerjemahkan aplikasi ke dalam bahasa lain atau membuat versi turunannya. Aplikasi itu sendiri, dan semua merek dagang, hak cipta, hak basis data, dan hak kekayaan intelektual lainnya yang terkait dengannya, masih menjadi milik InoviStore - Software Pulsa & PPOB.</p>
            <p>Demi keamanan & kenyamanan anda dalam melakukan transaksi, semua member berkewajiban membaca dan mematuhi syarat dan ketentuan yang telah ditetapkan oleh InoviStore.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Layanan</h2>
            <p>InoviStore melayani penjualan produk seperti :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pulsa elektrik All Operator</li>
              <li>Pulsa Internet All Operator</li>
              <li>Pulsa SMS All Operator</li>
              <li>Pulsa Telepon All Operator</li>
              <li>Voucher Game Online</li>
              <li>Voucher PLN Prabayar</li>
              <li>Pembayaran Multifinance</li>
              <li>Pembayaran PPOB</li>
              <li>Voucher Fisik</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Kondisi</h2>
            <p>Kesepakatan ini berlaku antara pengguna layanan yaitu member yang akan mendaftar dengan penyedia layanan yaitu InoviStore, dan tidak dapat dipindah tangankan atau diwakilkan.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Pengguna Layanan</h2>
            <p>Pengguna layanan InoviStore tanpa kecuali diwajibkan mendaftarkan dirinya dengan menggunakan identitas asli sesuai dengan KTP.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Jaminan</h2>
            <p>InoviStore memberikan jaminan berupa :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Keamanan data dan identitas pribadi pengguna layanan.</li>
              <li>Validasi proses pemotongan saldo.</li>
            </ul>
            <p className="pt-2">InoviStore tidak memberikan jaminan berupa apapun terhadap resiko kerugian yang diderita oleh pengguna layanan baik secara langsung maupun tidak langsung, baik material maupun non-material. Termasuk pada kerugian yang disebabkan oleh :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Kehilangan nomor HP yang digunakan untuk transaksi.</li>
              <li>Pencurian pulsa atau tindakan hacker terhadap password account yahoo/gtalk/media transaksi lainnya dari pengguna layanan. akibat pembobolan id atau lainnya yang dipergunakan untuk melakukan transaksi.</li>
              <li>Salah kirim nomor HP tujuan.</li>
              <li>Gangguan service provider.</li>
              <li>Gangguan lain yang mempengaruhi layanan yang disediakan.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Dukungan Teknis</h2>
            <p>Pengguna layanan (member) yang masih aktif berhak mendapatkan support teknis dari InoviStore pada jam operasional layanan yang disediakan. Meliputi :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>CS Complaint Online</strong> adalah divisi yang menangani complain untuk transaksi yang bermasalah, secara Online melalui Telepon, Whatsapp, dan Mobile Apps.</li>
              <li><strong>CS Registrasi Online</strong> adalah divisi yang melayani pendaftaran bagi member baru dan menjawab pertanyaan seputar produk dan jenis layanan InoviStore, secara online melalui Telepon dan Whatsapp.</li>
              <li><strong>CS Deposit Online</strong> adalah divisi yang membantu menangani atau memberikan informasi terkait dengan transaksi deposit saldo secara online melalui Telepon, Whatsapp dan Mobile Apps.</li>
            </ul>
          </section>

          <hr className="my-8 border-gray-200" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Waktu Layanan</h2>
            <p>Jam operasional layanan InoviStore adalah sebagai berikut :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Layanan penjualan pulsa elektrik, pulsa internet, voucher game, pulsa PLN prabayar, dan layanan PPOB : setiap hari pukul 00.15 WIB - 23:45 WIB.</li>
              <li>Layanan deposit offline (datang langsung ke outlet) : Senin s/d Sabtu pukul 07:30 WIB - 20:30 WIB (hari Minggu dan hari libur nasional tutup).</li>
              <li>Layanan deposit via transfer (tiket) melalui bank BCA, Mandiri, BNI, BRI : mengikuti jam offline bank yang terkait.</li>
              <li>Layanan deposit via transfer non tiket BCA, Mandiri, BNI, BRI : Senin s/d Sabtu pukul 07:30 WIB - 20:30 WIB (hari Minggu dan hari libur nasional tutup).</li>
              <li>Customer Service Deposit : Setiap hari pukul 06:00 WIB - 23:00 WIB.</li>
              <li>Customer Service Transaksi Online 24 Jam.</li>
            </ul>
            <p className="pt-2">Dengan pertimbangan untuk efektifitas atau adanya gangguan teknis dan dalam kondisi diluar kemampuan kami maka InoviStore berhak merubah jam layanannya.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Kewajiban Pengguna Layanan</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Untuk alasan keamanan silahkan untuk melakukan penggantian PIN transaksi secara berkala.</li>
              <li>Menjaga kerahasiaan dan keamanan account atau ID lainnya yang dipergunakan untuk melakukan transaksi di InoviStore dengan cara menggunakan password angka acak yang sulit di tebak.</li>
              <li>Bertutur kata sopan dan dapat dipertanggungjawabkan.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Suspensi & Penghentian Layanan</h2>
            <p>InoviStore sebagai penyedia layanan berhak untuk menghentikan kerja sama dengan user apabila :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Member tidak melakukan aktivitas transaksi selama lebih dari 3 bulan.</li>
              <li>Member melakukan tindakan atau perbuatan yang bisa menimbulkan fitnah atau provokasi sehingga mengganggu kenyamanan user lainnya dan mengganggu kelancaran operasional.</li>
              <li>Member tidak bisa mematuhi syarat dan ketentuan yang tercantum dalam term of service yang telah disetujui pada awal melakukan kerja sama.</li>
            </ul>
            <p className="pt-2">Apabila ada saldo deposit yang tersisa pada account yang di suspend, maka saldo tersebut akan dikembalikan via transfer bank kepada member tersebut.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Perubahan Term of Services</h2>
            <p>InoviStore berhak melakukan perubahan dan penyesuaian terhadap Term Of Service Agreement dan mengikat kepada semua pengguna layanan dan atau produk InoviStore.</p>
            <p>Dengan mendaftar pada InoviStore maka secara otomatis member menyatakan telah membaca dan setuju terhadap Term Of Service Agreement dan semua perubahannya.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Hukum dan Undang - Undang yang Berlaku</h2>
            <p>Semua kesepakatan antara InoviStore dan member mengacu penuh kepada Hukum dan Undang - Undang yang berlaku di dalam wilayah Negara Kesatuan Republik Indonesia.</p>
          </section>

        </div>
      </div>
      </div>
    </div>
  )
}
