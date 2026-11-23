// [AI] prompt: "Buat src/modules/transaksi/service.ts berisi fungsi buatTransaksi(input: BuatTransaksiInput) yang mengorkestrasi validasi, perhitungan, dan persistensi transaksi kasir ke database dalam satu transaksi atomik."

import {
  getSesi,
  getDaftarBuahAktif,
  alokasiStokFifo,
  jalankanTransaksiDb,
  StokTidakCukupError,
} from "./stub-sementara";
import { hitungTotal, hitungSubtotalItem } from "./hitung";
import { BuatTransaksiInput, BuahAktif, Struk } from "./types";

// Re-export agar route handler bisa import dari satu tempat
export { StokTidakCukupError };

// [AI] prompt: "Fungsi buatTransaksi mengambil sesi kasir, memvalidasi daftar buah aktif, menghitung total, dan mengeksekusi seluruh persistensi DB dalam satu transaksi pg (BEGIN/COMMIT/ROLLBACK)."
export async function buatTransaksi(input: BuatTransaksiInput): Promise<Struk> {
  // 1. Ambil sesi kasir yang sedang login
  const sesi = await getSesi();

  // 2. Ambil master buah aktif dan buat lookup map idBuah → BuahAktif
  const daftarBuahAktif = await getDaftarBuahAktif();
  const mapBuah = new Map<number, BuahAktif>(
    daftarBuahAktif.map((b) => [b.idBuah, b])
  );

  // [AI] prompt: "Validasi bahwa setiap idBuah dalam input terdaftar dan aktif; lempar Error jika tidak ditemukan."
  for (const item of input.item) {
    if (!mapBuah.has(item.idBuah)) {
      throw new Error(
        `Buah dengan id ${item.idBuah} tidak ditemukan atau tidak aktif.`
      );
    }
  }

  // 3. Hitung total transaksi
  const itemHitung = input.item.map((item) => {
    const buah = mapBuah.get(item.idBuah)!;
    return {
      beratKg: item.beratKg,
      hargaSatuan: buah.hargaPerKg,
      diskon: item.diskon,
    };
  });

  const { totalBruto, totalDiskon, totalBayar, subtotalPerItem } =
    hitungTotal(itemHitung);

  // [AI] prompt: "Validasi uang diterima cukup untuk pembayaran Tunai; QRIS tidak memerlukan uang diterima."
  let uangDiterima: number | null = null;
  let kembalian: number | null = null;

  if (input.metodeBayar === "Tunai") {
    if (
      input.uangDiterima === undefined ||
      input.uangDiterima === null ||
      input.uangDiterima < totalBayar
    ) {
      throw new Error(
        `Uang yang diterima (Rp${input.uangDiterima ?? 0}) kurang dari total bayar (Rp${totalBayar}).`
      );
    }
    uangDiterima = input.uangDiterima;
    kembalian = Math.round((uangDiterima - totalBayar) * 100) / 100;
  }

  // 4. Eksekusi dalam satu transaksi DB atomik
  const struk = await jalankanTransaksiDb(async (tx) => {
    // [AI] prompt: "INSERT ke tabel transaksi dan ambil id_transaksi yang dihasilkan."
    const hasilTransaksi = await tx.query<{ id_transaksi: number }>(
      `INSERT INTO transaksi
         (id_pengguna, metode_bayar, total_bruto, total_diskon, total_bayar,
          uang_diterima, kembalian, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Selesai')
       RETURNING id_transaksi`,
      [
        sesi.idPengguna,
        input.metodeBayar,
        totalBruto,
        totalDiskon,
        totalBayar,
        uangDiterima,
        kembalian,
      ]
    );

    const idTransaksi = hasilTransaksi.rows[0].id_transaksi;

    // [AI] prompt: "INSERT setiap item ke detail_transaksi lalu panggil alokasiStokFifo per item."
    const itemStrukList = [];

    for (let i = 0; i < input.item.length; i++) {
      const itemInput = input.item[i];
      const buah = mapBuah.get(itemInput.idBuah)!;
      const subtotal = subtotalPerItem[i];
      const hargaSatuan = buah.hargaPerKg;

      // Hitung subtotal bruto item untuk field yang dibutuhkan DB
      const subtotalBrutoItem =
        Math.round(itemInput.beratKg * hargaSatuan * 100) / 100;
      const diskonItem = itemInput.diskon;

      // [AI] prompt: "INSERT ke detail_transaksi dan ambil id_detail_transaksi."
      const hasilDetail = await tx.query<{ id_detail_transaksi: number }>(
        `INSERT INTO detail_transaksi
           (id_transaksi, id_buah, berat_kg, harga_satuan,
            subtotal_bruto, diskon, subtotal_bayar)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id_detail_transaksi`,
        [
          idTransaksi,
          itemInput.idBuah,
          itemInput.beratKg,
          hargaSatuan,
          subtotalBrutoItem,
          diskonItem,
          subtotal,
        ]
      );

      const idDetailTransaksi = hasilDetail.rows[0].id_detail_transaksi;

      // [AI] prompt: "Panggil alokasiStokFifo untuk memotong stok batch secara FIFO; lempar StokTidakCukupError jika stok habis."
      await alokasiStokFifo(tx, {
        idBuah: itemInput.idBuah,
        beratKg: itemInput.beratKg,
        idDetailTransaksi,
      });

      itemStrukList.push({
        namaBuah: buah.namaBuah,
        beratKg: itemInput.beratKg,
        hargaSatuan,
        diskon: diskonItem,
        subtotal,
      });
    }

    // [AI] prompt: "Susun objek Struk dari data transaksi yang baru saja di-INSERT untuk dikirim sebagai respons."
    const strukHasil: Struk = {
      idTransaksi,
      tanggalWaktu: new Date(),
      namaKasir: sesi.nama,
      item: itemStrukList,
      totalBruto,
      totalDiskon,
      totalBayar,
      metodeBayar: input.metodeBayar,
      uangDiterima,
      kembalian,
    };

    return strukHasil;
  });

  return struk;
}
