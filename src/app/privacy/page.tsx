export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Kebijakan Privasi</h1>
        <p className="text-gray-500 mb-8">Pembaruan Terakhir: 28 Juni 2026</p>

        <div className="space-y-8 text-gray-600">
          <section>
            <p>Privasi Anda sangat penting bagi InoviPay. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Data yang Kami Kumpulkan</h2>
            <p>Saat Anda mendaftar, kami mengumpulkan informasi identifikasi pribadi, termasuk namun tidak terbatas pada:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Nama lengkap</li>
              <li>Nomor WhatsApp / Telepon Aktif</li>
              <li>Alamat Email</li>
              <li>Data Riwayat Transaksi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Penggunaan Data</h2>
            <p>Data yang dikumpulkan akan digunakan untuk:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Memverifikasi identitas Anda saat registrasi dan login.</li>
              <li>Memproses transaksi yang Anda lakukan.</li>
              <li>Menghubungi Anda terkait pembaruan layanan atau gangguan sistem.</li>
              <li>Memenuhi kewajiban hukum yang berlaku di Indonesia.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Perlindungan & Keamanan Data</h2>
            <p>Semua transmisi data pada platform InoviPay telah dilindungi menggunakan enkripsi standar industri (SSL). Password dan PIN Anda dienkripsi kuat menggunakan metode kriptografi satu arah (hash), sehingga bahkan admin internal InoviPay tidak bisa melihat password asli Anda.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Berbagi Data dengan Pihak Ketiga</h2>
            <p>Kami tidak akan pernah menjual, menyewakan, atau menukar data pribadi Anda dengan pihak ketiga manapun. Data hanya akan diteruskan ke penyedia layanan pihak ketiga (seperti Payment Gateway atau Biller Pulsa) sebatas yang diperlukan untuk mensukseskan transaksi Anda.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
