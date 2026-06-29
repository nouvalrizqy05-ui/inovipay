#!/bin/bash
set -e

echo "🚀 InoviPay Setup Script"
echo "========================"

# Cek Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak ditemukan. Install dari https://nodejs.org (v18+)"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ Node.js versi $NODE_VER terlalu lama. Butuh v18+"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Cek .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  File .env dibuat dari .env.example"
    echo "⚠️  WAJIB isi DATABASE_URL dan JWT_SECRET sebelum lanjut!"
    echo ""
    read -p "Sudah isi .env? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Silakan isi .env dulu, lalu jalankan setup.sh lagi."
        exit 0
    fi
fi

echo ""
echo "📦 Install dependencies..."
npm install

echo ""
echo "🔧 Generate Prisma client..."
npm run db:generate

echo ""
echo "🗄️  Migrate database..."
npm run db:migrate

echo ""
echo "🌱 Seed data awal (admin + config + banner)..."
npm run db:seed

echo ""
echo "✅ Setup selesai!"
echo ""
echo "Jalankan: npm run dev"
echo "Buka: http://localhost:3000"
echo ""
echo "Login admin: lihat output seed di atas atau cek .env (ADMIN_EMAIL / ADMIN_PASSWORD)"
