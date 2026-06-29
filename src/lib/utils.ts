export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}

export function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    SUCCESS: 'badge-success',
    PENDING: 'badge-pending',
    FAILED: 'badge-failed',
    ACTIVE: 'badge-active',
    SUSPENDED: 'badge-suspended',
    APPROVED: 'badge-success',
    REJECTED: 'badge-failed',
  }
  return map[status] ?? 'badge-info'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    SUCCESS: 'Sukses',
    PENDING: 'Pending',
    FAILED: 'Gagal',
    ACTIVE: 'Aktif',
    SUSPENDED: 'Disuspend',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
  }
  return map[status] ?? status
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    PULSA: 'Pulsa',
    DATA: 'Paket Data',
    TOKEN_PLN: 'Token PLN',
    PDAM: 'PDAM',
    GAME: 'Top Up Game',
    LAINNYA: 'Lainnya',
  }
  return map[cat] ?? cat
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '...' : str
}
