// [AI] prompt: "Buat src/app/(kasir)/kasir/page.tsx sebagai halaman utama kasir: tampilkan daftar buah aktif, formulir pilih buah + berat + diskon, ringkasan keranjang, input metode bayar, dan kirim POST ke /api/transaksi. Semua logika bisnis ada di service, komponen hanya tampilan dan interaksi UI."
"use client";

import React, { useState, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardPanel } from "@/components/ui/CardPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { BuahAktif, Struk } from "@/modules/transaksi/types";
import styles from "./page.module.css";

// ─── Tipe lokal untuk item di keranjang ──────────────────────────────────────
// [AI] prompt: "ItemKeranjang mewakili baris item yang sudah dipilih kasir sebelum dikirim ke API."
interface ItemKeranjang {
  idBuah: number;
  namaBuah: string;
  hargaPerKg: number;
  beratKg: number;
  diskon: number;
}

// ─── Data buah statis (dari stub-sementara) ───────────────────────────────────
// [AI] prompt: "Daftar buah aktif dikodekan langsung sementara modul Elvya belum selesai; akan diganti fetch API setelah modul digabung."
const DAFTAR_BUAH_AKTIF: BuahAktif[] = [
  { idBuah: 1, namaBuah: "Apel Malang",       hargaPerKg: 28000, simbolSatuan: "kg" },
  { idBuah: 2, namaBuah: "Jeruk Medan",        hargaPerKg: 25000, simbolSatuan: "kg" },
  { idBuah: 3, namaBuah: "Pisang Cavendish",   hargaPerKg: 22000, simbolSatuan: "kg" },
  { idBuah: 7, namaBuah: "Melon Hijau",        hargaPerKg: 14000, simbolSatuan: "kg" },
];

// ─── Helper format rupiah ─────────────────────────────────────────────────────
function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nilai);
}

// ─── Komponen kartu pemilih buah ─────────────────────────────────────────────
// [AI] prompt: "BuahPilihCard menampilkan nama, harga, dan tombol + untuk menambah buah ke keranjang."
function BuahPilihCard({
  buah,
  sudahDiKeranjang,
  onTambah,
}: {
  buah: BuahAktif;
  sudahDiKeranjang: boolean;
  onTambah: (buah: BuahAktif) => void;
}) {
  return (
    <CardPanel variant="putih" padding="sm" className={styles.buahCard}>
      <div className={styles.buahInfo}>
        <span className={styles.buahNama}>{buah.namaBuah}</span>
        <span className={styles.buahHarga}>{formatRupiah(buah.hargaPerKg)}/kg</span>
      </div>
      <button
        type="button"
        className={`${styles.btnTambahBuah} ${sudahDiKeranjang ? styles.sudahDipilih : ""}`}
        onClick={() => onTambah(buah)}
        aria-label={`Tambah ${buah.namaBuah}`}
        disabled={sudahDiKeranjang}
      >
        {sudahDiKeranjang ? "✓" : "+"}
      </button>
    </CardPanel>
  );
}

// ─── Komponen baris item keranjang ────────────────────────────────────────────
// [AI] prompt: "KeranjangItem menampilkan nama buah, input berat, input diskon, subtotal, dan tombol hapus."
function KeranjangItem({
  item,
  onChange,
  onHapus,
}: {
  item: ItemKeranjang;
  onChange: (id: number, field: "beratKg" | "diskon", nilai: number) => void;
  onHapus: (id: number) => void;
}) {
  const bruto = Math.round(item.beratKg * item.hargaPerKg * 100) / 100;
  const subtotal = Math.max(0, Math.round((bruto - item.diskon) * 100) / 100);

  return (
    <CardPanel variant="putih" padding="sm" className={styles.keranjangItem}>
      <div className={styles.keranjangItemHeader}>
        <span className={styles.keranjangNama}>{item.namaBuah}</span>
        <button
          type="button"
          className={styles.btnHapus}
          onClick={() => onHapus(item.idBuah)}
          aria-label={`Hapus ${item.namaBuah}`}
        >
          ✕
        </button>
      </div>

      <div className={styles.keranjangInputRow}>
        <label className={styles.inputLabel}>
          Berat (kg)
          <input
            type="number"
            className={styles.inputAngka}
            value={item.beratKg === 0 ? "" : item.beratKg}
            min={0.001}
            max={999}
            step={0.1}
            onChange={(e) =>
              onChange(item.idBuah, "beratKg", parseFloat(e.target.value) || 0)
            }
          />
        </label>

        <label className={styles.inputLabel}>
          Diskon (Rp)
          <input
            type="number"
            className={styles.inputAngka}
            value={item.diskon === 0 ? "" : item.diskon}
            min={0}
            step={500}
            onChange={(e) =>
              onChange(item.idBuah, "diskon", parseFloat(e.target.value) || 0)
            }
          />
        </label>
      </div>

      <div className={styles.keranjangSubtotal}>
        <span className={styles.subtotalLabel}>Subtotal</span>
        <span className={styles.subtotalNilai}>{formatRupiah(subtotal)}</span>
      </div>
    </CardPanel>
  );
}

// ─── Halaman utama kasir ──────────────────────────────────────────────────────
export default function HalamanKasir() {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [metodeBayar, setMetodeBayar] = useState<"Tunai" | "QRIS">("Tunai");
  const [uangDiterima, setUangDiterima] = useState<number>(0);

  // State UI
  const [sedangProses, setSedangProses] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "gagal"; teks: string } | null>(null);
  const [strukTerakhir, setStrukTerakhir] = useState<Struk | null>(null);
  const [showStruk, setShowStruk] = useState(false);

  // ─── Kalkulasi ringkasan ───────────────────────────────────────────────────
  const { totalBruto, totalDiskon, totalBayar } = keranjang.reduce(
    (acc, item) => {
      const bruto = Math.round(item.beratKg * item.hargaPerKg * 100) / 100;
      const subtotal = Math.max(0, Math.round((bruto - item.diskon) * 100) / 100);
      return {
        totalBruto: Math.round((acc.totalBruto + bruto) * 100) / 100,
        totalDiskon: Math.round((acc.totalDiskon + item.diskon) * 100) / 100,
        totalBayar: Math.round((acc.totalBayar + subtotal) * 100) / 100,
      };
    },
    { totalBruto: 0, totalDiskon: 0, totalBayar: 0 }
  );

  const kembalian =
    metodeBayar === "Tunai" && uangDiterima >= totalBayar
      ? Math.round((uangDiterima - totalBayar) * 100) / 100
      : null;

  // ─── Handler keranjang ─────────────────────────────────────────────────────
  // [AI] prompt: "Handler tambahBuah menambah item baru ke keranjang dengan berat awal 1 kg dan diskon 0."
  const tambahBuah = useCallback((buah: BuahAktif) => {
    setKeranjang((prev) => [
      ...prev,
      { idBuah: buah.idBuah, namaBuah: buah.namaBuah, hargaPerKg: buah.hargaPerKg, beratKg: 1, diskon: 0 },
    ]);
    setPesan(null);
  }, []);

  const hapusBuah = useCallback((idBuah: number) => {
    setKeranjang((prev) => prev.filter((i) => i.idBuah !== idBuah));
  }, []);

  const ubahItem = useCallback(
    (idBuah: number, field: "beratKg" | "diskon", nilai: number) => {
      setKeranjang((prev) =>
        prev.map((i) => (i.idBuah === idBuah ? { ...i, [field]: nilai } : i))
      );
    },
    []
  );

  const resetKeranjang = useCallback(() => {
    setKeranjang([]);
    setUangDiterima(0);
    setMetodeBayar("Tunai");
    setPesan(null);
  }, []);

  // ─── Submit transaksi ──────────────────────────────────────────────────────
  // [AI] prompt: "Handler prosesTransaksi memvalidasi input sisi klien, lalu POST ke /api/transaksi dan menangani semua kemungkinan respons server."
  const prosesTransaksi = async () => {
    setPesan(null);

    if (keranjang.length === 0) {
      setPesan({ tipe: "gagal", teks: "Keranjang masih kosong. Tambahkan buah terlebih dahulu." });
      return;
    }

    const itemTidakValid = keranjang.find((i) => i.beratKg <= 0);
    if (itemTidakValid) {
      setPesan({ tipe: "gagal", teks: `Berat ${itemTidakValid.namaBuah} harus lebih dari 0 kg.` });
      return;
    }

    if (metodeBayar === "Tunai" && uangDiterima < totalBayar) {
      setPesan({ tipe: "gagal", teks: `Uang diterima kurang. Total bayar ${formatRupiah(totalBayar)}.` });
      return;
    }

    setSedangProses(true);

    try {
      const body = {
        item: keranjang.map((i) => ({
          idBuah: i.idBuah,
          beratKg: i.beratKg,
          diskon: i.diskon,
        })),
        metodeBayar,
        ...(metodeBayar === "Tunai" ? { uangDiterima } : {}),
      };

      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.status === 201 && json.berhasil) {
        setStrukTerakhir(json.data as Struk);
        setShowStruk(true);
        resetKeranjang();
      } else if (res.status === 409) {
        setPesan({ tipe: "gagal", teks: json.pesan || "Stok buah tidak mencukupi." });
      } else if (res.status === 422 && json.isu) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isu = (json.isu as any[]).map((i) => i.pesan).join("; ");
        setPesan({ tipe: "gagal", teks: `Data tidak valid: ${isu}` });
      } else {
        setPesan({ tipe: "gagal", teks: json.pesan || "Terjadi kesalahan pada server." });
      }
    } catch {
      setPesan({ tipe: "gagal", teks: "Gagal terhubung ke server. Periksa koneksi internet." });
    } finally {
      setSedangProses(false);
    }
  };

  const idBuahDiKeranjang = new Set(keranjang.map((i) => i.idBuah));

  return (
    <PageLayout title="Transaksi Kasir" peran="kasir" namaPengguna="Rina Wulandari">
      <div className={styles.container}>

        {/* ── Pesan error/sukses ── */}
        {pesan && (
          <InfoPanel
            variant={pesan.tipe === "sukses" ? "hijau" : "cream"}
            title={pesan.tipe === "sukses" ? "Transaksi Berhasil" : "Perhatian"}
            description={pesan.teks}
            className={styles.pesanBanner}
          />
        )}

        {/* ── Daftar buah aktif ── */}
        {/* [AI] prompt: "Render grid kartu buah aktif dengan indikator sudah-di-keranjang." */}
        <SectionHeader title="Pilih Buah" subtitle="Ketuk + untuk menambah ke keranjang" />
        <div className={styles.gridBuah}>
          {DAFTAR_BUAH_AKTIF.map((buah) => (
            <BuahPilihCard
              key={buah.idBuah}
              buah={buah}
              sudahDiKeranjang={idBuahDiKeranjang.has(buah.idBuah)}
              onTambah={tambahBuah}
            />
          ))}
        </div>

        {/* ── Keranjang ── */}
        {keranjang.length > 0 && (
          <>
            <SectionHeader
              title="Keranjang"
              subtitle={`${keranjang.length} jenis buah`}
              action={
                <button type="button" className={styles.btnKosongkan} onClick={resetKeranjang}>
                  Kosongkan
                </button>
              }
            />

            <div className={styles.daftarKeranjang}>
              {keranjang.map((item) => (
                <KeranjangItem
                  key={item.idBuah}
                  item={item}
                  onChange={ubahItem}
                  onHapus={hapusBuah}
                />
              ))}
            </div>

            {/* ── Ringkasan total ── */}
            {/* [AI] prompt: "CardPanel ringkasan menampilkan totalBruto, totalDiskon, dan totalBayar dengan gaya kasir yang bersih." */}
            <CardPanel variant="abu" padding="md" className={styles.ringkasan}>
              <div className={styles.ringkasanBaris}>
                <span>Total Bruto</span>
                <span>{formatRupiah(totalBruto)}</span>
              </div>
              {totalDiskon > 0 && (
                <div className={`${styles.ringkasanBaris} ${styles.diskon}`}>
                  <span>Diskon</span>
                  <span>– {formatRupiah(totalDiskon)}</span>
                </div>
              )}
              <div className={`${styles.ringkasanBaris} ${styles.totalBayar}`}>
                <span>Total Bayar</span>
                <span>{formatRupiah(totalBayar)}</span>
              </div>
            </CardPanel>

            {/* ── Metode bayar ── */}
            {/* [AI] prompt: "Toggle metode bayar Tunai/QRIS dan input uang diterima kondisional untuk Tunai." */}
            <SectionHeader title="Pembayaran" />
            <CardPanel variant="putih" padding="md" className={styles.panelBayar}>
              <div className={styles.metodeBayarToggle}>
                <button
                  type="button"
                  className={`${styles.btnMetode} ${metodeBayar === "Tunai" ? styles.aktif : ""}`}
                  onClick={() => setMetodeBayar("Tunai")}
                >
                  💵 Tunai
                </button>
                <button
                  type="button"
                  className={`${styles.btnMetode} ${metodeBayar === "QRIS" ? styles.aktif : ""}`}
                  onClick={() => setMetodeBayar("QRIS")}
                >
                  📱 QRIS
                </button>
              </div>

              {metodeBayar === "Tunai" && (
                <label className={styles.inputLabel}>
                  Uang Diterima (Rp)
                  <input
                    type="number"
                    className={styles.inputAngka}
                    value={uangDiterima === 0 ? "" : uangDiterima}
                    min={totalBayar}
                    step={1000}
                    onChange={(e) => setUangDiterima(parseFloat(e.target.value) || 0)}
                    placeholder={`Min. ${formatRupiah(totalBayar)}`}
                  />
                </label>
              )}

              {metodeBayar === "Tunai" && kembalian !== null && (
                <div className={styles.kembalianBaris}>
                  <span>Kembalian</span>
                  <span className={styles.kembalianNilai}>{formatRupiah(kembalian)}</span>
                </div>
              )}
            </CardPanel>

            {/* ── Tombol proses ── */}
            <div className={styles.ctaWrapper}>
              <Button
                title={sedangProses ? "Memproses..." : "Proses Transaksi"}
                variant="utama"
                fullWidth
                loading={sedangProses}
                onClick={prosesTransaksi}
              />
            </div>
          </>
        )}

        {/* ── Struk hasil transaksi ── */}
        {/* [AI] prompt: "BottomSheet struk menampilkan detail transaksi yang baru selesai dengan ringkasan lengkap per item." */}
        <BottomSheet
          isOpen={showStruk}
          onClose={() => setShowStruk(false)}
          title="Transaksi Berhasil 🎉"
        >
          {strukTerakhir && (
            <div className={styles.strukWrap}>
              <p className={styles.strukMeta}>
                No. Transaksi: <strong>#{strukTerakhir.idTransaksi}</strong>
              </p>
              <p className={styles.strukMeta}>
                Kasir: <strong>{strukTerakhir.namaKasir}</strong>
              </p>
              <p className={styles.strukMeta}>
                Waktu:{" "}
                <strong>
                  {new Date(strukTerakhir.tanggalWaktu).toLocaleString("id-ID")}
                </strong>
              </p>

              <div className={styles.strukDivider} />

              {strukTerakhir.item.map((item, idx) => (
                <div key={idx} className={styles.strukItem}>
                  <span>{item.namaBuah}</span>
                  <span>
                    {item.beratKg} kg × {formatRupiah(item.hargaSatuan)}
                  </span>
                  {item.diskon > 0 && (
                    <span className={styles.strukDiskon}>Diskon – {formatRupiah(item.diskon)}</span>
                  )}
                  <span className={styles.strukSubtotal}>{formatRupiah(item.subtotal)}</span>
                </div>
              ))}

              <div className={styles.strukDivider} />

              <div className={styles.strukTotal}>
                <span>Total Bayar</span>
                <span>{formatRupiah(strukTerakhir.totalBayar)}</span>
              </div>
              {strukTerakhir.metodeBayar === "Tunai" && (
                <>
                  <div className={styles.strukTotal}>
                    <span>Uang Diterima</span>
                    <span>{formatRupiah(strukTerakhir.uangDiterima ?? 0)}</span>
                  </div>
                  <div className={`${styles.strukTotal} ${styles.strukturKembalian}`}>
                    <span>Kembalian</span>
                    <span>{formatRupiah(strukTerakhir.kembalian ?? 0)}</span>
                  </div>
                </>
              )}
              <div className={styles.strukMetodeBadge}>
                Metode: {strukTerakhir.metodeBayar}
              </div>

              <Button
                title="Transaksi Baru"
                variant="utama"
                fullWidth
                onClick={() => setShowStruk(false)}
                className={styles.btnTransaksiBaru}
              />
            </div>
          )}
        </BottomSheet>

      </div>
    </PageLayout>
  );
}
