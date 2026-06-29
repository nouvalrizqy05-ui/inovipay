# 🚀 Panduan Setup Lokal InoviPay

## Prasyarat

| Software | Versi Minimum | Download |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| PostgreSQL | v14+ | https://postgresql.org |
| Git | Bebas | https://git-scm.com |

---

## Langkah 1 — Setup PostgreSQL

### Windows
1. Download PostgreSQL dari https://postgresql.org/download/windows
2. Install dengan password default (catat passwordnya!)
3. Buka pgAdmin atau SQL Shell (psql)
4. Buat database baru:
```sql
CREATE DATABASE inovipay_db;
```

### Mac (Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
createdb inovipay_db
```

### Ubuntu/Debian
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb inovipay_db
```

---

## Langkah 2 — Clone / Extract Project

Kalau dari ZIP:
```bash
# Extract zip ke folder
cd inovipay-main
```

---

## Langkah 3 — Isi Environment Variables

```bash
cp .env.example .env
```

Buka file `.env` dan isi minimal:

```env
# Sesuaikan dengan username/password PostgreSQL kamu
DATABASE_URL="postgresql://postgres:password@localhost:5432/inovipay_db"

# Generate dengan: openssl rand -base64 32
JWT_SECRET="isi-random-string-panjang-minimal-32-karakter-di-sini"

# Dari dashboard Digiflazz > Atur Koneksi > API
DIGIFLAZZ_USERNAME="username_digiflazz"
DIGIFLAZZ_API_KEY_DEV="dev-xxxx-xxxx"
DIGIFLAZZ_API_KEY_PROD="prod-xxxx-xxxx"

NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Akun admin pertama
ADMIN_EMAIL="admin@inovipay.id"
ADMIN_PASSWORD="Admin123456!"
ADMIN_PHONE="081200000000"
```

> **Tips generate JWT_SECRET di Windows:**
> Buka PowerShell: `[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`

---

## Langkah 4 — Install & Setup

Cara cepat (Linux/Mac):
```bash
chmod +x setup.sh && ./setup.sh
```

Cara manual (semua OS):
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Buat semua tabel di database
npm run db:migrate

# Isi data awal (admin + config + banner)
npm run db:seed
```

---

## Langkah 5 — Jalankan

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

Login admin dengan email/password yang kamu set di `.env`

---

## Struktur Akun

| Role | Akses |
|---|---|
| **Admin** | Panel admin: kelola reseller, approve deposit, produk, banner, config |
| **Reseller** | Dashboard: transaksi, deposit, kasir, catatan, profil |

---

## Alur Bisnis

```
1. Admin login → Kelola produk (sync dari Digiflazz)
2. Reseller daftar → Status PENDING
3. Admin aktivasi reseller
4. Reseller deposit saldo → Admin approve → Saldo bertambah
5. Reseller transaksi → PIN 6 digit → Order ke Digiflazz → Dapat struk
6. Poin reward otomatis → Tier naik otomatis
```

---

## Fitur Digiflazz

**Sandbox (development):**
- Semua transaksi tidak nyata
- Saldo tidak berkurang
- Gunakan untuk testing

**Production:**
- Ganti `NODE_ENV=production` di `.env`
- Pastikan API Key Production sudah aktif di Digiflazz
- Whitelist IP server ke dashboard Digiflazz

---

## Troubleshooting

**Error: `Can't reach database server`**
→ PostgreSQL belum running. Start dulu: `brew services start postgresql` (Mac) atau `sudo service postgresql start` (Linux)

**Error: `Environment variable not found: DATABASE_URL`**
→ File `.env` belum dibuat atau belum diisi. Cek `cp .env.example .env`

**Error: `prisma:error Invalid \`prisma.user.create()\``**
→ Belum migrate database. Jalankan `npm run db:migrate`

**Error: `Module not found`**
→ Belum install dependencies. Jalankan `npm install`

**Halaman putih/blank setelah login**
→ Buka browser console (F12), cek error. Biasanya karena API error.

---

## Perintah Berguna

```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run db:studio    # Buka Prisma Studio (GUI database)
npm run db:migrate   # Jalankan migrasi database
npm run db:seed      # Reset data awal
```
