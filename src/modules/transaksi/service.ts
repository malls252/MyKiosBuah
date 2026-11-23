// [AI] prompt: "Ganti semua import stub-sementara di src/modules/transaksi/service.ts ke modul asli (@/lib/db, @/lib/errors, @/modules/master/service) dan simpan placeholder alokasiStokFifo sementara hingga modul FIFO Elvya selesai di Tugas 9."

import type { PoolClient } from "pg";
import { pool, jalankanTransaksiDb } from "@/lib/db";
import { StokTidakCukupError, ErrorValidasi } from "@/lib/errors";
import { getDaftarBuahAktif } from "@/modules/master/service";
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

// TODO(Tugas 9): Ganti dengan `import { alokasiStokFifo } from "@/modules/fifo/service"` setelah modul FIFO Elvya selesai.
async function alokasiStokFifoSementara(
  _tx: PoolClient,
  _params: {
    idBuah: number;
    beratKg: number;
    idDetailTransaksi: number;
  }
): Promise<void> {
  void _tx;
  void _params;
  return Promise.resolve();
}

// [AI] prompt: "Fungsi buatTransaksi(idPengguna, input) memvalidasi buah aktif dari modul master asli, menghitung total, memvalidasi uang diterima, lalu menjalankan persistensi atomik lewat jalankanTransaksiDb asli."
export async function buatTransaksi(
  idPengguna: number,
  input: BuatTransaksiInput
): Promise<Struk> {
  const daftarBuahAktif = await getDaftarBuahAktif();
  const mapBuah = new Map<number, BuahAktif>(
    daftarBuahAktif.map((b) => [b.idBuah, b])
  );

  for (const item of input.item) {
    if (!mapBuah.has(item.idBuah)) {
      throw new ErrorValidasi("Buah tidak tersedia");
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
      throw new ErrorValidasi("Uang yang diterima kurang");
    }
    try {
      kembalian = hitungKembalian(input.uangDiterima, totalBayar);
    } catch (err) {
      throw new ErrorValidasi(
        err instanceof Error ? err.message : "Uang yang diterima kurang"
      );
    }
    uangDiterima = input.uangDiterima;
  }

  const idTransaksi = await jalankanTransaksiDb(async (tx) => {
    const header = await simpanTransaksi(tx, {
      idPengguna,
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

      await alokasiStokFifoSementara(tx, {
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
