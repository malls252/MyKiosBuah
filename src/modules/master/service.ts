// [AI] prompt: Import dependensi error aplikasi, repository data master, dan tipe data master buah
import { ErrorValidasi, ErrorTidakDitemukan } from '@/lib/errors';
import {
  daftarKategori as repoDaftarKategori,
  buatKategori as repoBuatKategori,
  ubahKategori as repoUbahKategori,
  hapusKategori as repoHapusKategori,
  daftarSatuan as repoDaftarSatuan,
  buatSatuan as repoBuatSatuan,
  ubahSatuan as repoUbahSatuan,
  hapusSatuan as repoHapusSatuan,
  daftarBuah as repoDaftarBuah,
  daftarBuahAktif as repoDaftarBuahAktif,
  cariBuahById as repoCariBuahById,
  buatBuah as repoBuatBuah,
  ubahBuah as repoUbahBuah,
} from './repository';
import type { Kategori, Satuan, Buah, BuahAktif } from './types';
import type { KategoriInput, SatuanInput, BuahInput, UbahBuahInput } from './schema';

// ============================================================================
// FUNGSI UNTUK MODUL LAIN (KONTRAK RESMI)
// ============================================================================

// [AI] prompt: Fungsi getDaftarBuahAktif() sebagai satu-satunya pintu keluar data buah aktif untuk modul Transaksi Kasir dan Pesanan Online
export async function getDaftarBuahAktif(): Promise<BuahAktif[]> {
  return repoDaftarBuahAktif();
}

// ============================================================================
// LOGIKA BISNIS KATEGORI
// ============================================================================

// [AI] prompt: Mengambil seluruh daftar kategori buah
export async function daftarKategori(): Promise<Kategori[]> {
  return repoDaftarKategori();
}

// [AI] prompt: Menambah kategori buah baru dengan pembersihan spasi (trim)
export async function buatKategori(data: KategoriInput): Promise<Kategori> {
  return repoBuatKategori({
    namaKategori: data.namaKategori.trim(),
    deskripsi: data.deskripsi ? data.deskripsi.trim() : null,
  });
}

// [AI] prompt: Mengubah kategori buah yang sudah ada
export async function ubahKategori(
  id: number,
  data: { namaKategori?: string; deskripsi?: string | null }
): Promise<Kategori> {
  return repoUbahKategori(id, {
    namaKategori: data.namaKategori ? data.namaKategori.trim() : undefined,
    deskripsi: data.deskripsi !== undefined ? (data.deskripsi ? data.deskripsi.trim() : null) : undefined,
  });
}

// [AI] prompt: Menghapus kategori buah
export async function hapusKategori(id: number): Promise<void> {
  return repoHapusKategori(id);
}

// ============================================================================
// LOGIKA BISNIS SATUAN
// ============================================================================

// [AI] prompt: Mengambil seluruh daftar satuan buah
export async function daftarSatuan(): Promise<Satuan[]> {
  return repoDaftarSatuan();
}

// [AI] prompt: Menambah satuan buah baru dengan pembersihan spasi
export async function buatSatuan(data: SatuanInput): Promise<Satuan> {
  return repoBuatSatuan({
    namaSatuan: data.namaSatuan.trim(),
    simbol: data.simbol.trim(),
  });
}

// [AI] prompt: Mengubah satuan buah yang sudah ada
export async function ubahSatuan(
  id: number,
  data: { namaSatuan?: string; simbol?: string }
): Promise<Satuan> {
  return repoUbahSatuan(id, {
    namaSatuan: data.namaSatuan ? data.namaSatuan.trim() : undefined,
    simbol: data.simbol ? data.simbol.trim() : undefined,
  });
}

// [AI] prompt: Menghapus satuan buah
export async function hapusSatuan(id: number): Promise<void> {
  return repoHapusSatuan(id);
}

// ============================================================================
// LOGIKA BISNIS BUAH
// ============================================================================

// [AI] prompt: Mengambil seluruh daftar buah untuk halaman data master admin
export async function daftarBuah(): Promise<Buah[]> {
  return repoDaftarBuah();
}

// [AI] prompt: Menambah buah baru dengan validasi keberadaan idKategori dan idSatuan di sisi server
export async function buatBuah(data: BuahInput): Promise<Buah> {
  // 1. Periksa keberadaan idKategori
  const semuaKategori = await repoDaftarKategori();
  const kategoriValid = semuaKategori.some((k) => k.idKategori === data.idKategori);
  if (!kategoriValid) {
    throw new ErrorValidasi('Kategori yang dipilih tidak valid atau tidak ditemukan');
  }

  // 2. Periksa keberadaan idSatuan
  const semuaSatuan = await repoDaftarSatuan();
  const satuanValid = semuaSatuan.some((s) => s.idSatuan === data.idSatuan);
  if (!satuanValid) {
    throw new ErrorValidasi('Satuan yang dipilih tidak valid atau tidak ditemukan');
  }

  // 3. Simpan buah dengan nama yang dirapikan
  return repoBuatBuah({
    ...data,
    namaBuah: data.namaBuah.trim(),
  });
}

// [AI] prompt: Mengubah data buah dengan validasi keberadaan FK kategori/satuan jika disertakan
export async function ubahBuah(id: number, data: UbahBuahInput): Promise<Buah> {
  const buahLama = await repoCariBuahById(id);
  if (!buahLama) {
    throw new ErrorTidakDitemukan('Buah tidak ditemukan');
  }

  // Periksa idKategori jika ada perubahan
  if (data.idKategori !== undefined) {
    const semuaKategori = await repoDaftarKategori();
    const kategoriValid = semuaKategori.some((k) => k.idKategori === data.idKategori);
    if (!kategoriValid) {
      throw new ErrorValidasi('Kategori yang dipilih tidak valid atau tidak ditemukan');
    }
  }

  // Periksa idSatuan jika ada perubahan
  if (data.idSatuan !== undefined) {
    const semuaSatuan = await repoDaftarSatuan();
    const satuanValid = semuaSatuan.some((s) => s.idSatuan === data.idSatuan);
    if (!satuanValid) {
      throw new ErrorValidasi('Satuan yang dipilih tidak valid atau tidak ditemukan');
    }
  }

  return repoUbahBuah(id, {
    ...data,
    namaBuah: data.namaBuah ? data.namaBuah.trim() : undefined,
  });
}

// [AI] prompt: Mengubah status aktif atau nonaktif buah tanpa menghapus data agar riwayat transaksi tetap utuh
export async function setAktifBuah(id: number, aktif: boolean): Promise<Buah> {
  const buahLama = await repoCariBuahById(id);
  if (!buahLama) {
    throw new ErrorTidakDitemukan('Buah tidak ditemukan');
  }

  return repoUbahBuah(id, { aktif });
}
