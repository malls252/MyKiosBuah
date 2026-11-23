// [AI] prompt: Pengujian unit Vitest untuk schema.ts modul akun: validasi skemaRegistrasi batas panjang nama, spasi, format email, kompleksitas password, nomor telepon, dan karakter tanda kutip
import { describe, it, expect } from 'vitest';
import { skemaRegistrasi } from '@/modules/akun/schema';

describe('Skema Validasi Registrasi (schema.ts)', () => {
  const dataValid = {
    nama: 'Ahmad Dahlan',
    email: 'ahmad@example.com',
    password: 'PasswordRahasia123',
    noTelepon: '08123456789',
    alamat: 'Jl. Merdeka No. 45, Pasuruan',
  };

  // [AI] prompt: Tes menerima data registrasi yang valid
  it('harus menerima input data registrasi yang valid', () => {
    const hasil = skemaRegistrasi.safeParse(dataValid);
    expect(hasil.success).toBe(true);
  });

  // [AI] prompt: Tes menolak nama kosong
  it('harus menolak nama yang kosong', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      nama: '',
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak nama yang hanya berisi karakter spasi
  it('harus menolak nama yang hanya berisi spasi', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      nama: '     ',
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak format email tanpa simbol @
  it('harus menolak email tanpa simbol @', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      email: 'emailtanpaat.com',
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak password yang kurang dari 8 karakter (contoh: 7 karakter)
  it('harus menolak password dengan panjang 7 karakter', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      password: 'Pass123', // 7 karakter
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak password tanpa angka
  it('harus menolak password yang tidak mengandung karakter angka', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      password: 'HanyaHurufSaja',
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak nomor telepon yang mengandung karakter huruf
  it('harus menolak nomor telepon yang memuat karakter huruf', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      noTelepon: '0812abc3456',
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes nama berisi tanda kutip tunggal (O'Neil) harus lolos validasi
  it('harus menerima nama yang mengandung tanda kutip tunggal seperti O\'Neil', () => {
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      nama: "O'Neil Kevin",
    });
    expect(hasil.success).toBe(true);
    if (hasil.success) {
      expect(hasil.data.nama).toBe("O'Neil Kevin");
    }
  });

  // [AI] prompt: Tes menolak nama dengan panjang 5000 karakter
  it('harus menolak nama dengan panjang 5000 karakter karena batas maksimal 100', () => {
    const namaEkstrem = 'A'.repeat(5000);
    const hasil = skemaRegistrasi.safeParse({
      ...dataValid,
      nama: namaEkstrem,
    });
    expect(hasil.success).toBe(false);
  });
});
