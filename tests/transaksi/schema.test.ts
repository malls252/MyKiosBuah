// [AI] prompt: "Perbarui tests/transaksi/schema.test.ts agar membaca hasil.error.issues sesuai Zod v4."
import { describe, it, expect } from "vitest";
import { skemaBuatTransaksi } from "../../src/modules/transaksi/schema";

describe("Validasi Skema Transaksi (schema.ts)", () => {
  it("harus meloloskan input transaksi Tunai yang valid", () => {
    const inputValid = {
      item: [
        { idBuah: 1, beratKg: 2.5, diskon: 0 },
        { idBuah: 2, beratKg: 1.255, diskon: 1000 },
      ],
      metodeBayar: "Tunai",
      uangDiterima: 100000,
    };

    const hasil = skemaBuatTransaksi.safeParse(inputValid);
    expect(hasil.success).toBe(true);
  });

  it("harus meloloskan input transaksi QRIS tanpa uangDiterima", () => {
    const inputValid = {
      item: [{ idBuah: 1, beratKg: 3.5 }],
      metodeBayar: "QRIS",
    };

    const hasil = skemaBuatTransaksi.safeParse(inputValid);
    expect(hasil.success).toBe(true);
    if (hasil.success) {
      expect(hasil.data.item[0].diskon).toBe(0); // Default 0
    }
  });

  it("harus menolak jika item kosong", () => {
    const hasil = skemaBuatTransaksi.safeParse({
      item: [],
      metodeBayar: "Tunai",
      uangDiterima: 50000,
    });

    expect(hasil.success).toBe(false);
  });

  it("harus menolak jika terdapat buah yang sama (duplikat idBuah)", () => {
    const hasil = skemaBuatTransaksi.safeParse({
      item: [
        { idBuah: 1, beratKg: 2 },
        { idBuah: 1, beratKg: 3 },
      ],
      metodeBayar: "Tunai",
      uangDiterima: 50000,
    });

    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      const pesan = hasil.error.issues.map((e) => e.message);
      expect(pesan).toContain(
        "Buah yang sama tidak boleh muncul dua kali, gabungkan beratnya"
      );
    }
  });

  it("harus menolak berat <= 0 atau memiliki lebih dari 3 desimal", () => {
    const hasilNol = skemaBuatTransaksi.safeParse({
      item: [{ idBuah: 1, beratKg: 0 }],
      metodeBayar: "QRIS",
    });
    expect(hasilNol.success).toBe(false);

    const hasilLebihDesimal = skemaBuatTransaksi.safeParse({
      item: [{ idBuah: 1, beratKg: 1.2345 }],
      metodeBayar: "QRIS",
    });
    expect(hasilLebihDesimal.success).toBe(false);
  });

  it("harus menolak diskon bernilai negatif atau lebih dari 2 desimal", () => {
    const hasilNegatif = skemaBuatTransaksi.safeParse({
      item: [{ idBuah: 1, beratKg: 1, diskon: -500 }],
      metodeBayar: "QRIS",
    });
    expect(hasilNegatif.success).toBe(false);

    const hasilDesimal = skemaBuatTransaksi.safeParse({
      item: [{ idBuah: 1, beratKg: 1, diskon: 500.123 }],
      metodeBayar: "QRIS",
    });
    expect(hasilDesimal.success).toBe(false);
  });

  it("harus menolak metode Tunai jika uangDiterima tidak diisi", () => {
    const hasil = skemaBuatTransaksi.safeParse({
      item: [{ idBuah: 1, beratKg: 1 }],
      metodeBayar: "Tunai",
    });

    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      const pesan = hasil.error.issues.map((e) => e.message);
      expect(pesan).toContain(
        "Uang diterima wajib diisi untuk metode pembayaran Tunai"
      );
    }
  });

  it("harus menolak metode QRIS jika uangDiterima diisi", () => {
    const hasil = skemaBuatTransaksi.safeParse({
      item: [{ idBuah: 1, beratKg: 1 }],
      metodeBayar: "QRIS",
      uangDiterima: 50000,
    });

    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      const pesan = hasil.error.issues.map((e) => e.message);
      expect(pesan).toContain(
        "Uang diterima tidak perlu diisi untuk metode pembayaran QRIS"
      );
    }
  });
});
