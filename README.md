# InoviPay — Platform PPOB & Server Pulsa

Platform reseller digital lengkap: pulsa, paket data, token PLN, PDAM, top up game, tagihan pascabayar, dan lainnya. Berbasis Next.js 14, PostgreSQL, Prisma, dan Digiflazz H2H API.

---

## ✨ Fitur Lengkap

### 📱 Mobile App (Reseller)
- **Dashboard** — saldo real-time, statistik harian, grafik keuntungan 7 hari, quick menu lengkap
- **Transaksi** — prabayar & pascabayar, PIN keamanan 6 digit, struk digital shareable via WhatsApp
- **Deposit** — multi metode (Bank Transfer, VA, QRIS, ShopeePay, OVO), quick amount button
- **Wallet** — mutasi saldo lengkap dengan ledger masuk/keluar
- **Kasir Digital** — input manual item, cetak/share struk via WhatsApp
- **Catatan** — simpan catatan bisnis personal
- **Promo** — banner promo dinamis dari admin
- **Official** — tutorial, kontak CS, dokumen legal
- **Profil** — setup PIN, ganti password, info tier, poin reward, referral code

### 🏠 Panel Admin
- **Dashboard** — statistik platform, alert saldo Digiflazz, shortcut aksi cepat, grafik 7 hari
- **Reseller** — aktivasi/suspend, cari & filter, lihat saldo per reseller
- **Deposit** — approve/reject dengan catatan, notifikasi WA otomatis ke reseller
- **Transaksi** — lihat semua transaksi, filter status, lihat margin per transaksi
- **Produk** — tambah manual + sync dari Digiflazz dengan margin otomatis
- **Banner** — kelola banner promo, aktif/nonaktif, urutan tampilan
- **Konfigurasi** — threshold saldo, rekening bank, nama platform, minimum deposit

### 🔐 Keamanan
- PIN 6 digit wajib sebelum setiap transaksi
- JWT authentication dengan expiry 7 hari
- Rate limiting di middleware
- HMAC-MD5 signature verifikasi webhook Digiflazz
- Balance hold mencegah double-spend

### 💎 Sistem Bisnis
- Tier harga: Reseller → Agen → Master Dealer (harga berbeda per tier)
- Poin reward: 1 poin per Rp 1.000 margin, otomatis dihitung saat transaksi
- Referral code: auto-generate saat register, bonus untuk referrer
- Notifikasi WhatsApp via Fonnte (opsional)
- Alert saldo Digiflazz otomatis ke admin (threshold bisa diatur)

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
# Edit .env — isi DATABASE_URL, JWT_SECRET minimal
```

Generate JWT Secret:
```bash
openssl rand -base64 32
```

### 3. Database
```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Buat semua tabel
npm run db:seed       # Buat admin + config default + banner contoh
```

### 4. Jalankan
```bash
npm run dev
# http://localhost:3000
```

Login admin: cek output `npm run db:seed` atau lihat `.env` (ADMIN_EMAIL / ADMIN_PASSWORD)

---

## 🗂️ Struktur API

| Endpoint | Metode | Akses | Fungsi |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Login |
| `/api/auth/register` | POST | Public | Daftar reseller + referral |
| `/api/auth/set-pin` | POST | Auth | Set/ubah PIN transaksi |
| `/api/auth/verify-pin` | POST | Auth | Verifikasi PIN sebelum transaksi |
| `/api/auth/forgot-password` | POST | Public | Reset password via WA |
| `/api/reseller/dashboard` | GET | Reseller | Dashboard data + poin + recent tx |
| `/api/reseller/products` | GET | Reseller | Produk dengan harga sesuai tier |
| `/api/reseller/profile` | GET/PATCH | Reseller | Profil + hasPIN + tier + poin |
| `/api/reseller/report` | GET | Reseller | Laporan periode (today/week/month) |
| `/api/transactions` | GET/POST | Auth | Transaksi + poin otomatis |
| `/api/transactions/receipt/:id` | GET | Auth | Data struk digital |
| `/api/deposits` | GET/POST | Reseller | Deposit saldo |
| `/api/wallet` | GET | Reseller | Saldo + ledger mutasi |
| `/api/favorites` | GET/POST | Auth | Nomor favorit |
| `/api/catatan` | GET/POST | Auth | Catatan personal |
| `/api/notifications` | GET/PATCH | Auth | Notifikasi + mark read |
| `/api/admin/dashboard` | GET | Admin | Statistik platform |
| `/api/admin/resellers` | GET | Admin | Daftar reseller |
| `/api/admin/resellers/:id` | PATCH | Admin | Aktivasi/suspend |
| `/api/admin/deposits` | GET | Admin | Deposit pending |
| `/api/admin/deposits/:id` | PATCH | Admin | Approve/reject deposit |
| `/api/admin/products` | GET/POST | Admin | Produk |
| `/api/admin/products/sync` | POST | Admin | Sync dari Digiflazz |
| `/api/admin/banners` | GET/POST | Auth/Admin | Banner promo |
| `/api/admin/banners/:id` | PATCH/DELETE | Admin | Edit/hapus banner |
| `/api/admin/config` | GET/PATCH | Admin | Konfigurasi sistem |
| `/api/webhook/digiflazz` | POST | Digiflazz | Callback transaksi |

---

## 📱 Design System
- Mobile-first: layout khusus mobile dengan bottom navigation (seperti MyKonter)
- Desktop: sidebar navigation
- Warna utama: `#00B4A0` (teal), `#FF6B35` (orange accent)
- Font: Inter
- Komponen: Tailwind CSS + custom classes

---

## ⚙️ Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="random-32-char-string"
DIGIFLAZZ_USERNAME="username"
DIGIFLAZZ_API_KEY_DEV="dev-xxx"
DIGIFLAZZ_API_KEY_PROD="prod-xxx"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@inovipay.id"
ADMIN_PASSWORD="Admin123456!"
FONNTE_TOKEN=""  # WhatsApp notifications (opsional)
```

---

## 🔗 Webhook Digiflazz

Setelah deploy, set callback URL di dashboard Digiflazz:
```
https://domain-kamu.com/api/webhook/digiflazz
```
