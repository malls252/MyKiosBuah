// [AI] prompt: "Buat src/modules/transaksi/schema.ts berisi skema validasi Zod untuk body POST /api/transaksi dengan aturan item, beratKg, diskon, buah unik, metodeBayar, dan uangDiterima."
import { z } from "zod";

// [AI] prompt: "Skema validasi untuk setiap item buah dalam transaksi: idBuah bulat positif, beratKg > 0 maks 999 maks 3 desimal, diskon >= 0 default 0 maks 2 desimal."
export const skemaItemTransaksi = z.object({
  idBuah: z
    .number({ message: "ID buah harus berupa angka" })
    .int({ message: "ID buah harus berupa bilangan bulat" })
    .positive({ message: "ID buah harus bernilai positif" }),

  beratKg: z
    .number({ message: "Berat harus berupa angka" })
    .gt(0, { message: "Berat harus lebih dari 0 kg" })
    .lte(999, { message: "Berat maksimal 999 kg per item" })
    .refine((val) => {
      const parts = val.toString().split(".");
      return !parts[1] || parts[1].length <= 3;
    }, { message: "Berat maksimal memiliki 3 angka di belakang koma" }),

  diskon: z
    .number({ message: "Diskon harus berupa angka" })
    .min(0, { message: "Diskon tidak boleh bernilai negatif" })
    .default(0)
    .refine((val) => {
      const parts = val.toString().split(".");
      return !parts[1] || parts[1].length <= 2;
    }, { message: "Diskon maksimal memiliki 2 angka di belakang koma" }),
});

// [AI] prompt: "Skema validasi utama transaksi kasir: 1-50 item, tidak boleh ada buah duplikat, metodeBayar Tunai/QRIS, uangDiterima wajib untuk Tunai dan ditolak untuk QRIS."
export const skemaBuatTransaksi = z
  .object({
    item: z
      .array(skemaItemTransaksi, {
        message: "Format item transaksi tidak valid",
      })
      .min(1, { message: "Minimal harus ada 1 item buah dalam transaksi" })
      .max(50, { message: "Maksimal 50 item buah dalam satu transaksi" })
      .refine(
        (items) => {
          const kumpulanId = new Set(items.map((i) => i.idBuah));
          return kumpulanId.size === items.length;
        },
        {
          message:
            "Buah yang sama tidak boleh muncul dua kali, gabungkan beratnya",
        }
      ),

    metodeBayar: z.enum(["Tunai", "QRIS"], {
      message: "Metode bayar hanya boleh Tunai atau QRIS",
    }),

    uangDiterima: z
      .number({ message: "Uang diterima harus berupa angka" })
      .min(0, { message: "Uang diterima tidak boleh bernilai negatif" })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.metodeBayar === "Tunai") {
      if (data.uangDiterima === undefined || data.uangDiterima === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Uang diterima wajib diisi untuk metode pembayaran Tunai",
          path: ["uangDiterima"],
        });
      }
    } else if (data.metodeBayar === "QRIS") {
      if (data.uangDiterima !== undefined && data.uangDiterima !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Uang diterima tidak perlu diisi untuk metode pembayaran QRIS",
          path: ["uangDiterima"],
        });
      }
    }
  });

// [AI] prompt: "Ekspor tipe TypeScript hasil inferensi skema Zod untuk digunakan di service dan route handler."
export type ItemTransaksiSchema = z.infer<typeof skemaItemTransaksi>;
export type BuatTransaksiSchema = z.infer<typeof skemaBuatTransaksi>;
