// [AI] prompt: "Buat src/modules/transaksi/components/StrukTransaksi.tsx sebagai Client Component struk transaksi MyKiosBuah dengan format waktu Asia/Jakarta, tabel item, ringkasan pembayaran, tombol Cetak (window.print) + Tutup, dan gaya cetak 58mm."
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Struk } from "@/modules/transaksi/types";
import styles from "./StrukTransaksi.module.css";

export interface StrukTransaksiProps {
  struk: Struk;
  onTutup?: () => void;
  labelTutup?: string;
}

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nilai);
}

function formatBerat(beratKg: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(beratKg);
}

// [AI] prompt: "Format waktu transaksi menjadi DD-MM-YYYY HH:mm zona Asia/Jakarta."
function formatWaktuStruk(iso: string | Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));

  const ambil = (tipe: string) => parts.find((p) => p.type === tipe)?.value ?? "";
  return `${ambil("day")}-${ambil("month")}-${ambil("year")} ${ambil("hour")}:${ambil("minute")}`;
}

const IkonPrinter = () => (
  <svg
    width={18}
    height={18}
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

export const StrukTransaksi: React.FC<StrukTransaksiProps> = ({
  struk,
  onTutup,
  labelTutup = "Tutup",
}) => {
  const router = useRouter();

  const handleCetak = () => {
    window.print();
  };

  const handleTutup = () => {
    if (onTutup) {
      onTutup();
    } else {
      router.push("/kasir/riwayat");
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Area yang dicetak (58mm pada @media print) */}
      <article className={`${styles.kertasStruk} area-cetak-struk`}>
        <header className={styles.kepalaKios}>
          <h2 className={styles.namaKios}>MyKiosBuah</h2>
          <p className={styles.subKios}>Kios Buah Segar • Pasuruan</p>
        </header>

        <hr className={styles.garisPutus} />

        <dl className={styles.metaGrid}>
          <div className={styles.metaBaris}>
            <dt>No. Transaksi</dt>
            <dd>#{struk.idTransaksi}</dd>
          </div>
          <div className={styles.metaBaris}>
            <dt>Waktu</dt>
            <dd>{formatWaktuStruk(struk.tanggalWaktu)} WIB</dd>
          </div>
          <div className={styles.metaBaris}>
            <dt>Kasir</dt>
            <dd>{struk.namaKasir}</dd>
          </div>
        </dl>

        <hr className={styles.garisPutus} />

        <table className={styles.tabelItem}>
          <thead>
            <tr>
              <th>Item</th>
              <th className={styles.rataKanan}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {struk.item.map((item, idx) => (
              <tr key={`${item.namaBuah}-${idx}`}>
                <td>
                  <div className={styles.namaBuah}>{item.namaBuah}</div>
                  <div className={styles.rincianBuah}>
                    {formatBerat(item.beratKg)} kg × {formatRupiah(item.hargaSatuan)}
                  </div>
                  {item.diskon > 0 && (
                    <div className={styles.diskonItem}>
                      Diskon −{formatRupiah(item.diskon)}
                    </div>
                  )}
                </td>
                <td className={`${styles.rataKanan} ${styles.nilaiSubtotal}`}>
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className={styles.garisPutus} />

        <dl className={styles.ringkasanGrid}>
          <div className={styles.ringkasanBaris}>
            <dt>Total Bruto</dt>
            <dd>{formatRupiah(struk.totalBruto)}</dd>
          </div>
          <div className={styles.ringkasanBaris}>
            <dt>Total Diskon</dt>
            <dd>{struk.totalDiskon > 0 ? `−${formatRupiah(struk.totalDiskon)}` : "Rp0"}</dd>
          </div>
          <div className={`${styles.ringkasanBaris} ${styles.totalBayar}`}>
            <dt>Total Bayar</dt>
            <dd>{formatRupiah(struk.totalBayar)}</dd>
          </div>
          <div className={styles.ringkasanBaris}>
            <dt>Metode Bayar</dt>
            <dd>{struk.metodeBayar}</dd>
          </div>

          {struk.metodeBayar === "Tunai" && (
            <>
              <div className={styles.ringkasanBaris}>
                <dt>Uang Diterima</dt>
                <dd>{formatRupiah(struk.uangDiterima ?? 0)}</dd>
              </div>
              <div className={`${styles.ringkasanBaris} ${styles.kembalian}`}>
                <dt>Kembalian</dt>
                <dd>{formatRupiah(struk.kembalian ?? 0)}</dd>
              </div>
            </>
          )}
        </dl>

        <hr className={styles.garisPutus} />

        <footer className={styles.catatanBawah}>
          <p>Terima kasih telah berbelanja di MyKiosBuah!</p>
          <p>Simpan struk ini sebagai bukti pembayaran.</p>
        </footer>
      </article>

      {/* Tombol aksi (tidak ikut tercetak) */}
      <div className={styles.aksiBar}>
        <Button
          title="Cetak"
          icon={<IkonPrinter />}
          variant="utama"
          fullWidth
          onClick={handleCetak}
        />
        <Button
          title={labelTutup}
          variant="sekunder"
          fullWidth
          onClick={handleTutup}
        />
      </div>
    </div>
  );
};
