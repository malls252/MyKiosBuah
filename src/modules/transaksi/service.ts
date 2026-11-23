// [AI] prompt: "Perbarui src/modules/transaksi/service.ts agar memakai repository.ts (tanpa SQL langsung di service) serta menyediakan buatTransaksi, ambilRiwayatTransaksi, dan ambilStruk."

import { pool } from "@/lib/db";
import {
  getSesi,
  getDaftarBuahAktif,
  alokasiStokFifo,
  jalankanTransaksiDb,
  StokTidakCukupError,
} from "./stub-sementara";
import { hitungTotal, hitungKembalian } from "./hitung";
import {
  simpanTransaksi,
  simpanDetailTransaksi,
  ambilRiwayat,
  ambilStrukById,
  FilterRiwayatParams,
  RingkasanRiwayat,
} from "./repository";
import { BuatTransaksiInput, BuahAktif, Struk } from "./types";

export { StokTidakCukupError };
export type { RingkasanRiwayat };

// [AI] prompt: "Fungsi buatTransaksi memvalidasi buah aktif, menghitung total, memvalidasi uang diterima, lalu menjalankan persistensi atomik lewat repository dan alokasiStokFifo."
export async function buatTransaksi(input: BuatTransaksiInput): Promise<Struk> {
  const sesi = await getSesi();
  const daftarBuahAktif = await getDaftarBuahAktif();
  const mapBuah = new Map<number, BuahAktif>(
    daftarBuahAktif.map((b) => [b.idBuah, b])
  );

  for (const item of input.item) {
    if (!mapBuah.has(item.idBuah)) {
      throw new Error("Buah tidak tersedia");
    }
  }

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

  let uangDiterima: number | null = null;
  let kembalian: number | null = null;

  if (input.metodeBayar === "Tunai") {
    if (input.uangDiterima === undefined || input.uangDiterima === null) {
      throw new Error("Uang yang diterima kurang");
    }
    kembalian = hitungKembalian(input.uangDiterima, totalBayar);
    uangDiterima = input.uangDiterima;
  }

  const idTransaksi = await jalankanTransaksiDb(async (tx) => {
    const header = await simpanTransaksi(tx, {
      idPengguna: sesi.idPengguna,
      totalBruto,
      totalDiskon,
      totalBayar,
      metodeBayar: input.metodeBayar,
      uangDiterima,
      kembalian,
    });

    for (let i = 0; i < input.item.length; i++) {
      const itemInput = input.item[i];
      const buah = mapBuah.get(itemInput.idBuah)!;
      const subtotal = subtotalPerItem[i];

      const { idDetailTransaksi } = await simpanDetailTransaksi(tx, {
        idTransaksi: header.idTransaksi,
        idBuah: itemInput.idBuah,
        beratKg: itemInput.beratKg,
        hargaSatuan: buah.hargaPerKg,
        diskon: itemInput.diskon,
        subtotal,
      });

      await alokasiStokFifo(tx, {
        idBuah: itemInput.idBuah,
        beratKg: itemInput.beratKg,
        idDetailTransaksi,
      });
    }

    return header.idTransaksi;
  });

  const struk = await ambilStrukById(pool, idTransaksi);
  if (!struk) {
    throw new Error("Gagal mengambil data struk setelah transaksi disimpan.");
  }

  return struk;
}

// [AI] prompt: "Fungsi ambilRiwayatTransaksi meneruskan permintaan riwayat ke repository."
export async function ambilRiwayatTransaksi(
  filter: FilterRiwayatParams = {}
): Promise<RingkasanRiwayat[]> {
  return ambilRiwayat(pool, filter);
}

// [AI] prompt: "Fungsi ambilStruk meneruskan permintaan detail struk berdasarkan idTransaksi ke repository."
export async function ambilStruk(idTransaksi: number): Promise<Struk | null> {
  return ambilStrukById(pool, idTransaksi);
}
