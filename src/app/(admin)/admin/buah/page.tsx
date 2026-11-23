// [AI] prompt: Halaman /admin/buah untuk Super Admin dengan pencarian buah, TabFilter status, integrasi FormBuah di LembarBawah, dan daftar KartuBuah
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { KerangkaHalaman } from '@/components/layout/PageLayout';
import { JudulSeksi } from '@/components/ui/SectionHeader';
import { TabFilter } from '@/components/ui/TabFilter';
import { KartuPanel } from '@/components/ui/CardPanel';
import { Tombol } from '@/components/ui/Button';
import { LembarBawah } from '@/components/ui/BottomSheet';
import { KartuBuah } from '@/modules/master/components/KartuBuah';
import { FormBuah } from '@/modules/master/components/FormBuah';
import type { Buah, Kategori, Satuan } from '@/modules/master/types';
import styles from './buah.module.css';

// [AI] prompt: Komponen halaman kelola data master buah dengan perakitan tata letak wireframe admin
export default function HalamanAdminBuah() {
  const [daftarBuah, setDaftarBuah] = useState<Buah[]>([]);
  const [daftarKategori, setDaftarKategori] = useState<Kategori[]>([]);
  const [daftarSatuan, setDaftarSatuan] = useState<Satuan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Filter & Pencarian
  const [kataKunciCari, setKataKunciCari] = useState('');
  const [tabAktif, setTabAktif] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');

  // Modal Form Tambah / Ubah
  const [bukaModalForm, setBukaModalForm] = useState(false);
  const [buahDiedit, setBuahDiedit] = useState<Buah | null>(null);
  const [memprosesSimpan, setMemprosesSimpan] = useState(false);
  const [errorSimpan, setErrorSimpan] = useState<string | null>(null);

  const muatData = useCallback(async () => {
    setSedangMemuat(true);
    try {
      const [resBuah, resKategori, resSatuan] = await Promise.all([
        fetch('/api/buah'),
        fetch('/api/kategori'),
        fetch('/api/satuan'),
      ]);
      const jsonBuah = await resBuah.json();
      const jsonKategori = await resKategori.json();
      const jsonSatuan = await resSatuan.json();

      setDaftarBuah(jsonBuah.data || []);
      setDaftarKategori(jsonKategori.data || []);
      setDaftarSatuan(jsonSatuan.data || []);
    } catch {
      console.error('Gagal memuat data master buah');
    } finally {
      setSedangMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatData();
  }, [muatData]);

  // Handler Simpan Buah (Tambah / Ubah)
  const tanganiSimpanBuah = async (data: {
    namaBuah: string;
    idKategori: number;
    idSatuan: number;
    hargaPerKg: number;
    stokMinimum: number;
  }) => {
    setMemprosesSimpan(true);
    setErrorSimpan(null);

    try {
      const url = buahDiedit ? `/api/buah/${buahDiedit.idBuah}` : '/api/buah';
      const method = buahDiedit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorSimpan(json.error?.pesan || 'Gagal menyimpan data buah');
        setMemprosesSimpan(false);
        return;
      }

      setBukaModalForm(false);
      setBuahDiedit(null);
      await muatData();
    } catch {
      setErrorSimpan('Gagal terhubung ke server');
    } finally {
      setMemprosesSimpan(false);
    }
  };

  // Handler Ubah Status Aktif / Nonaktif
  const tanganiUbahStatus = async (buah: Buah, aktif: boolean) => {
    try {
      const res = await fetch(`/api/buah/${buah.idBuah}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktif }),
      });
      if (res.ok) {
        await muatData();
      }
    } catch {
      console.error('Gagal mengubah status aktif buah');
    }
  };

  // Perhitungan dan Penyaringan Buah
  const buahTersaring = daftarBuah.filter((b) => {
    const cocokCari = b.namaBuah.toLowerCase().includes(kataKunciCari.toLowerCase()) ||
      b.namaKategori.toLowerCase().includes(kataKunciCari.toLowerCase());

    if (!cocokCari) return false;

    if (tabAktif === 'aktif') return b.aktif;
    if (tabAktif === 'nonaktif') return !b.aktif;
    return true;
  });

  const totalBuah = daftarBuah.length;
  const totalAktif = daftarBuah.filter((b) => b.aktif).length;
  const totalNonaktif = totalBuah - totalAktif;

  return (
    <KerangkaHalaman
      title="Super Admin"
      peran="admin"
      chipKiri={{ baris1: 'KIOS', baris2: 'Pasuruan' }}
      chipKanan={{ baris1: 'STATUS', baris2: 'Buka' }}
    >
      <div className={styles.wadah}>
        {/* Header Seksi & Tombol Tambah Buah */}
        <JudulSeksi
          title="Data Buah"
          subtitle={`${totalBuah} buah - ${totalAktif} aktif`}
          action={
            <Tombol
              variant="utama"
              title="Tambah buah"
              onClick={() => {
                setBuahDiedit(null);
                setErrorSimpan(null);
                setBukaModalForm(true);
              }}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            />
          }
        />

        {/* Kolom Pencarian & Tautan ke Kategori/Satuan */}
        <div className={styles.barisCariDanSubmenu}>
          <div className={styles.barisCari}>
            <input
              type="text"
              className={styles.inputCari}
              placeholder="Cari buah atau kategori..."
              value={kataKunciCari}
              onChange={(e) => setKataKunciCari(e.target.value)}
            />
            <span className={styles.ikonCari} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>

          <div className={styles.tautanKategoriSatuan}>
            <Link href="/admin/kategori-satuan">
              <Tombol variant="sekunder" title="Kelola Kategori & Satuan" />
            </Link>
          </div>
        </div>

        {/* TabFilter: Semua, Aktif, Nonaktif */}
        <TabFilter
          tabs={[
            { id: 'semua', label: 'Semua', count: totalBuah },
            { id: 'aktif', label: 'Aktif', count: totalAktif },
            { id: 'nonaktif', label: 'Nonaktif', count: totalNonaktif },
          ]}
          activeTab={tabAktif}
          onChange={(id) => setTabAktif(id as 'semua' | 'aktif' | 'nonaktif')}
        />

        {/* Daftar Kartu Buah */}
        {sedangMemuat ? (
          <KartuPanel variant="abu" padding="md">
            <div className={styles.keadaanKosong}>Memuat data buah...</div>
          </KartuPanel>
        ) : buahTersaring.length === 0 ? (
          <KartuPanel variant="abu" padding="md">
            <div className={styles.keadaanKosong}>
              {kataKunciCari
                ? 'Tidak ada buah yang cocok dengan pencarian'
                : 'Belum ada data buah'}
            </div>
          </KartuPanel>
        ) : (
          <div className={styles.daftarKartu}>
            {buahTersaring.map((buah) => (
              <KartuBuah
                key={buah.idBuah}
                buah={buah}
                onUbah={(b) => {
                  setBuahDiedit(b);
                  setErrorSimpan(null);
                  setBukaModalForm(true);
                }}
                onUbahStatus={tanganiUbahStatus}
              />
            ))}
          </div>
        )}

        {/* Lembar Bawah untuk Form Tambah / Ubah Buah */}
        <LembarBawah
          isOpen={bukaModalForm}
          onClose={() => setBukaModalForm(false)}
          title={buahDiedit ? `Ubah Data — ${buahDiedit.namaBuah}` : 'Tambah Buah Baru'}
        >
          <FormBuah
            buahDiedit={buahDiedit}
            daftarKategori={daftarKategori}
            daftarSatuan={daftarSatuan}
            onSubmit={tanganiSimpanBuah}
            onBatal={() => setBukaModalForm(false)}
            sedangMemuat={memprosesSimpan}
            pesanError={errorSimpan}
          />
        </LembarBawah>
      </div>
    </KerangkaHalaman>
  );
}
