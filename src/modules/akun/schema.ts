// [AI] prompt: Import pustaka validasi Zod untuk pembuatan skema input modul akun
import { z } from 'zod';

// [AI] prompt: Skema pembantu untuk validasi nama, email, password, nomor telepon, dan alamat dengan pesan bahasa Indonesia
const skemaNama = z
  .string({ message: 'Nama wajib diisi' })
  .max(100, 'Nama maksimal 100 karakter')
  .refine((val) => val.trim().length > 0, 'Nama tidak boleh kosong atau hanya berisi spasi')
  .refine((val) => val.trim().length >= 2, 'Nama minimal 2 karakter')
  .transform((val) => val.trim());

const skemaEmail = z
  .string({ message: 'Email wajib diisi' })
  .max(100, 'Email maksimal 100 karakter')
  .transform((val) => val.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid')
      .max(100, 'Email maksimal 100 karakter')
  );

const skemaPasswordRegistrasi = z
  .string({ message: 'Password wajib diisi' })
  .min(8, 'Password minimal 8 karakter')
  .max(72, 'Password maksimal 72 karakter')
  .regex(/[A-Za-z]/, 'Password harus mengandung huruf')
  .regex(/[0-9]/, 'Password harus mengandung angka');

const skemaNoTelepon = z
  .string()
  .trim()
  .refine(
    (val) => val === '' || /^\+?[0-9]{8,20}$/.test(val),
    'Nomor telepon harus berupa 8-20 digit angka (boleh diawali +)'
  )
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val ?? null));

const skemaAlamat = z
  .string()
  .trim()
  .max(255, 'Alamat maksimal 255 karakter')
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val ?? null));

// [AI] prompt: Skema validasi login (email format email/trim/huruf kecil/maks 100 dan password maks 72)
export const skemaLogin = z.object({
  email: skemaEmail,
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .max(72, 'Password maksimal 72 karakter'),
});

// [AI] prompt: Skema validasi registrasi pembeli (nama, email, password kuat, noTelepon opsional, alamat opsional)
export const skemaRegistrasi = z.object({
  nama: skemaNama,
  email: skemaEmail,
  password: skemaPasswordRegistrasi,
  noTelepon: skemaNoTelepon,
  alamat: skemaAlamat,
});

// [AI] prompt: Skema validasi pembuatan akun kasir oleh Super Admin (tanpa alamat)
export const skemaBuatAkunKasir = z.object({
  nama: skemaNama,
  email: skemaEmail,
  password: skemaPasswordRegistrasi,
  noTelepon: skemaNoTelepon,
});

// [AI] prompt: Skema validasi perubahan akun kasir (nama, noTelepon, dan password baru opsional)
export const skemaUbahAkunKasir = z.object({
  nama: skemaNama.optional(),
  noTelepon: skemaNoTelepon,
  passwordBaru: skemaPasswordRegistrasi.optional(),
  password: skemaPasswordRegistrasi.optional(),
});

// [AI] prompt: Skema validasi perubahan status aktif akun pengguna
export const skemaSetAktif = z.object({
  aktif: z.boolean({ message: 'Status aktif wajib diisi' }),
});

// [AI] prompt: Tipe TypeScript hasil inferensi skema Zod untuk digunakan di service dan handler
export type LoginInput = z.infer<typeof skemaLogin>;
export type RegistrasiInput = z.infer<typeof skemaRegistrasi>;
export type BuatAkunKasirInput = z.infer<typeof skemaBuatAkunKasir>;
export type UbahAkunKasirInput = z.infer<typeof skemaUbahAkunKasir>;
export type SetAktifInput = z.infer<typeof skemaSetAktif>;
