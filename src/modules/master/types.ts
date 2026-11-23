// [AI] prompt: Tipe data Kategori untuk kelompok klasifikasi buah
export type Kategori = {
  idKategori: number;
  namaKategori: string;
  deskripsi: string | null;
};

// [AI] prompt: Tipe data Satuan untuk unit pengukuran buah (misal: kg, gram, ikat)
export type Satuan = {
  idSatuan: number;
  namaSatuan: string;
  simbol: string;
};

// [AI] prompt: Tipe data Buah lengkap dengan relasi kategori dan satuan untuk antarmuka admin
export type Buah = {
  idBuah: number;
  namaBuah: string;
  idKategori: number;
  namaKategori: string;
  idSatuan: number;
  simbolSatuan: string;
  hargaPerKg: number;
  stokMinimum: number;
  aktif: boolean;
};

// [AI] prompt: Tipe data BuahAktif yang diekspor dan dipakai oleh modul lain (Transaksi Kasir & Pesanan)
export type BuahAktif = {
  idBuah: number;
  namaBuah: string;
  namaKategori: string;
  hargaPerKg: number;
  simbolSatuan: string;
};
