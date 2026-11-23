// [AI] prompt: Komponen KartuBuah untuk menampilkan kartu buah dengan placeholder gambar, nama tebal, pill kategori/status, harga per kg, stok minimum, dan tombol aksi ubah/nonaktifkan
'use client';

import React from 'react';
import { KartuPanel } from '@/components/ui/CardPanel';
import { Pill } from '@/components/ui/Pill';
import { Tombol } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/format';
import type { Buah } from '../types';
import styles from './KartuBuah.module.css';

interface KartuBuahProps {
  buah: Buah;
  onUbah: (buah: Buah) => void;
  onUbahStatus: (buah: Buah, aktif: boolean) => void;
  sedangMemproses?: boolean;
}

// [AI] prompt: Render satu kartu buah dengan penanganan status aktif dan nonaktif tanpa tombol hapus
export const KartuBuah: React.FC<KartuBuahProps> = ({
  buah,
  onUbah,
  onUbahStatus,
  sedangMemproses = false,
}) => {
  return (
    <KartuPanel variant={buah.aktif ? 'putih' : 'abu'} padding="md">
      <div className={styles.kartu}>
        <div className={styles.barisUtama}>
          {/* Kotak Placeholder Gambar Buah */}
          <div className={styles.kotakGambar} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>

          {/* Konten Tengah: Nama & Kategori */}
          <div className={styles.kontenTengah}>
            <h3 className={styles.namaBuah}>{buah.namaBuah}</h3>
            <div className={styles.grupPill}>
              <Pill variant="netral">{buah.namaKategori}</Pill>
              {buah.aktif ? (
                <Pill variant="hijau">Aktif</Pill>
              ) : (
                <Pill variant="merah">Nonaktif</Pill>
              )}
            </div>
          </div>

          {/* Bagian Kanan: Harga per Kg */}
          <div className={styles.bagianKanan}>
            <p className={styles.harga}>{formatRupiah(buah.hargaPerKg)}</p>
            <span className={styles.satuan}>/ {buah.simbolSatuan || 'kg'}</span>
          </div>
        </div>

        {/* Baris Informasi Stok Minimum */}
        <div className={styles.barisInfo}>
          <span>Stok minimum: {buah.stokMinimum} {buah.simbolSatuan || 'kg'}</span>
          <span className={styles.catatanUtuh}>*Riwayat transaksi tetap utuh</span>
        </div>

        {/* Tombol Aksi */}
        {buah.aktif ? (
          <div className={styles.barisAksi}>
            <Tombol
              variant="sekunder"
              title="Ubah"
              className={styles.tombolAksi}
              onClick={() => onUbah(buah)}
              disabled={sedangMemproses}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
            />
            <Tombol
              variant="bahaya"
              title="Nonaktifkan"
              className={styles.tombolAksi}
              onClick={() => onUbahStatus(buah, false)}
              disabled={sedangMemproses}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              }
            />
          </div>
        ) : (
          <Tombol
            variant="sekunder"
            title="Aktifkan kembali"
            fullWidth
            onClick={() => onUbahStatus(buah, true)}
            disabled={sedangMemproses}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            }
          />
        )}
      </div>
    </KartuPanel>
  );
};
