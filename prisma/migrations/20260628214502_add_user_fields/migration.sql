-- AlterTable
ALTER TABLE "users" ADD COLUMN     "alamat" TEXT,
ADD COLUMN     "kabupaten" TEXT,
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_exp" TIMESTAMP(3),
ADD COLUMN     "provinsi" TEXT,
ADD COLUMN     "store_name" TEXT;
