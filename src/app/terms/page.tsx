export default function TermsPage() {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Syarat & Ketentuan InoviPay</h1>
        <p className="text-gray-500 mb-8">Pembaruan Terakhir: 28 Juni 2026</p>

        <div className="space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Ketentuan Umum</h2>
            <p>Dengan mendaftar dan menggunakan layanan InoviPay, Anda secara otomatis menyetujui semua syarat dan ketentuan yang berlaku. InoviPay berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Akun Keagenan</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pendaftaran agen bersifat gratis.</li>
              <li>Satu identitas hanya boleh memiliki satu akun aktif.</li>
              <li>Anda bertanggung jawab penuh atas kerahasiaan password dan PIN transaksi Anda.</li>
              <li>Segala bentuk transaksi yang terjadi melalui akun Anda adalah tanggung jawab Anda sepenuhnya.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Saldo & Transaksi</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Saldo yang sudah diisikan tidak dapat diuangkan kembali (non-refundable), kecuali terdapat kesalahan sistem dari pihak InoviPay.</li>
              <li>Transaksi PPOB berjalan 24 jam nonstop kecuali ada gangguan dari pihak provider (Biller / H2H).</li>
              <li>Jika status transaksi "Gagal", saldo akan otomatis dikembalikan ke dompet akun Anda.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Pembekuan Akun</h2>
            <p>InoviPay berhak membekukan (suspend) atau menghapus akun tanpa peringatan jika ditemukan indikasi:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Penipuan, pencucian uang, atau tindak kriminal lainnya.</li>
              <li>Percobaan eksploitasi celah keamanan sistem (hacking).</li>
              <li>Penyalahgunaan data pelanggan.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
