// [AI] prompt: Import dependensi modul autentikasi, jwt, kelas error, repository pengguna, dan tipe data
import { hashPassword, cocokkanPassword } from '../../lib/auth';
import { buatToken, type PayloadSesi } from '../../lib/jwt';
import { ErrorTidakLogin, ErrorTidakDitemukan, ErrorDilarang } from '../../lib/errors';
import {
  cariPenggunaByEmail,
  cariPenggunaById,
  buatPengguna,
  daftarAkunKasir as repoDaftarAkunKasir,
  ubahPenggunaKasir as repoUbahPenggunaKasir,
  setAktifPengguna,
} from './repository';
import type { Pengguna } from './types';
import type {
  RegistrasiInput,
  BuatAkunKasirInput,
  UbahAkunKasirInput,
} from './schema';

// Hash bcrypt acak yang valid untuk mencegah timing attack saat email tidak ditemukan
const HASH_PALSU_TIMING = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// [AI] prompt: Fungsi registrasiPembeli(input) mendaftarkan akun pembeli baru (peran selalu 'Pembeli') dan mengembalikan Pengguna tanpa hash
export async function registrasiPembeli(input: RegistrasiInput): Promise<Pengguna> {
  const passwordHash = await hashPassword(input.password);

  return buatPengguna(undefined, {
    nama: input.nama,
    email: input.email,
    passwordHash,
    peran: 'Pembeli',
    noTelepon: input.noTelepon,
    alamat: input.alamat,
  });
}

// [AI] prompt: Fungsi login(email, password) memverifikasi kredensial, mencegah timing attack, mengecek status aktif, dan mengembalikan pengguna serta token JWT
export async function login(
  email: string,
  password: string
): Promise<{ pengguna: Pengguna; token: string }> {
  const penggunaDenganHash = await cariPenggunaByEmail(email);

  if (!penggunaDenganHash) {
    // Jalankan perbandingan dummy agar waktu respons konsisten dan tidak membocorkan keberadaan email
    await cocokkanPassword(password, HASH_PALSU_TIMING);
    throw new ErrorTidakLogin('Email atau password salah');
  }

  const passwordCocok = await cocokkanPassword(password, penggunaDenganHash.passwordHash);

  if (!passwordCocok) {
    throw new ErrorTidakLogin('Email atau password salah');
  }

  if (!penggunaDenganHash.aktif) {
    throw new ErrorTidakLogin('Akun dinonaktifkan, hubungi pemilik kios');
  }

  const payload: PayloadSesi = {
    idPengguna: penggunaDenganHash.idPengguna,
    nama: penggunaDenganHash.nama,
    peran: penggunaDenganHash.peran,
  };

  const token = await buatToken(payload);

  // Buang passwordHash agar tidak pernah bocor ke luar service
  const { passwordHash: _, ...penggunaTanpaHash } = penggunaDenganHash;

  return {
    pengguna: penggunaTanpaHash,
    token,
  };
}

// [AI] prompt: Fungsi buatAkunKasir(input) mendaftarkan kasir baru dengan peran 'Kasir' dan password yang di-hash
export async function buatAkunKasir(input: BuatAkunKasirInput): Promise<Pengguna> {
  const passwordHash = await hashPassword(input.password);

  return buatPengguna(undefined, {
    nama: input.nama,
    email: input.email,
    passwordHash,
    peran: 'Kasir',
    noTelepon: input.noTelepon,
    alamat: null,
  });
}

// [AI] prompt: Fungsi ubahAkunKasir(id, input) mengubah data kasir setelah memastikan bahwa akun bertarget memiliki peran 'Kasir'
export async function ubahAkunKasir(id: number, input: UbahAkunKasirInput): Promise<Pengguna> {
  const kasirLama = await cariPenggunaById(id);

  if (!kasirLama || kasirLama.peran !== 'Kasir') {
    throw new ErrorTidakDitemukan('Akun kasir tidak ditemukan');
  }

  let passwordHash: string | undefined;
  const passwordBaru = input.passwordBaru || input.password;
  if (passwordBaru) {
    passwordHash = await hashPassword(passwordBaru);
  }

  return repoUbahPenggunaKasir(id, {
    nama: input.nama,
    noTelepon: input.noTelepon,
    passwordHash,
  });
}

// [AI] prompt: Fungsi ubahStatusAkun(idYangDiubah, aktif, idPelaku) untuk mengubah status akun, membatasi hanya untuk kasir dan melarang menonaktifkan diri sendiri
export async function ubahStatusAkun(
  idYangDiubah: number,
  aktif: boolean,
  idPelaku: number
): Promise<Pengguna> {
  if (idYangDiubah === idPelaku) {
    throw new ErrorDilarang('Anda tidak dapat mengubah status akun Anda sendiri');
  }

  const target = await cariPenggunaById(idYangDiubah);

  if (!target) {
    throw new ErrorTidakDitemukan('Akun kasir tidak ditemukan');
  }

  if (target.peran !== 'Kasir') {
    throw new ErrorDilarang('Hanya akun dengan peran Kasir yang dapat diubah statusnya melalui fitur ini');
  }

  return setAktifPengguna(idYangDiubah, aktif);
}

// [AI] prompt: Fungsi daftarAkunKasir() mengambil daftar seluruh akun kasir untuk antarmuka admin
export async function daftarAkunKasir(): Promise<Pengguna[]> {
  return repoDaftarAkunKasir();
}
