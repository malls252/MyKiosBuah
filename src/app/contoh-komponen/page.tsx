// [AI] prompt: "Buat halaman demo src/app/contoh-komponen/page.tsx untuk menguji secara visual seluruh variasi Button, Pill, CardPanel, SectionHeader, TabFilter, InfoPanel, BottomSheet, HeaderHalaman, dan NavigasiBawah."
// TODO: Hapus halaman demo ini sebelum UAT.
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { CardPanel } from "@/components/ui/CardPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TabFilter } from "@/components/ui/TabFilter";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PageLayout } from "@/components/layout/PageLayout";
import { PeranPengguna } from "@/components/layout/menu";
import styles from "./contoh.module.css";

// [AI] prompt: "Komponen HalamanContohKomponen menampilkan demo interaktif seluruh UI reusable MyKiosBuah."
export default function HalamanContohKomponen() {
  const [tabAktif, setTabAktif] = useState("semua");
  const [sheetBuka, setSheetBuka] = useState(false);
  const [peranDemo, setPeranDemo] = useState<PeranPengguna>("pembeli");
  const [tombolLoading, setTombolLoading] = useState(false);

  const daftarTab = [
    { id: "semua", label: "Semua Buah", count: 10 },
    { id: "lokal", label: "Buah Lokal", count: 4 },
    { id: "impor", label: "Buah Impor", count: 2 },
    { id: "tropis", label: "Tropis", count: 4 },
    { id: "musiman", label: "Musiman" },
  ];

  return (
    <PageLayout
      title="Katalog Pembeli"
      chipKiri={{ baris1: "PASURUAN", baris2: "Kios Utama" }}
      chipKanan={{ baris1: "STATUS", baris2: "Buka • 08:00" }}
      peran={peranDemo}
      namaPengguna="Ali Mansur (Demo)"
    >
      {/* 1. Pengalih Peran Navigasi */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Pratinjau Navigasi Peran"
          subtitle="Ubah tampilan navigasi bawah berdasarkan peran pengguna"
        />
        <div className={styles.row}>
          <Button
            variant={peranDemo === "pembeli" ? "utama" : "sekunder"}
            title="Pembeli"
            onClick={() => setPeranDemo("pembeli")}
          />
          <Button
            variant={peranDemo === "kasir" ? "utama" : "sekunder"}
            title="Kasir"
            onClick={() => setPeranDemo("kasir")}
          />
          <Button
            variant={peranDemo === "admin" ? "utama" : "sekunder"}
            title="Super Admin"
            onClick={() => setPeranDemo("admin")}
          />
        </div>
      </div>

      {/* 2. Varian Button */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Komponen Button"
          subtitle="Tiga varian warna, tombol 2 baris, dan status loading"
        />
        <div className={styles.buttonGrid}>
          <Button
            variant="utama"
            title="Tombol Utama (1 Baris)"
            fullWidth
            onClick={() => alert("Tombol utama diklik!")}
          />
          <Button
            variant="utama"
            title="Proses Transaksi & Simpan"
            subtitle="Alokasi otomatis metode FIFO ke batch tertua"
            fullWidth
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <div className={styles.row}>
            <Button
              variant="sekunder"
              title="Tombol Sekunder"
              onClick={() => alert("Tombol sekunder diklik")}
            />
            <Button
              variant="bahaya"
              title="Hapus / Bahaya"
              onClick={() => alert("Tombol bahaya diklik")}
            />
            <Button
              variant="utama"
              title={tombolLoading ? "Sedang Memproses..." : "Uji Status Loading"}
              loading={tombolLoading}
              onClick={() => {
                setTombolLoading(true);
                setTimeout(() => setTombolLoading(false), 1500);
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Varian Pill */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Komponen Pill (Kapsul)"
          subtitle="Status transaksi, peran akun, dan stok buah"
        />
        <div className={styles.row}>
          <Pill variant="netral">Netral / Umum</Pill>
          <Pill variant="hitam">Dark Green (Super Admin)</Pill>
          <Pill variant="hijau">Tersedia / Selesai</Pill>
          <Pill variant="merah">Habis / Bahaya</Pill>
          <Pill variant="kuning">Sedang Disiapkan</Pill>
        </div>
      </div>

      {/* 4. TabFilter */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Komponen TabFilter"
          subtitle="Dapat digeser horizontal pada mobile dengan badge jumlah"
        />
        <TabFilter
          tabs={daftarTab}
          activeTab={tabAktif}
          onChange={(id) => setTabAktif(id)}
        />
      </div>

      {/* 5. CardPanel */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Komponen CardPanel"
          subtitle="Varian putih (konten/produk) dan varian abu (latar sekunder)"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <CardPanel variant="putih">
            <div className={styles.cardItem}>
              <div>
                <div className={styles.sampleTitle}>Apel Malang Manis</div>
                <div className={styles.sampleSub}>Kategori: Buah Lokal • Sisa: 36.5 kg</div>
              </div>
              <div className={styles.samplePrice}>Rp 28.000 / kg</div>
            </div>
          </CardPanel>

          <CardPanel variant="abu">
            <div className={styles.cardItem}>
              <div>
                <div className={styles.sampleTitle}>Ringkasan Batch FIFO Tertua</div>
                <div className={styles.sampleSub}>Batch #1 (12 Okt 2026) telah habis teralokasi</div>
              </div>
              <Pill variant="merah">Habis</Pill>
            </div>
          </CardPanel>
        </div>
      </div>

      {/* 6. InfoPanel */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Komponen InfoPanel"
          subtitle="Pesan informasi penting dan tips operasional"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <InfoPanel
            variant="hijau"
            title="Sistem Alokasi FIFO Aktif"
            description="Stok buah yang masuk lebih awal akan otomatis dikurangi terlebih dahulu saat transaksi kasir diproses."
          />
          <InfoPanel
            variant="cream"
            title="Perhatian Pengiriman Pesanan"
            description="Pesanan online dengan metode 'Diantar' wajib memiliki alamat tujuan yang valid dan biaya antar."
          />
        </div>
      </div>

      {/* 7. BottomSheet Demo */}
      <div className={styles.demoSection}>
        <SectionHeader
          title="Komponen BottomSheet"
          subtitle="Panel modal bawah layar dengan tombol escape dan animasi halus"
        />
        <Button
          variant="utama"
          title="Buka Lembar Bawah (BottomSheet)"
          subtitle="Klik untuk menguji lembar modal geser bawah"
          fullWidth
          onClick={() => setSheetBuka(true)}
        />

        <BottomSheet
          isOpen={sheetBuka}
          onClose={() => setSheetBuka(false)}
          title="Detail Uji Lembar Bawah"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Ini adalah isi konten interaktif di dalam BottomSheet. Dapat ditutup
              dengan tombol silang di kanan atas, menekan tombol Escape di keyboard,
              atau mengklik latar belakang overlay gelap di luar panel.
            </p>
            <InfoPanel
              title="Informasi Tambahan"
              description="BottomSheet ini otomatis mengunci scroll body saat sedang terbuka agar navigasi tetap nyaman."
            />
            <Button
              variant="utama"
              title="Tutup Lembar Ini"
              fullWidth
              onClick={() => setSheetBuka(false)}
            />
          </div>
        </BottomSheet>
      </div>
    </PageLayout>
  );
}
