// [AI] prompt: "File ini SEMENTARA karena modul Akun dan modul Stok dari Elvya belum selesai dibuat. Isinya akan dibuang dan diganti import asli setelah modul Akun dan Stok digabung ke dev."
/**
 * ============================================================================
 * PERHATIAN - FILE STUB SEMENTARA:
 * File ini berisi tiruan fungsi-fungsi dari modul Akun & Stok FIFO Elvya.
 * Seluruh isi file ini AKAN DIHAPUS dan digantikan dengan import modul asli:
 *   - @/lib/db
 *   - @/lib/auth
 *   - @/modules/master/service
 *   - @/modules/fifo/service
 * setelah modul Elvya digabungkan (merged) ke branch dev.
 * ============================================================================
 */

import { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { BuahAktif } from "./types";

// [AI] prompt: "Definisikan class error StokTidakCukupError untuk penanganan kegagalan alokasi stok FIFO."
export class StokTidakCukupError extends Error {
  constructor(pesan = "Stok buah tidak mencukupi untuk transaksi ini.") {
    super(pesan);
    this.name = "StokTidakCukupError";
  }
}

// [AI] prompt: "Stub fungsi getSesi mengembalikan data kasir demo Rina Wulandari (id 2, peran Kasir)."
export async function getSesi(): Promise<{
  idPengguna: number;
  nama: string;
  peran: "Kasir";
}> {
  return {
    idPengguna: 2,
    nama: "Rina Wulandari",
    peran: "Kasir",
  };
}

// [AI] prompt: "Stub fungsi getDaftarBuahAktif mengembalikan 4 buah contoh aktif (Apel Malang, Jeruk Medan, Pisang Cavendish, Melon Hijau)."
export async function getDaftarBuahAktif(): Promise<BuahAktif[]> {
  return [
    {
      idBuah: 1,
      namaBuah: "Apel Malang",
      hargaPerKg: 28000,
      simbolSatuan: "kg",
    },
    {
      idBuah: 2,
      namaBuah: "Jeruk Medan",
      hargaPerKg: 25000,
      simbolSatuan: "kg",
    },
    {
      idBuah: 3,
      namaBuah: "Pisang Cavendish",
      hargaPerKg: 22000,
      simbolSatuan: "kg",
    },
    {
      idBuah: 7,
      namaBuah: "Melon Hijau",
      hargaPerKg: 14000,
      simbolSatuan: "kg",
    },
  ];
}

// [AI] prompt: "Stub fungsi alokasiStokFifo mengembalikan Promise kosong untuk simulasi alokasi batch stok."
export async function alokasiStokFifo(
  _tx: PoolClient,
  _params: {
    idBuah: number;
    beratKg: number;
    idDetailTransaksi: number;
  }
): Promise<void> {
  // Sementara tidak melakukan apa-apa hingga modul FIFO selesai
  return Promise.resolve();
}

// [AI] prompt: "Fungsi jalankanTransaksiDb membuka koneksi pool pg, mengeksekusi blok transaksi (BEGIN, COMMIT, ROLLBACK), dan me-release client."
export async function jalankanTransaksiDb<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const hasil = await callback(client);
    await client.query("COMMIT");
    return hasil;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
