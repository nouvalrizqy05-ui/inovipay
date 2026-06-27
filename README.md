# INOVIPAY - PPOB Platform

Platform reseller pulsa, data, token PLN, PDAM, top up game — berbasis Next.js 14 + PostgreSQL + Digiflazz API.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT via jose |
| Supplier API | Digiflazz H2H |
| Notifikasi WA | Fonnte (opsional) |

---

## Setup Awal

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Edit .env — isi semua variabel yang dibutuhkan
```

### 3. Generate JWT Secret
```bash
openssl rand -base64 32
# Copy hasilnya ke JWT_SECRET di .env
```

### 4. Setup database
```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Buat semua tabel
npm run db:seed       # Buat admin pertama + config default
```

### 5. Jalankan
```bash
npm run dev           # http://localhost:3000
```

---

## Struktur API Lengkap

### Auth
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Daftar reseller baru |
| POST | `/api/auth/login` | Public | Login, dapat JWT |
| POST | `/api/auth/logout` | Auth | Logout |
| POST | `/api/auth/forgot-password` | Public | Kirim kode reset via WA |
| POST | `/api/auth/reset-password` | Public | Reset password dengan kode |

### Reseller
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/reseller/dashboard` | Reseller | Statistik + saldo + grafik |
| GET | `/api/reseller/profile` | Reseller | Data profil |
| PATCH | `/api/reseller/profile` | Reseller | Update nama / password |

### Produk
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/products` | Auth | Daftar produk aktif |
| POST | `/api/products` | Admin | Tambah produk manual |
| POST | `/api/products/sync` | Admin | Sync produk dari Digiflazz |

### Transaksi
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/transactions` | Reseller | Buat transaksi baru |
| GET | `/api/transactions` | Auth | Riwayat (reseller: milik sendiri, admin: semua) |

### Wallet & Deposit
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/wallet` | Reseller | Saldo + mutasi |
| POST | `/api/deposits` | Reseller | Ajukan deposit |
| GET | `/api/deposits` | Reseller | Riwayat deposit |

### Admin
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Statistik platform + saldo Digiflazz |
| GET | `/api/admin/resellers` | Admin | Daftar reseller |
| PATCH | `/api/admin/resellers/[id]` | Admin | Aktivasi/suspend reseller |
| GET | `/api/admin/deposits` | Admin | Daftar deposit pending |
| PATCH | `/api/admin/deposits/[id]` | Admin | Approve/reject deposit |
| GET | `/api/admin/config` | Admin | Konfigurasi sistem + saldo Digiflazz |
| PATCH | `/api/admin/config` | Admin | Update konfigurasi |

### Webhook & Notifikasi
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/webhook/digiflazz` | Digiflazz | Callback status transaksi |
| GET | `/api/notifications` | Auth | Daftar notifikasi |
| PATCH | `/api/notifications` | Auth | Tandai semua sudah dibaca |

---

## Alur Bisnis Lengkap

### Reseller baru
```
Daftar → Status PENDING → Admin aktivasi → Status ACTIVE → Bisa transaksi
```

### Deposit saldo
```
Reseller transfer ke rekening admin
→ Upload bukti di platform
→ Admin approve
→ Saldo reseller bertambah otomatis
```

### Transaksi
```
Reseller pilih produk + isi nomor tujuan
→ Sistem cek saldo reseller
→ Sistem cek saldo Digiflazz (alert admin kalau menipis)
→ Hold saldo reseller
→ Kirim order ke Digiflazz
→ Sukses: potong saldo, kirim notifikasi WA
→ Gagal: lepas hold, notifikasi WA
→ Pending: tunggu callback webhook
```

### Saldo Digiflazz (admin)
```
Admin top up saldo Digiflazz manual via dashboard Digiflazz
→ Sistem otomatis alert kalau saldo < threshold (default Rp 500rb)
→ Threshold bisa diubah di /api/admin/config
```

---

## Setup Webhook di Digiflazz

Setelah deploy ke server dengan domain/IP publik:

1. Masuk dashboard Digiflazz → Atur Koneksi → API
2. Isi Callback URL:
   ```
   https://domain-kamu.com/api/webhook/digiflazz
   ```

---

## Notifikasi WhatsApp (Fonnte)

1. Daftar di [fonnte.com](https://fonnte.com)
2. Hubungkan nomor WhatsApp
3. Copy token ke `FONNTE_TOKEN` di `.env`

Kalau `FONNTE_TOKEN` tidak diisi, notifikasi WA dinonaktifkan otomatis — tidak error.

---

## Catatan Keamanan

- File `.env` sudah di `.gitignore` — jangan pernah commit
- `balance_hold` mencegah double-spend saat transaksi pending
- Semua operasi wallet pakai `prisma.$transaction()` — atomic
- Webhook Digiflazz diverifikasi via HMAC signature
- Alert saldo rendah ada rate limit 1 jam — tidak spam ke admin
