// [AI] prompt: Pengujian unit Vitest untuk schema.ts modul data master: validasi batas skemaBuah (harga, desimal, stok, spasi, panjang nama, id relasi) dan skemaUbahBuah (menolak objek kosong)
import { describe, it, expect } from 'vitest';
import { skemaBuah, skemaUbahBuah } from '@/modules/master/schema';

describe('Skema Validasi Buah (schema.ts)', () => {
  const dataBuahValid = {
    namaBuah: 'Jeruk Medan Manis',
    idKategori: 1,
    idSatuan: 1,
    hargaPerKg: 25000,
    stokMinimum: 10,
    aktif: true,
  };

  // [AI] prompt: Tes menerima data buah yang valid
  it('harus menerima data buah yang valid', () => {
    const hasil = skemaBuah.safeParse(dataBuahValid);
    expect(hasil.success).toBe(true);
  });

  // [AI] prompt: Tes menerima nama buah dengan karakter apostrof dan tanda kutip ganda
  it('harus menerima nama buah yang mengandung apostrof dan tanda kutip', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      namaBuah: 'Melon "Super" O\'Neil',
    });
    expect(hasil.success).toBe(true);
    if (hasil.success) {
      expect(hasil.data.namaBuah).toBe('Melon "Super" O\'Neil');
    }
  });

  // [AI] prompt: Tes menolak harga negatif
  it('harus menolak harga per kg yang bernilai negatif', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      hargaPerKg: -1000,
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak harga dengan 3 angka di belakang koma (maksimal 2 desimal)
  it('harus menolak harga dengan 3 angka di belakang koma', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      hargaPerKg: 25000.125,
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak stokMinimum negatif
  it('harus menolak stok minimum yang bernilai negatif', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      stokMinimum: -2.5,
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak nama buah yang hanya berisi spasi
  it('harus menolak nama buah yang hanya berisi spasi', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      namaBuah: '     ',
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak nama buah yang melebihi batas 100 karakter (contoh 500 karakter)
  it('harus menolak nama buah dengan panjang 500 karakter', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      namaBuah: 'B'.repeat(500),
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak idKategori bernilai 0
  it('harus menolak idKategori bernilai 0', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      idKategori: 0,
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak idKategori bernilai pecahan/desimal
  it('harus menolak idKategori bernilai pecahan atau desimal', () => {
    const hasil = skemaBuah.safeParse({
      ...dataBuahValid,
      idKategori: 2.5,
    });
    expect(hasil.success).toBe(false);
  });

  // [AI] prompt: Tes menolak idSatuan bernilai 0 atau pecahan
  it('harus menolak idSatuan bernilai 0 atau pecahan', () => {
    const hasilNol = skemaBuah.safeParse({
      ...dataBuahValid,
      idSatuan: 0,
    });
    const hasilPecahan = skemaBuah.safeParse({
      ...dataBuahValid,
      idSatuan: 1.75,
    });
    expect(hasilNol.success).toBe(false);
    expect(hasilPecahan.success).toBe(false);
  });
});

describe('Skema Validasi Ubah Buah (skemaUbahBuah)', () => {
  // [AI] prompt: Tes menerima perubahan data buah parsial
  it('harus menerima pembaruan data buah parsial', () => {
    const hasil = skemaUbahBuah.safeParse({
      hargaPerKg: 30000,
    });
    expect(hasil.success).toBe(true);
  });

  // [AI] prompt: Tes menolak pengiriman objek kosong pada skemaUbahBuah
  it('harus menolak objek kosong karena minimal satu field harus diisi', () => {
    const hasil = skemaUbahBuah.safeParse({});
    expect(hasil.success).toBe(false);
  });
});
