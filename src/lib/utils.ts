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
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date))
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
    SUCCESS: 'Sukses', PENDING: 'Pending', FAILED: 'Gagal',
    ACTIVE: 'Aktif', SUSPENDED: 'Disuspend',
    APPROVED: 'Disetujui', REJECTED: 'Ditolak',
  }
  return map[status] ?? status
}
