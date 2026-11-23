// [AI] prompt: "Buat src/modules/transaksi/types.ts berisi definisi tipe data ItemTransaksiInput, BuatTransaksiInput, BuahAktif, dan Struk sesuai use case transaksi kasir."

export interface ItemTransaksiInput {
  idBuah: number;
  beratKg: number;
  diskon: number;
}

export interface BuatTransaksiInput {
  item: ItemTransaksiInput[];
  metodeBayar: "Tunai" | "QRIS";
  uangDiterima?: number;
}

export interface BuahAktif {
  idBuah: number;
  namaBuah: string;
  hargaPerKg: number;
  simbolSatuan: string;
}

export interface ItemStruk {
  namaBuah: string;
  beratKg: number;
  hargaSatuan: number;
  diskon: number;
  subtotal: number;
}

export interface Struk {
  idTransaksi: number;
  tanggalWaktu: string | Date;
  namaKasir: string;
  item: ItemStruk[];
  totalBruto: number;
  totalDiskon: number;
  totalBayar: number;
  metodeBayar: "Tunai" | "QRIS";
  uangDiterima: number | null;
  kembalian: number | null;
}
