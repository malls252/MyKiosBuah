// [AI] prompt: "Buat src/app/(kasir)/kasir/riwayat/page.tsx sebagai halaman Riwayat Transaksi Kasir dengan TabFilter (Hari ini, Kemarin, Pilih tanggal), CardPanel per transaksi, Pill metode bayar, dan BottomSheet detail struk via GET /api/transaksi/[id]."
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TabFilter } from "@/components/ui/TabFilter";
import { CardPanel } from "@/components/ui/CardPanel";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { Struk } from "@/modules/transaksi/types";
import type { RingkasanRiwayat } from "@/modules/transaksi/repository";
import styles from "./page.module.css";

type TabPeriode = "hari-ini" | "kemarin" | "pilih-tanggal";

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nilai);
}

// [AI] prompt: "Helper tanggalJakartaYmd mengembalikan string YYYY-MM-DD sesuai zona waktu Asia/Jakarta."
function tanggalJakartaYmd(offsetHari = 0): string {
  const d = new Date(Date.now() + offsetHari * 86400000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatJamJakarta(iso: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function formatTanggalWaktuJakarta(iso: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

const IkonPrinter = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export default function HalamanRiwayatKasir() {
  const [tabAktif, setTabAktif] = useState<TabPeriode>("hari-ini");
  const [tanggalTerpilih, setTanggalTerpilih] = useState<string>("");
  const [reloadKe, setReloadKe] = useState<number>(0);
  const [daftar, setDaftar] = useState<RingkasanRiwayat[]>([]);
  const [sedangMuat, setSedangMuat] = useState<boolean>(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);

  // State detail struk di BottomSheet
  const [strukAktif, setStrukAktif] = useState<Struk | null>(null);
  const [bukaStruk, setBukaStruk] = useState<boolean>(false);
  const [sedangMuatStruk, setSedangMuatStruk] = useState<number | null>(null);
  const [errorStruk, setErrorStruk] = useState<string | null>(null);

  // [AI] prompt: "Muat riwayat dari GET /api/transaksi secara asinkron di dalam useEffect agar aman dari prerender Next.js 16 dan aturan react-hooks/set-state-in-effect."
  useEffect(() => {
    let aktif = true;
    const tanggalTarget = tanggalTerpilih || tanggalJakartaYmd(0);

    const ambilData = async () => {
      if (!tanggalTerpilih) {
        setTanggalTerpilih(tanggalTarget);
      }
      setSedangMuat(true);
      setErrorMuat(null);

      try {
        const res = await fetch(`/api/transaksi?tanggal=${encodeURIComponent(tanggalTarget)}`);
        const json = await res.json();
        if (!aktif) return;

        if (!res.ok || !json.berhasil) {
          setErrorMuat(json.pesan || "Gagal memuat riwayat transaksi.");
          setDaftar([]);
          return;
        }

        setDaftar(json.data as RingkasanRiwayat[]);
      } catch {
        if (!aktif) return;
        setErrorMuat("Gagal terhubung ke server. Periksa koneksi internet.");
        setDaftar([]);
      } finally {
        if (aktif) {
          setSedangMuat(false);
        }
      }
    };

    void ambilData();
    return () => {
      aktif = false;
    };
  }, [tanggalTerpilih, reloadKe]);

  // [AI] prompt: "handleGantiTab mengubah tab periode dan langsung memperbarui tanggal filter."
  const handleGantiTab = useCallback((id: string) => {
    const tab = id as TabPeriode;
    setTabAktif(tab);
    if (tab === "hari-ini") {
      setTanggalTerpilih(tanggalJakartaYmd(0));
    } else if (tab === "kemarin") {
      setTanggalTerpilih(tanggalJakartaYmd(-1));
    }
  }, []);

  // [AI] prompt: "bukaDetailStruk memanggil GET /api/transaksi/[id] dan membuka BottomSheet struk."
  const bukaDetailStruk = async (idTransaksi: number) => {
    setSedangMuatStruk(idTransaksi);
    setErrorStruk(null);

    try {
      const res = await fetch(`/api/transaksi/${idTransaksi}`);
      const json = await res.json();

      if (!res.ok || !json.berhasil) {
        setErrorStruk(json.pesan || "Gagal memuat detail struk.");
        return;
      }

      setStrukAktif(json.data as Struk);
      setBukaStruk(true);
    } catch {
      setErrorStruk("Gagal terhubung ke server saat memuat struk.");
    } finally {
      setSedangMuatStruk(null);
    }
  };

  const tabs = [
    { id: "hari-ini", label: "Hari ini" },
    { id: "kemarin", label: "Kemarin" },
    { id: "pilih-tanggal", label: "Pilih tanggal" },
  ];

  const subjudul = sedangMuat
    ? "Memuat data transaksi..."
    : `${daftar.length} transaksi pada ${tanggalTerpilih || "periode ini"}`;

  return (
    <PageLayout title="Kasir" peran="kasir" namaPengguna="Rina Wulandari">
      <div className={styles.container}>
        <SectionHeader title="Riwayat Transaksi" subtitle={subjudul} />

        <TabFilter tabs={tabs} activeTab={tabAktif} onChange={handleGantiTab} />

        {tabAktif === "pilih-tanggal" && (
          <CardPanel variant="putih" padding="sm" className={styles.panelTanggal}>
            <label className={styles.labelTanggal}>
              <span>Pilih Tanggal</span>
              <input
                type="date"
                className={styles.inputTanggal}
                value={tanggalTerpilih}
                onChange={(e) => setTanggalTerpilih(e.target.value)}
              />
            </label>
          </CardPanel>
        )}

        {errorStruk && (
          <InfoPanel variant="cream" title="Gagal Memuat Struk" description={errorStruk} />
        )}

        {/* Keadaan loading */}
        {sedangMuat ? (
          <CardPanel variant="abu" padding="md">
            <p className={styles.teksStatus}>Memuat riwayat transaksi...</p>
          </CardPanel>
        ) : errorMuat ? (
          /* Keadaan gagal memuat */
          <CardPanel variant="abu" padding="md" className={styles.kartuError}>
            <p className={styles.teksStatus}>{errorMuat}</p>
            <Button
              title="Coba lagi"
              variant="utama"
              onClick={() => setReloadKe((n) => n + 1)}
            />
          </CardPanel>
        ) : daftar.length === 0 ? (
          /* Keadaan kosong */
          <CardPanel variant="abu" padding="md">
            <p className={styles.teksStatus}>Belum ada transaksi pada tanggal ini.</p>
          </CardPanel>
        ) : (
          /* Daftar transaksi */
          <div className={styles.daftar}>
            {daftar.map((trx) => (
              <CardPanel
                key={trx.idTransaksi}
                variant="putih"
                padding="md"
                className={styles.kartuTransaksi}
              >
                <div className={styles.barisAtas}>
                  <div className={styles.infoKiri}>
                    <span className={styles.nomorTrx}>Transaksi #{trx.idTransaksi}</span>
                    <span className={styles.waktuTrx}>
                      {formatJamJakarta(trx.tanggalWaktu)} WIB • {trx.namaKasir}
                    </span>
                  </div>
                  <span className={styles.totalBayar}>{formatRupiah(trx.totalBayar)}</span>
                </div>

                <p className={styles.ringkasanItem}>{trx.ringkasanItem}</p>

                <div className={styles.barisBawah}>
                  <Pill variant={trx.metodeBayar === "Tunai" ? "hijau" : "kuning"}>
                    {trx.metodeBayar}
                  </Pill>

                  <button
                    type="button"
                    className={styles.btnCetakUlang}
                    disabled={sedangMuatStruk === trx.idTransaksi}
                    onClick={() => bukaDetailStruk(trx.idTransaksi)}
                  >
                    <IkonPrinter />
                    <span>
                      {sedangMuatStruk === trx.idTransaksi ? "Memuat..." : "Cetak ulang"}
                    </span>
                  </button>
                </div>
              </CardPanel>
            ))}
          </div>
        )}

        {/* BottomSheet Detail Struk */}
        <BottomSheet
          isOpen={bukaStruk}
          onClose={() => setBukaStruk(false)}
          title={strukAktif ? `Struk #${strukAktif.idTransaksi}` : "Detail Struk"}
        >
          {strukAktif && (
            <div className={styles.strukWrap}>
              <div className={styles.strukHeader}>
                <strong>MyKiosBuah</strong>
                <span>No. #{strukAktif.idTransaksi}</span>
                <span>{formatTanggalWaktuJakarta(strukAktif.tanggalWaktu)} WIB</span>
                <span>Kasir: {strukAktif.namaKasir}</span>
              </div>

              <hr className={styles.garisPutus} />

              <div className={styles.daftarItemStruk}>
                {strukAktif.item.map((item, idx) => (
                  <div key={idx} className={styles.itemStruk}>
                    <div className={styles.itemStrukAtas}>
                      <span className={styles.itemNama}>{item.namaBuah}</span>
                      <span className={styles.itemSubtotal}>{formatRupiah(item.subtotal)}</span>
                    </div>
                    <span className={styles.itemDetail}>
                      {item.beratKg} kg × {formatRupiah(item.hargaSatuan)}
                      {item.diskon > 0 ? ` (Diskon ${formatRupiah(item.diskon)})` : ""}
                    </span>
                  </div>
                ))}
              </div>

              <hr className={styles.garisPutus} />

              <div className={styles.barisRingkas}>
                <span>Total Bruto</span>
                <span>{formatRupiah(strukAktif.totalBruto)}</span>
              </div>
              {strukAktif.totalDiskon > 0 && (
                <div className={styles.barisRingkas}>
                  <span>Total Diskon</span>
                  <span>– {formatRupiah(strukAktif.totalDiskon)}</span>
                </div>
              )}
              <div className={`${styles.barisRingkas} ${styles.totalUtama}`}>
                <span>Total Bayar</span>
                <span>{formatRupiah(strukAktif.totalBayar)}</span>
              </div>
              <div className={styles.barisRingkas}>
                <span>Metode Bayar</span>
                <span>{strukAktif.metodeBayar}</span>
              </div>
              {strukAktif.metodeBayar === "Tunai" && (
                <>
                  <div className={styles.barisRingkas}>
                    <span>Uang Diterima</span>
                    <span>{formatRupiah(strukAktif.uangDiterima ?? 0)}</span>
                  </div>
                  <div className={`${styles.barisRingkas} ${styles.kembalian}`}>
                    <span>Kembalian</span>
                    <span>{formatRupiah(strukAktif.kembalian ?? 0)}</span>
                  </div>
                </>
              )}

              <div className={styles.aksiStruk}>
                <Link
                  href={`/kasir/struk/${strukAktif.idTransaksi}`}
                  className={styles.linkHalamanStruk}
                >
                  <IkonPrinter />
                  <span>Buka Halaman Cetak Struk</span>
                </Link>
                <Button
                  title="Tutup"
                  variant="sekunder"
                  fullWidth
                  onClick={() => setBukaStruk(false)}
                />
              </div>
            </div>
          )}
        </BottomSheet>
      </div>
    </PageLayout>
  );
}
