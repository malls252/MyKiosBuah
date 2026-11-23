// [AI] prompt: "Buat src/modules/transaksi/hitung.ts berisi fungsi murni perhitungan kasir: hitungSubtotalItem, hitungTotal, dan hitungKembalian dengan penanganan floating point aman."

// [AI] prompt: "Helper fungsi bulatkanDuaDesimal untuk mencegah kesalahan pembulatan floating point JavaScript."
export function bulatkanDuaDesimal(nilai: number): number {
  return Math.round((nilai + Number.EPSILON) * 100) / 100;
}

export interface ItemHitung {
  beratKg: number;
  hargaSatuan: number;
  diskon?: number;
}

export interface HasilHitungTotal {
  totalBruto: number;
  totalDiskon: number;
  totalBayar: number;
  subtotalPerItem: number[];
}

// [AI] prompt: "Fungsi hitungSubtotalItem menghitung subtotal satu baris item buah (beratKg * hargaSatuan - diskon) dengan validasi diskon tidak boleh melebihi harga bruto."
export function hitungSubtotalItem(
  beratKg: number,
  hargaSatuan: number,
  diskon = 0
): number {
  const brutoItem = bulatkanDuaDesimal(beratKg * hargaSatuan);

  if (diskon > brutoItem) {
    throw new Error(
      `Diskon (Rp${diskon}) tidak boleh melebihi total harga buah (Rp${brutoItem}).`
    );
  }

  const subtotal = bulatkanDuaDesimal(brutoItem - diskon);

  if (subtotal < 0) {
    throw new Error("Subtotal item buah tidak boleh bernilai negatif.");
  }

  return subtotal;
}

// [AI] prompt: "Fungsi hitungTotal menghitung totalBruto, totalDiskon, totalBayar, dan array subtotalPerItem sesuai rumus constraint basis data."
export function hitungTotal(items: ItemHitung[]): HasilHitungTotal {
  let totalBruto = 0;
  let totalDiskon = 0;
  const subtotalPerItem: number[] = [];

  for (const item of items) {
    const diskonItem = item.diskon ?? 0;
    const brutoItem = bulatkanDuaDesimal(item.beratKg * item.hargaSatuan);
    const subtotalItem = hitungSubtotalItem(
      item.beratKg,
      item.hargaSatuan,
      diskonItem
    );

    totalBruto = bulatkanDuaDesimal(totalBruto + brutoItem);
    totalDiskon = bulatkanDuaDesimal(totalDiskon + diskonItem);
    subtotalPerItem.push(subtotalItem);
  }

  // totalBayar = totalBruto - totalDiskon (sesuai constraint chk_transaksi_total)
  const totalBayar = bulatkanDuaDesimal(totalBruto - totalDiskon);

  return {
    totalBruto,
    totalDiskon,
    totalBayar,
    subtotalPerItem,
  };
}

// [AI] prompt: "Fungsi hitungKembalian menghitung kembalian uang transaksi kasir (uangDiterima - totalBayar) dan menolak jika uang kurang."
export function hitungKembalian(
  uangDiterima: number,
  totalBayar: number
): number {
  if (uangDiterima < totalBayar) {
    throw new Error("Uang yang diterima kurang");
  }

  return bulatkanDuaDesimal(uangDiterima - totalBayar);
}
