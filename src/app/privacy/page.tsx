'use client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#F97316] z-50 flex items-center px-4 shadow-md">
        <button onClick={() => router.back()} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors absolute left-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium text-white flex-1 text-center">Privacy Policy</h1>
      </div>

      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Kebijakan Privasi</h1>
        <p className="text-gray-500 mb-8">Pembaruan Terakhir: 29 Juni 2026</p>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section className="space-y-4">
            <p><strong>InoviStore - Software Pulsa & PPOB</strong> membuat aplikasi <i>InoviStore</i> sebagai aplikasi gratis. LAYANAN ini disediakan oleh <i>InoviStore - Software Pulsa & PPOB</i> tanpa biaya dan ditujukan untuk digunakan sebagaimana adanya.</p>
            <p>Halaman ini digunakan untuk memberi tahu pengunjung mengenai kebijakan kami dalam pengumpulan, penggunaan, dan pengungkapan Informasi Pribadi jika seseorang memutuskan menggunakan Layanan kami.</p>
            <p>Jika Anda memilih untuk menggunakan Layanan kami, maka Anda setuju dengan pengumpulan dan penggunaan informasi sehubungan dengan kebijakan ini. Informasi Pribadi yang kami kumpulkan digunakan untuk menyediakan dan meningkatkan Layanan. Kami tidak akan menggunakan atau membagikan informasi Anda dengan siapa pun kecuali sebagaimana dijelaskan dalam Kebijakan Privasi ini.</p>
            <p>Istilah yang digunakan dalam Kebijakan Privasi ini memiliki makna yang sama seperti dalam Syarat dan Ketentuan kami, yang dapat diakses di aplikasi <i>InoviStore - Software Pulsa & PPOB</i>, kecuali didefinisikan lain dalam Kebijakan Privasi ini.</p>
            <p>Berikut adalah kebijakan privasi InoviStore yang bertujuan untuk perlindungan privasi Anda.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Kebijakan Data</h2>
            <p>Server Pulsa InoviStore sangat menghormati hal-hal yang berkenaan dengan perlindungan privasi Anda. Oleh karena itu, Kami menyusun Kebijakan Privasi ini untuk menjelaskan kepada anda bagaimana kami memperoleh, mengumpulkan, mengolah, menganalisis, menggunakan, menyimpan, menampilkan, menghapus dan memusnahkan Data Pribadi anda yang diberikan kepada kami atau yang dikumpulkan oleh kami baik pada saat mengunduh, melakukan registrasi, mengakses situs web, serta menggunakan layanan atau produk Server Pulsa InoviStore.</p>
            <p>Dengan menggunakan aplikasi InoviStore berarti anda mengakui bahwa anda telah membaca, memahami dan menyetujui seluruh ketentuan yang terdapat dalam Kebijakan Privasi ini, yang adalah satu kesatuan yang tak terpisahkan dengan Syarat dan Ketentuan InoviStore. Istilah-istilah dalam huruf kapital yang digunakan memiliki arti yang sama dengan yang terdapat dalam Syarat dan Ketentuan Server Pulsa InoviStore.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">A. DATA PRIBADI</h2>
            <p><strong>"DATA PRIBADI"</strong> adalah setiap data, informasi dan/atau keterangan dalam bentuk apapun yang dapat mengidentifikasikan diri anda, yang dari waktu ke waktu anda sampaikan kepada kami atau yang anda cantumkan atau sampaikan dalam, pada, dan/atau melalui Aplikasi yang menyangkut informasi mengenai pribadi anda, yang mencakup antara lain: nama lengkap, alamat surat elektronik (e-mail), nomor telepon genggam/handphone (termasuk namun tidak terbatas pada : IP Address, Informasi lokasi, data perangkat anda, nomor IMEI, nama aplikasi yang telah dilekatkan pada perangkat anda), akses eksternal storage, kamera, data yang menyangkut informasi mengenai kegiatan transaksi anda pada Aplikasi InoviStore, dan data lainnya yang tergolong sebagai data pribadi.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">B. KEAKURATAN DATA PRIBADI</h2>
            <p>Kami membutuhkan Data Pribadi anda, salah satunya adalah untuk dapat melakukan pemrosesan transaksi. Oleh karena itu, Data Pribadi yang anda berikan kepada kami haruslah seakurat mungkin dan tidak menyesatkan. Anda harus memperbaharui dan memberitahukan kepada kami apabila ada perubahan terhadap Data Pribadi anda. Anda dengan ini membebaskan kami dari setiap tuntutan, gugatan, ganti rugi, dan/atau klaim sehubungan dengan kegagalan pemrosesan transaksi pada Aplikasi InoviStore yang disebabkan oleh ketidakakuratan Data Pribadi yang anda berikan kepada kami.</p>
            <p>Apabila anda belum berusia 18 tahun, belum menikah atau berada di bawah pengampuan maka anda memerlukan persetujuan dari orang tua, wali atau pengampu anda yang sah untuk memberikan Data Pribadi kepada kami. Jika Data Pribadi anda tersebut diberikan kepada kami, anda dengan ini menyatakan dan menjamin bahwa orang tua, wali yang sah atau pengampu anda telah menyetujui pemrosesan Data Pribadi anda tersebut dan secara pribadi menerima dan setuju untuk terikat oleh Kebijakan Privasi ini dan bertanggung jawab.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">C. PENGUMPULAN DATA PRIBADI</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Penyediaan Data Pribadi anda bersifat sukarela. Namun, jika anda tidak memberikan Data Pribadi anda kepada kami, kami tidak akan dapat memproses Data Pribadi anda untuk tujuan yang diuraikan dibawah ini, dan dapat menyebabkan kami tidak dapat memberikan layanan-layanan atau produk-produk kepada, atau memproses pembayaran-pembayaran diri anda.</li>
              <li>Kami akan mengumpulkan Data Pribadi anda pada saat anda membuat atau melakukan pembaruan akun atau pada saat lainnya sebagaimana kami mintakan kepada anda apabila dibutuhkan dari waktu ke waktu.</li>
              <li>Kami akan mengumpulkan Data Pribadi anda setiap kali anda mengakses Aplikasi InoviStore atau melakukan transaksi menggunakan Aplikasi InoviStore.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">D. PENGGUNAAN DATA PRIBADI</h2>
            <p>Kami akan mengolah, menganalisis, dan/atau menggunakan Data Pribadi anda untuk tujuan sebagai berikut maupun tujuan lain yang diizinkan oleh peraturan perundang-undangan yang berlaku :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Mengidentifikasikan dan mendaftarkan anda sebagai pengguna Aplikasi InoviStore dan melakukan verifikasi, menonaktifkan atau mengelola akun anda, termasuk melakukan proses Mengenal Pelanggan (Know Your Customer);</li>
              <li>Memungkinkan kami untuk menyediakan layanan yang anda minta atau memproses transaksi yang anda minta;</li>
              <li>Memproses dan mengelola Saldo InoviStore anda;</li>
              <li>Gambar atau foto yang diunggah dalam aplikasi InoviStore akan digunakan untuk bahan verifikasi data atau keperluan lainnya;</li>
              <li>Aplikasi kami akan meminta akses untuk membaca data kontak anda dan akan ditampilkan secara otomatis untuk memudahkan anda memasukkan data pada fitur pengisian pulsa atau pembayaran biaya telepon selular ataupun telepon rumah, sehingga anda tidak perlu berulang-ulang menuliskan nomor tujuan, sistem kami juga secara otomatis akan menyimpan nomor pelanggan untuk pembayaran listrik PLN baik pasca maupun prabayar, pembayaran PDAM, BPJS, TV Berlangganan, Games Online, internet pra maupun pasca, dan pembayaran cicilan keuangan;</li>
              <li>Mencegah, mendeteksi, menyelidiki, dan mengatasi terjadinya tindakan yang merupakan kejahatan, dilarang, ilegal, tidak sah atau curang, yang mungkin terjadi dalam penggunaan Aplikasi InoviStore (termasuk namun tidak batas pada penipuan (fraud), penggelapan, pencurian, dan pencucian uang);</li>
              <li>Mengembangkan, menambah dan menyediakan produk untuk memenuhi kebutuhan anda;</li>
              <li>Pelaksanaan riset mengenai data demografis pengguna Aplikasi InoviStore;</li>
              <li>Mengembangkan, meningkatkan, dan menyediakan layanan-layanan kami, Aplikasi InoviStore, dan fitur-fitur di dalam Aplikasi InoviStore;</li>
              <li>Pengiriman informasi yang kami anggap berguna untuk anda termasuk informasi tentang layanan dari kami setelah anda memberikan persetujuan kepada kami bahwa anda tidak keberatan dihubungi mengenai layanan kami;</li>
              <li>Tujuan administratif internal, seperti; audit, analisis data, rekaman-rekaman dalam database;</li>
              <li>Berkomunikasi dengan anda sehubungan dengan segala hal mengenai Aplikasi InoviStore dan/atau layanan-layanan kami;</li>
              <li>Menjaga keselamatan, keamanan, dan keberlangsungan Aplikasi InoviStore, layanan-layanan kami, dan/atau fitur-fitur daripadanya;</li>
              <li>Mengijinkan kami mengunggah nomor handphone anda ke aplikasi InoviStore untuk mengirimkan kode OTP ke nomor handphone anda pada saat akan login dan juga saat melakukan pendaftaran.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">E. AKSES TIDAK SAH</h2>
            <p>Kami bertanggung jawab terhadap Data Pribadi yang kami kumpulkan dari anda namun perlu diketahui anda juga bertanggung jawab untuk menjaga kerahasiaan Data Pribadi anda dengan tidak akan membiarkan pihak ketiga untuk dapat mengakses Data Pribadi anda tanpa persetujuan dan sepengetahuan anda. sehubungan dengan hal ini, Kami tidak bertanggung jawab atas penyalahgunaan akun, password dan/atau PIN anda yang anda buat dan gunakan untuk mengakses Data Pribadi anda dimanapun anda menyimpan Data Pribadi anda, termasuk akun, password, dan/atau PIN untuk mengakses atau login Aplikasi InoviStore anda. Anda wajib memberitahukan kepada kami apabila anda yakin bahwa password dan/atau PIN Aplikasi InoviStore anda disalahgunakan oleh pihak ketiga.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">F. PERMINTAAN AKSES DAN PERUBAHAN DATA PRIBADI</h2>
            <p>Tunduk pada peraturan perundang-undangan yang berlaku, Anda dapat meminta akses dan/atau meminta perubahan Data Pribadi anda, dengan menghubungi Customer Service atau Layanan Pelanggan InoviStore (dengan menyertakan bukti pendukung), melalui :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Telepon dan/atau Whatsapp</li>
              <li>e-mail ke CS InoviStore</li>
            </ul>
            <p>Kami berhak menolak permintaan anda untuk mengakses dan/atau mengubah Data Pribadi anda karena alasan yang dibenarkan berdasarkan peraturan perundang-undangan yang berlaku.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">G. PENCABUTAN PERSETUJUAN</h2>
            <p>Anda berhak untuk meminta kami untuk berhenti menggunakan Data Pribadi anda untuk tujuan sebagaimana disebutkan di atas. Apabila anda bermaksud untuk meminta kami menghentikan penggunaan Data Pribadi anda, Anda dapat menghubungi Customer Service atau Layanan Pelanggan InoviStore.</p>
            <p>Dalam hal pencabutan persetujuan tersebut dapat mengakibatkan penghentian setiap layanan akun anda atau perjanjian kami dengan anda, dengan ketentuan semua hak dan kewajiban yang muncul setelahnya harus dipenuhi. Setelah anda menyampaikan maksud untuk mencabut persetujuan anda, Kami akan memberitahukan tentang akibat yang mungkin terjadi, Sehingga anda dapat memutuskan apakah tetap ingin mencabut persetujuan anda atau tidak.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">H. PENGHAPUSAN AKUN</h2>
            <p>Jika Anda ingin menghapus akun Anda dari aplikasi InoviStore, Anda dapat mengirimkan permintaan ke alamat whatsapp kami. Anda dapat menghapus akun anda kapan saja dengan mengakses fitur pengaturan akun yang kami sediakan. Dengan menghapus akun anda, anda akan kehilangan akses ke semua layanan dan fitur yang kami tawarkan. Kami akan menghapus semua informasi pribadi anda dari database kami dalam waktu 30 hari sejak anda menghapus akun anda, kecuali jika kami diwajibkan oleh hukum untuk menyimpannya lebih lama.</p>
            <p>Anda bertanggung jawab untuk mencadangkan atau menyimpan data apapun yang anda inginkan sebelum menghapus akun anda. Kami tidak bertanggung jawab atas kerugian apapun yang timbul akibat penghapusan akun anda. Kami berhak untuk menolak permintaan penghapusan akun jika anda masih memiliki kewajiban atau tanggungan kepada kami atau pihak ketiga yang terkait dengan layanan kami.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">I. HUKUM YANG BERLAKU</h2>
            <p>Kebijakan Privasi ini diatur dan ditafsirkan sesuai dengan hukum Negara Republik Indonesia.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">J. PERUBAHAN TERHADAP KEBIJAKAN PRIVASI</h2>
            <p>Kami dapat untuk setiap saat mengubah, memperbarui, dan/atau menambahkan sebagian ataupun seluruh ketentuan dalam Kebijakan Privasi ini, sesuai dengan bisnis kami ke depan, dan/atau perubahan peraturan perundang-undangan.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">K. TANGGAL BERLAKU</h2>
            <p>Kebijakan Privasi ini berlaku sejak tanggal 10 Maret 2024.</p>
          </section>
        </div>
      </div>
      </div>
    </div>
  )
}
