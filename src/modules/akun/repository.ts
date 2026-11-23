// [AI] prompt: Import dependensi pool database, error khusus aplikasi, dan tipe data pengguna
import type { PoolClient } from 'pg';
import { query } from '../../lib/db';
import { ErrorBentrok, ErrorTidakDitemukan } from '../../lib/errors';
import type { Pengguna, PenggunaDenganHash, PeranPengguna } from './types';

// [AI] prompt: Fungsi pembantu untuk memetakan baris database snake_case menjadi objek Pengguna (camelCase tanpa passwordHash)
function petakanKePengguna(baris: Record<string, unknown>): Pengguna {
  return {
    idPengguna: baris.id_pengguna as number,
    nama: baris.nama as string,
    email: baris.email as string,
    peran: baris.peran as PeranPengguna,
    noTelepon: (baris.no_telepon as string | null) ?? null,
    alamat: (baris.alamat as string | null) ?? null,
    aktif: baris.aktif as boolean,
  };
}

// [AI] prompt: Fungsi pembantu untuk memetakan baris database menjadi objek PenggunaDenganHash untuk keperluan autentikasi internal
function petakanKePenggunaDenganHash(baris: Record<string, unknown>): PenggunaDenganHash {
  return {
    ...petakanKePengguna(baris),
    passwordHash: baris.password_hash as string,
  };
}

// [AI] prompt: Fungsi cariPenggunaByEmail(email) mencari pengguna berdasarkan email untuk login, mengembalikan PenggunaDenganHash atau null
export async function cariPenggunaByEmail(email: string): Promise<PenggunaDenganHash | null> {
  const sql = `
    SELECT id_pengguna, nama, email, password_hash, peran, no_telepon, alamat, aktif
    FROM pengguna
    WHERE email = $1
    LIMIT 1;
  `;
  const hasil = await query(sql, [email]);

  if (hasil.rows.length === 0) {
    return null;
  }

  return petakanKePenggunaDenganHash(hasil.rows[0]);
}

// [AI] prompt: Fungsi cariPenggunaById(id) mencari data publik pengguna berdasarkan id, mengembalikan Pengguna (tanpa hash) atau null
export async function cariPenggunaById(id: number): Promise<Pengguna | null> {
  const sql = `
    SELECT id_pengguna, nama, email, peran, no_telepon, alamat, aktif
    FROM pengguna
    WHERE id_pengguna = $1
    LIMIT 1;
  `;
  const hasil = await query(sql, [id]);

  if (hasil.rows.length === 0) {
    return null;
  }

  return petakanKePengguna(hasil.rows[0]);
}

// [AI] prompt: Fungsi buatPengguna(klienOpsional, data) menambahkan pengguna baru dengan parameterized query dan menangani error duplikat email 23505
export async function buatPengguna(
  klienOpsional: PoolClient | undefined,
  data: {
    nama: string;
    email: string;
    passwordHash: string;
    peran: PeranPengguna;
    noTelepon?: string | null;
    alamat?: string | null;
  }
): Promise<Pengguna> {
  const sql = `
    INSERT INTO pengguna (nama, email, password_hash, peran, no_telepon, alamat, aktif)
    VALUES ($1, $2, $3, $4, $5, $6, TRUE)
    RETURNING id_pengguna, nama, email, peran, no_telepon, alamat, aktif;
  `;
  const params = [
    data.nama,
    data.email,
    data.passwordHash,
    data.peran,
    data.noTelepon ?? null,
    data.alamat ?? null,
  ];

  try {
    const hasil = klienOpsional
      ? await klienOpsional.query(sql, params)
      : await query(sql, params);

    return petakanKePengguna(hasil.rows[0]);
  } catch (error: unknown) {
    // Tangkap pelanggaran unique constraint pada email (kode PostgreSQL 23505)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new ErrorBentrok('Email sudah terdaftar');
    }
    throw error;
  }
}

// [AI] prompt: Fungsi daftarAkunKasir() mengambil semua pengguna dengan peran Kasir yang diurutkan berdasarkan nama (tanpa hash)
export async function daftarAkunKasir(): Promise<Pengguna[]> {
  const sql = `
    SELECT id_pengguna, nama, email, peran, no_telepon, alamat, aktif
    FROM pengguna
    WHERE peran = 'Kasir'
    ORDER BY nama ASC;
  `;
  const hasil = await query(sql);

  return hasil.rows.map(petakanKePengguna);
}

// [AI] prompt: Fungsi ubahPenggunaKasir(id, data) mengubah nama, noTelepon, atau passwordHash hanya jika pengguna memiliki peran Kasir
export async function ubahPenggunaKasir(
  id: number,
  data: {
    nama?: string;
    noTelepon?: string | null;
    passwordHash?: string;
  }
): Promise<Pengguna> {
  const klausaSet: string[] = [];
  const params: unknown[] = [id];

  if (data.nama !== undefined) {
    params.push(data.nama);
    klausaSet.push(`nama = $${params.length}`);
  }

  if (data.noTelepon !== undefined) {
    params.push(data.noTelepon);
    klausaSet.push(`no_telepon = $${params.length}`);
  }

  if (data.passwordHash !== undefined) {
    params.push(data.passwordHash);
    klausaSet.push(`password_hash = $${params.length}`);
  }

  // Jika tidak ada kolom yang perlu diubah, ambil data pengguna saat ini
  if (klausaSet.length === 0) {
    const kasir = await cariPenggunaById(id);
    if (!kasir || kasir.peran !== 'Kasir') {
      throw new ErrorTidakDitemukan('Akun kasir tidak ditemukan');
    }
    return kasir;
  }

  const sql = `
    UPDATE pengguna
    SET ${klausaSet.join(', ')}
    WHERE id_pengguna = $1 AND peran = 'Kasir'
    RETURNING id_pengguna, nama, email, peran, no_telepon, alamat, aktif;
  `;

  const hasil = await query(sql, params);

  if (hasil.rows.length === 0) {
    throw new ErrorTidakDitemukan('Akun kasir tidak ditemukan');
  }

  return petakanKePengguna(hasil.rows[0]);
}

// [AI] prompt: Fungsi setAktifPengguna(id, aktif) mengubah status aktif akun pengguna dan mengembalikan data yang diperbarui
export async function setAktifPengguna(id: number, aktif: boolean): Promise<Pengguna> {
  const sql = `
    UPDATE pengguna
    SET aktif = $2
    WHERE id_pengguna = $1
    RETURNING id_pengguna, nama, email, peran, no_telepon, alamat, aktif;
  `;
  const hasil = await query(sql, [id, aktif]);

  if (hasil.rows.length === 0) {
    throw new ErrorTidakDitemukan('Pengguna tidak ditemukan');
  }

  return petakanKePengguna(hasil.rows[0]);
}
