// [AI] prompt: "Buat tests/transaksi/hitung.test.ts untuk menguji hitungSubtotalItem, hitungTotal, dan hitungKembalian sesuai seluruh skenario wajib di Tugas 7 H3."
import { describe, it, expect } from "vitest";
import {
  hitungSubtotalItem,
  hitungTotal,
  hitungKembalian,
} from "../../src/modules/transaksi/hitung";

describe("Fungsi Perhitungan Transaksi Kasir (hitung.ts)", () => {
  // Skenario wajib 1: 2,5 kg x 28000 tanpa diskon = 70000
  it("harus menghitung 2,5 kg x 28000 tanpa diskon = 70000", () => {
    const hasil = hitungSubtotalItem(2.5, 28000, 0);
    expect(hasil).toBe(70000);
  });

  // Skenario wajib 2: 4,5 kg x 9000 diskon 1500 = 39000
  it("harus menghitung 4,5 kg x 9000 diskon 1500 = 39000", () => {
    const hasil = hitungSubtotalItem(4.5, 9000, 1500);
    expect(hasil).toBe(39000);
  });

  // Skenario wajib 3: total beberapa item
  it("harus menghitung total gabungan beberapa item dengan diskon", () => {
    const items = [
      { beratKg: 2.5, hargaSatuan: 28000, diskon: 0 }, // bruto 70000, subtotal 70000
      { beratKg: 1.0, hargaSatuan: 25000, diskon: 0 }, // bruto 25000, subtotal 25000
      { beratKg: 1.2, hargaSatuan: 85000, diskon: 2000 }, // bruto 102000, subtotal 100000
    ];

    const hasil = hitungTotal(items);

    expect(hasil.totalBruto).toBe(197000);
    expect(hasil.totalDiskon).toBe(2000);
    expect(hasil.totalBayar).toBe(195000);
    expect(hasil.subtotalPerItem).toEqual([70000, 25000, 100000]);
  });

  // Skenario wajib 4: uang pas
  it("harus mengembalikan kembalian 0 saat uang pas", () => {
    const kembalian = hitungKembalian(70000, 70000);
    expect(kembalian).toBe(0);
  });

  // Skenario wajib 5: uang lebih
  it("harus menghitung kembalian dengan benar saat uang lebih", () => {
    const kembalian = hitungKembalian(100000, 70000);
    expect(kembalian).toBe(30000);
  });

  // Skenario wajib 6: uang kurang
  it("harus melempar error 'Uang yang diterima kurang' saat uang kurang", () => {
    expect(() => hitungKembalian(50000, 70000)).toThrow(
      "Uang yang diterima kurang"
    );
  });

  // Skenario wajib 7: diskon lebih besar dari harga
  it("harus melempar error saat diskon melebihi harga bruto item", () => {
    expect(() => hitungSubtotalItem(1.0, 20000, 25000)).toThrow();
  });

  // Skenario wajib 8: berat 0,001 kg
  it("harus menghitung berat minimum 0,001 kg dengan benar", () => {
    const hasil = hitungSubtotalItem(0.001, 28000, 0);
    expect(hasil).toBe(28);
  });

  // Skenario wajib 9: sengaja rawan floating point
  it("harus menangani kasus rawan floating point tanpa selisih koma aneh", () => {
    // 0.1 * 14000 = 1400, diskon 0.2 (20 sen) -> 1399.8
    const subtotal = hitungSubtotalItem(0.1, 14000, 0.2);
    expect(subtotal).toBe(1399.8);

    const items = [
      { beratKg: 0.1, hargaSatuan: 14000, diskon: 0.1 },
      { beratKg: 0.2, hargaSatuan: 14000, diskon: 0.2 },
    ];
    const total = hitungTotal(items);
    expect(total.totalBruto).toBe(4200); // (0.1*14000) + (0.2*14000) = 1400 + 2800 = 4200
    expect(total.totalDiskon).toBe(0.3); // 0.1 + 0.2 = 0.3 (bukan 0.30000000000000004)
    expect(total.totalBayar).toBe(4199.7);
  });
});
