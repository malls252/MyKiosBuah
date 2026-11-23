// [AI] prompt: Import pustaka validasi Zod untuk pendefinisian skema input data master buah, kategori, dan satuan
import { z } from 'zod';

// [AI] prompt: Fungsi pembantu untuk memvalidasi jumlah angka desimal di belakang koma secara presisi tanpa error floating-point
function cekMaksDesimal(angka: number, maks: number): boolean {
  const str = angka.toString();
  if (!str.includes('.')) return true;
  const pecahan = str.split('.')[1];
  return (pecahan ? pecahan.length : 0) <= maks;
}

// [AI] prompt: Skema validasi kategori buah (nama 2-50 karakter tanpa spasi kosong, deskripsi opsional maks 255)
export const skemaKategori = z.object({
  namaKategori: z
    .string({ required_error: 'Nama kategori wajib diisi' })
    .max(50, 'Nama kategori maksimal 50 karakter')
    .refine((val) => val.trim().length > 0, 'Nama kategori tidak boleh kosong atau hanya berisi spasi')
    .refine((val) => val.trim().length >= 2, 'Nama kategori minimal 2 karakter')
    .transform((val) => val.trim()),
  deskripsi: z
    .string()
    .trim()
    .max(255, 'Deskripsi maksimal 255 karakter')
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val ?? null)),
});

// [AI] prompt: Skema validasi satuan buah (nama 1-30 karakter, simbol 1-10 karakter)
export const skemaSatuan = z.object({
  namaSatuan: z
    .string({ required_error: 'Nama satuan wajib diisi' })
    .max(30, 'Nama satuan maksimal 30 karakter')
    .refine((val) => val.trim().length > 0, 'Nama satuan tidak boleh kosong atau hanya berisi spasi')
    .refine((val) => val.trim().length >= 1, 'Nama satuan minimal 1 karakter')
    .transform((val) => val.trim()),
  simbol: z
    .string({ required_error: 'Simbol satuan wajib diisi' })
    .max(10, 'Simbol satuan maksimal 10 karakter')
    .refine((val) => val.trim().length > 0, 'Simbol satuan tidak boleh kosong atau hanya berisi spasi')
    .refine((val) => val.trim().length >= 1, 'Simbol satuan minimal 1 karakter')
    .transform((val) => val.trim()),
});

// [AI] prompt: Skema validasi penambahan buah baru (nama, idKategori/idSatuan bulat positif, harga maks 2 desimal, stokMin maks 3 desimal, aktif default true)
export const skemaBuah = z.object({
  namaBuah: z
    .string({ required_error: 'Nama buah wajib diisi' })
    .max(100, 'Nama buah maksimal 100 karakter')
    .refine((val) => val.trim().length > 0, 'Nama buah tidak boleh kosong atau hanya berisi spasi')
    .refine((val) => val.trim().length >= 2, 'Nama buah minimal 2 karakter')
    .transform((val) => val.trim()),
  idKategori: z
    .number({ required_error: 'Kategori wajib dipilih', invalid_type_error: 'ID kategori harus berupa angka' })
    .int('ID kategori harus berupa bilangan bulat')
    .positive('ID kategori harus berupa bilangan bulat positif'),
  idSatuan: z
    .number({ required_error: 'Satuan wajib dipilih', invalid_type_error: 'ID satuan harus berupa angka' })
    .int('ID satuan harus berupa bilangan bulat')
    .positive('ID satuan harus berupa bilangan bulat positif'),
  hargaPerKg: z
    .number({ required_error: 'Harga per kg wajib diisi', invalid_type_error: 'Harga harus berupa angka' })
    .min(0, 'Harga tidak boleh negatif')
    .max(10000000, 'Harga maksimal Rp10.000.000')
    .refine((val) => cekMaksDesimal(val, 2), 'Harga maksimal memiliki 2 angka di belakang koma'),
  stokMinimum: z
    .number({ required_error: 'Stok minimum wajib diisi', invalid_type_error: 'Stok minimum harus berupa angka' })
    .min(0, 'Stok minimum tidak boleh negatif')
    .refine((val) => cekMaksDesimal(val, 3), 'Stok minimum maksimal memiliki 3 angka di belakang koma')
    .default(0),
  aktif: z.boolean().default(true),
});

// [AI] prompt: Skema validasi pengubahan data buah (semua field opsional, menolak objek kosong)
export const skemaUbahBuah = z
  .object({
    namaBuah: z
      .string()
      .max(100, 'Nama buah maksimal 100 karakter')
      .refine((val) => val.trim().length > 0, 'Nama buah tidak boleh kosong atau hanya berisi spasi')
      .refine((val) => val.trim().length >= 2, 'Nama buah minimal 2 karakter')
      .transform((val) => val.trim())
      .optional(),
    idKategori: z
      .number({ invalid_type_error: 'ID kategori harus berupa angka' })
      .int('ID kategori harus berupa bilangan bulat')
      .positive('ID kategori harus berupa bilangan bulat positif')
      .optional(),
    idSatuan: z
      .number({ invalid_type_error: 'ID satuan harus berupa angka' })
      .int('ID satuan harus berupa bilangan bulat')
      .positive('ID satuan harus berupa bilangan bulat positif')
      .optional(),
    hargaPerKg: z
      .number({ invalid_type_error: 'Harga harus berupa angka' })
      .min(0, 'Harga tidak boleh negatif')
      .max(10000000, 'Harga maksimal Rp10.000.000')
      .refine((val) => cekMaksDesimal(val, 2), 'Harga maksimal memiliki 2 angka di belakang koma')
      .optional(),
    stokMinimum: z
      .number({ invalid_type_error: 'Stok minimum harus berupa angka' })
      .min(0, 'Stok minimum tidak boleh negatif')
      .refine((val) => cekMaksDesimal(val, 3), 'Stok minimum maksimal memiliki 3 angka di belakang koma')
      .optional(),
    aktif: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    'Minimal satu kolom harus diisi untuk melakukan perubahan data buah'
  );

// [AI] prompt: Tipe TypeScript hasil inferensi skema Zod untuk modul master buah
export type KategoriInput = z.infer<typeof skemaKategori>;
export type SatuanInput = z.infer<typeof skemaSatuan>;
export type BuahInput = z.infer<typeof skemaBuah>;
export type UbahBuahInput = z.infer<typeof skemaUbahBuah>;
