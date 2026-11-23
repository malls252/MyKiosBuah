// [AI] prompt: Utilitas pembantu formatRupiah (Intl.NumberFormat id-ID tanpa desimal) dan formatTanggalWaktu (Asia/Jakarta)
export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nominal);
}

export function formatTanggalWaktu(waktu: Date | string): string {
  const t = typeof waktu === 'string' ? new Date(waktu) : waktu;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(t);
}
