// [AI] prompt: Import pustaka database, error khusus aplikasi (ErrorBentrok, ErrorTidakDitemukan), dan tipe data master buah
import { query } from '@/lib/db';
import { ErrorBentrok, ErrorTidakDitemukan } from '@/lib/errors';
import type { Kategori, Satuan, Buah, BuahAktif } from './types';
import type { KategoriInput, SatuanInput, BuahInput, UbahBuahInput } from './schema';

// [AI] prompt: Fungsi pembantu untuk memetakan baris basis data ke objek Kategori
function petakanKeKategori(baris: Record<string, unknown>): Kategori {
  return {
    idKategori: baris.id_kategori as number,
    namaKategori: baris.nama_kategori as string,
    deskripsi: (baris.deskripsi as string | null) ?? null,
  };
}

// [AI] prompt: Fungsi pembantu untuk memetakan baris basis data ke objek Satuan
function petakanKeSatuan(baris: Record<string, unknown>): Satuan {
  return {
    idSatuan: baris.id_satuan as number,
    namaSatuan: baris.nama_satuan as string,
    simbol: baris.simbol as string,
  };
}

// [AI] prompt: Fungsi pembantu untuk memetakan baris basis data (dengan konversi NUMERIC string ke number) ke objek Buah
function petakanKeBuah(baris: Record<string, unknown>): Buah {
  return {
    idBuah: baris.id_buah as number,
    namaBuah: baris.nama_buah as string,
    idKategori: baris.id_kategori as number,
    namaKategori: baris.nama_kategori as string,
    idSatuan: baris.id_satuan as number,
    simbolSatuan: baris.simbol as string,
    hargaPerKg: Number(baris.harga_per_kg),
    stokMinimum: Number(baris.stok_minimum),
    aktif: baris.aktif as boolean,
  };
}

// [AI] prompt: Fungsi pembantu untuk memetakan baris basis data ke objek BuahAktif untuk modul kasir dan transaksi
function petakanKeBuahAktif(baris: Record<string, unknown>): BuahAktif {
  return {
    idBuah: baris.id_buah as number,
    namaBuah: baris.nama_buah as string,
    namaKategori: baris.nama_kategori as string,
    hargaPerKg: Number(baris.harga_per_kg),
    simbolSatuan: baris.simbol as string,
  };
}

// ============================================================================
// REPOSITORY KATEGORI
// ============================================================================

// [AI] prompt: Ambil seluruh daftar kategori diurutkan berdasarkan nama kategori
export async function daftarKategori(): Promise<Kategori[]> {
  const sql = `
    SELECT id_kategori, nama_kategori, deskripsi
    FROM kategori
    ORDER BY nama_kategori ASC;
  `;
  const hasil = await query(sql);
  return hasil.rows.map(petakanKeKategori);
}

// [AI] prompt: Tambah kategori baru dengan penanganan error 23505 nama kategori duplikat
export async function buatKategori(data: KategoriInput): Promise<Kategori> {
  const sql = `
    INSERT INTO kategori (nama_kategori, deskripsi)
    VALUES ($1, $2)
    RETURNING id_kategori, nama_kategori, deskripsi;
  `;
  try {
    const hasil = await query(sql, [data.namaKategori, data.deskripsi ?? null]);
    return petakanKeKategori(hasil.rows[0]);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new ErrorBentrok('Nama kategori sudah ada');
    }
    throw error;
  }
}

// [AI] prompt: Ubah data kategori berdasarkan ID dengan penanganan duplikat
export async function ubahKategori(
  id: number,
  data: { namaKategori?: string; deskripsi?: string | null }
): Promise<Kategori> {
  const klausaSet: string[] = [];
  const params: unknown[] = [id];

  if (data.namaKategori !== undefined) {
    params.push(data.namaKategori);
    klausaSet.push(`nama_kategori = $${params.length}`);
  }

  if (data.deskripsi !== undefined) {
    params.push(data.deskripsi);
    klausaSet.push(`deskripsi = $${params.length}`);
  }

  if (klausaSet.length === 0) {
    const hasil = await query('SELECT id_kategori, nama_kategori, deskripsi FROM kategori WHERE id_kategori = $1', [id]);
    if (hasil.rows.length === 0) throw new ErrorTidakDitemukan('Kategori tidak ditemukan');
    return petakanKeKategori(hasil.rows[0]);
  }

  const sql = `
    UPDATE kategori
    SET ${klausaSet.join(', ')}
    WHERE id_kategori = $1
    RETURNING id_kategori, nama_kategori, deskripsi;
  `;

  try {
    const hasil = await query(sql, params);
    if (hasil.rows.length === 0) {
      throw new ErrorTidakDitemukan('Kategori tidak ditemukan');
    }
    return petakanKeKategori(hasil.rows[0]);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new ErrorBentrok('Nama kategori sudah ada');
    }
    throw error;
  }
}

// [AI] prompt: Hapus kategori dengan penanganan error FK 23503 jika masih dipakai oleh buah
export async function hapusKategori(id: number): Promise<void> {
  const sql = 'DELETE FROM kategori WHERE id_kategori = $1;';
  try {
    const hasil = await query(sql, [id]);
    if (hasil.rowCount === 0) {
      throw new ErrorTidakDitemukan('Kategori tidak ditemukan');
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23503') {
      throw new ErrorBentrok('Kategori masih dipakai oleh buah, tidak bisa dihapus');
    }
    throw error;
  }
}

// ============================================================================
// REPOSITORY SATUAN
// ============================================================================

// [AI] prompt: Ambil seluruh daftar satuan diurutkan berdasarkan nama satuan
export async function daftarSatuan(): Promise<Satuan[]> {
  const sql = `
    SELECT id_satuan, nama_satuan, simbol
    FROM satuan
    ORDER BY nama_satuan ASC;
  `;
  const hasil = await query(sql);
  return hasil.rows.map(petakanKeSatuan);
}

// [AI] prompt: Tambah satuan baru dengan penanganan error 23505 duplikasi nama atau simbol
export async function buatSatuan(data: SatuanInput): Promise<Satuan> {
  const sql = `
    INSERT INTO satuan (nama_satuan, simbol)
    VALUES ($1, $2)
    RETURNING id_satuan, nama_satuan, simbol;
  `;
  try {
    const hasil = await query(sql, [data.namaSatuan, data.simbol]);
    return petakanKeSatuan(hasil.rows[0]);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new ErrorBentrok('Nama satuan atau simbol sudah ada');
    }
    throw error;
  }
}

// [AI] prompt: Ubah data satuan berdasarkan ID
export async function ubahSatuan(
  id: number,
  data: { namaSatuan?: string; simbol?: string }
): Promise<Satuan> {
  const klausaSet: string[] = [];
  const params: unknown[] = [id];

  if (data.namaSatuan !== undefined) {
    params.push(data.namaSatuan);
    klausaSet.push(`nama_satuan = $${params.length}`);
  }

  if (data.simbol !== undefined) {
    params.push(data.simbol);
    klausaSet.push(`simbol = $${params.length}`);
  }

  if (klausaSet.length === 0) {
    const hasil = await query('SELECT id_satuan, nama_satuan, simbol FROM satuan WHERE id_satuan = $1', [id]);
    if (hasil.rows.length === 0) throw new ErrorTidakDitemukan('Satuan tidak ditemukan');
    return petakanKeSatuan(hasil.rows[0]);
  }

  const sql = `
    UPDATE satuan
    SET ${klausaSet.join(', ')}
    WHERE id_satuan = $1
    RETURNING id_satuan, nama_satuan, simbol;
  `;

  try {
    const hasil = await query(sql, params);
    if (hasil.rows.length === 0) {
      throw new ErrorTidakDitemukan('Satuan tidak ditemukan');
    }
    return petakanKeSatuan(hasil.rows[0]);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new ErrorBentrok('Nama satuan atau simbol sudah ada');
    }
    throw error;
  }
}

// [AI] prompt: Hapus satuan dengan penanganan error FK 23503 jika masih dipakai oleh buah
export async function hapusSatuan(id: number): Promise<void> {
  const sql = 'DELETE FROM satuan WHERE id_satuan = $1;';
  try {
    const hasil = await query(sql, [id]);
    if (hasil.rowCount === 0) {
      throw new ErrorTidakDitemukan('Satuan tidak ditemukan');
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23503') {
      throw new ErrorBentrok('Satuan masih dipakai oleh buah, tidak bisa dihapus');
    }
    throw error;
  }
}

// ============================================================================
// REPOSITORY BUAH
// ============================================================================

// [AI] prompt: Ambil seluruh daftar buah dengan JOIN kategori dan satuan, diurutkan berdasarkan nama buah
export async function daftarBuah(): Promise<Buah[]> {
  const sql = `
    SELECT 
      b.id_buah,
      b.nama_buah,
      b.id_kategori,
      k.nama_kategori,
      b.id_satuan,
      s.simbol,
      b.harga_per_kg,
      b.stok_minimum,
      b.aktif
    FROM buah b
    INNER JOIN kategori k ON b.id_kategori = k.id_kategori
    INNER JOIN satuan s ON b.id_satuan = s.id_satuan
    ORDER BY b.nama_buah ASC;
  `;
  const hasil = await query(sql);
  return hasil.rows.map(petakanKeBuah);
}

// [AI] prompt: Ambil daftar buah aktif (aktif = true) untuk digunakan oleh modul kasir dan transaksi
export async function daftarBuahAktif(): Promise<BuahAktif[]> {
  const sql = `
    SELECT 
      b.id_buah,
      b.nama_buah,
      k.nama_kategori,
      b.harga_per_kg,
      s.simbol
    FROM buah b
    INNER JOIN kategori k ON b.id_kategori = k.id_kategori
    INNER JOIN satuan s ON b.id_satuan = s.id_satuan
    WHERE b.aktif = TRUE
    ORDER BY b.nama_buah ASC;
  `;
  const hasil = await query(sql);
  return hasil.rows.map(petakanKeBuahAktif);
}

// [AI] prompt: Cari data lengkap satu buah berdasarkan ID dengan JOIN kategori dan satuan
export async function cariBuahById(id: number): Promise<Buah | null> {
  const sql = `
    SELECT 
      b.id_buah,
      b.nama_buah,
      b.id_kategori,
      k.nama_kategori,
      b.id_satuan,
      s.simbol,
      b.harga_per_kg,
      b.stok_minimum,
      b.aktif
    FROM buah b
    INNER JOIN kategori k ON b.id_kategori = k.id_kategori
    INNER JOIN satuan s ON b.id_satuan = s.id_satuan
    WHERE b.id_buah = $1
    LIMIT 1;
  `;
  const hasil = await query(sql, [id]);
  if (hasil.rows.length === 0) {
    return null;
  }
  return petakanKeBuah(hasil.rows[0]);
}

// [AI] prompt: Tambah data buah baru dengan validasi bentrok nama (23505) dan ketiadaan FK kategori/satuan (23503)
export async function buatBuah(data: BuahInput): Promise<Buah> {
  const sql = `
    INSERT INTO buah (nama_buah, id_kategori, id_satuan, harga_per_kg, stok_minimum, aktif)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id_buah;
  `;
  try {
    const hasil = await query(sql, [
      data.namaBuah,
      data.idKategori,
      data.idSatuan,
      data.hargaPerKg,
      data.stokMinimum,
      data.aktif,
    ]);

    const buahBaru = await cariBuahById(hasil.rows[0].id_buah);
    if (!buahBaru) throw new ErrorTidakDitemukan('Buah yang baru dibuat tidak ditemukan');
    return buahBaru;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === '23505') {
        throw new ErrorBentrok('Nama buah sudah ada');
      }
      if (error.code === '23503') {
        throw new ErrorBentrok('Kategori atau satuan yang dipilih tidak valid');
      }
    }
    throw error;
  }
}

// [AI] prompt: Ubah data buah hanya pada kolom yang dikirimkan dan kembalikan objek Buah lengkap terbaru
export async function ubahBuah(id: number, data: UbahBuahInput): Promise<Buah> {
  const klausaSet: string[] = [];
  const params: unknown[] = [id];

  if (data.namaBuah !== undefined) {
    params.push(data.namaBuah);
    klausaSet.push(`nama_buah = $${params.length}`);
  }

  if (data.idKategori !== undefined) {
    params.push(data.idKategori);
    klausaSet.push(`id_kategori = $${params.length}`);
  }

  if (data.idSatuan !== undefined) {
    params.push(data.idSatuan);
    klausaSet.push(`id_satuan = $${params.length}`);
  }

  if (data.hargaPerKg !== undefined) {
    params.push(data.hargaPerKg);
    klausaSet.push(`harga_per_kg = $${params.length}`);
  }

  if (data.stokMinimum !== undefined) {
    params.push(data.stokMinimum);
    klausaSet.push(`stok_minimum = $${params.length}`);
  }

  if (data.aktif !== undefined) {
    params.push(data.aktif);
    klausaSet.push(`aktif = $${params.length}`);
  }

  if (klausaSet.length === 0) {
    const buah = await cariBuahById(id);
    if (!buah) throw new ErrorTidakDitemukan('Buah tidak ditemukan');
    return buah;
  }

  const sql = `
    UPDATE buah
    SET ${klausaSet.join(', ')}
    WHERE id_buah = $1
    RETURNING id_buah;
  `;

  try {
    const hasil = await query(sql, params);
    if (hasil.rows.length === 0) {
      throw new ErrorTidakDitemukan('Buah tidak ditemukan');
    }
    const buahDiperbarui = await cariBuahById(id);
    if (!buahDiperbarui) throw new ErrorTidakDitemukan('Buah tidak ditemukan');
    return buahDiperbarui;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === '23505') {
        throw new ErrorBentrok('Nama buah sudah ada');
      }
      if (error.code === '23503') {
        throw new ErrorBentrok('Kategori atau satuan yang dipilih tidak valid');
      }
    }
    throw error;
  }
}
