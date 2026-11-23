// [AI] prompt: Komponen DaftarKategoriSatuan dengan TabFilter Kategori & Satuan, penambahan/pengubahan data, serta modal konfirmasi hapus dengan penanganan 409
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TabFilter } from '@/components/ui/TabFilter';
import { JudulSeksi } from '@/components/ui/SectionHeader';
import { KartuPanel } from '@/components/ui/CardPanel';
import { Tombol } from '@/components/ui/Button';
import { LembarBawah } from '@/components/ui/BottomSheet';
import type { Kategori, Satuan } from '../types';
import styles from './DaftarKategoriSatuan.module.css';

// [AI] prompt: Komponen manajemen kategori dan satuan dengan validasi server dan feedback lembar bawah
export const DaftarKategoriSatuan: React.FC = () => {
  const [tabAktif, setTabAktif] = useState<'kategori' | 'satuan'>('kategori');

  // State Data
  const [daftarKategori, setDaftarKategori] = useState<Kategori[]>([]);
  const [daftarSatuan, setDaftarSatuan] = useState<Satuan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Modal Form Kategori
  const [bukaModalKategori, setBukaModalKategori] = useState(false);
  const [kategoriDiedit, setKategoriDiedit] = useState<Kategori | null>(null);
  const [formKategori, setFormKategori] = useState({ namaKategori: '', deskripsi: '' });
  const [errorKategori, setErrorKategori] = useState<string | null>(null);
  const [memprosesKategori, setMemprosesKategori] = useState(false);

  // Modal Form Satuan
  const [bukaModalSatuan, setBukaModalSatuan] = useState(false);
  const [satuanDiedit, setSatuanDiedit] = useState<Satuan | null>(null);
  const [formSatuan, setFormSatuan] = useState({ namaSatuan: '', simbol: '' });
  const [errorSatuan, setErrorSatuan] = useState<string | null>(null);
  const [memprosesSatuan, setMemprosesSatuan] = useState(false);

  // Modal Konfirmasi Hapus
  const [itemDihapus, setItemDihapus] = useState<{
    tipe: 'kategori' | 'satuan';
    id: number;
    nama: string;
  } | null>(null);
  const [errorHapus, setErrorHapus] = useState<string | null>(null);
  const [memprosesHapus, setMemprosesHapus] = useState(false);

  const muatData = useCallback(async () => {
    setSedangMemuat(true);
    try {
      const [resKategori, resSatuan] = await Promise.all([
        fetch('/api/kategori'),
        fetch('/api/satuan'),
      ]);
      const jsonKategori = await resKategori.json();
      const jsonSatuan = await resSatuan.json();

      setDaftarKategori(jsonKategori.data || []);
      setDaftarSatuan(jsonSatuan.data || []);
    } catch {
      console.error('Gagal memuat kategori atau satuan');
    } finally {
      setSedangMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatData();
  }, [muatData]);

  // Handler Submit Kategori
  const tanganiSubmitKategori = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKategori(null);

    if (!formKategori.namaKategori.trim()) {
      setErrorKategori('Nama kategori wajib diisi');
      return;
    }

    setMemprosesKategori(true);
    try {
      const url = kategoriDiedit ? `/api/kategori/${kategoriDiedit.idKategori}` : '/api/kategori';
      const method = kategoriDiedit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaKategori: formKategori.namaKategori.trim(),
          deskripsi: formKategori.deskripsi.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorKategori(json.error?.pesan || 'Gagal menyimpan kategori');
        setMemprosesKategori(false);
        return;
      }

      setBukaModalKategori(false);
      setKategoriDiedit(null);
      setFormKategori({ namaKategori: '', deskripsi: '' });
      await muatData();
    } catch {
      setErrorKategori('Gagal terhubung ke server');
    } finally {
      setMemprosesKategori(false);
    }
  };

  // Handler Submit Satuan
  const tanganiSubmitSatuan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSatuan(null);

    if (!formSatuan.namaSatuan.trim() || !formSatuan.simbol.trim()) {
      setErrorSatuan('Nama dan simbol satuan wajib diisi');
      return;
    }

    setMemprosesSatuan(true);
    try {
      const url = satuanDiedit ? `/api/satuan/${satuanDiedit.idSatuan}` : '/api/satuan';
      const method = satuanDiedit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaSatuan: formSatuan.namaSatuan.trim(),
          simbol: formSatuan.simbol.trim(),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorSatuan(json.error?.pesan || 'Gagal menyimpan satuan');
        setMemprosesSatuan(false);
        return;
      }

      setBukaModalSatuan(false);
      setSatuanDiedit(null);
      setFormSatuan({ namaSatuan: '', simbol: '' });
      await muatData();
    } catch {
      setErrorSatuan('Gagal terhubung ke server');
    } finally {
      setMemprosesSatuan(false);
    }
  };

  // Handler Hapus Item
  const tanganiHapus = async () => {
    if (!itemDihapus) return;
    setErrorHapus(null);
    setMemprosesHapus(true);

    try {
      const endpoint = itemDihapus.tipe === 'kategori' ? `/api/kategori/${itemDihapus.id}` : `/api/satuan/${itemDihapus.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const json = await res.json();

      if (!res.ok) {
        // Tampilkan error 409 atau error lainnya langsung di dalam modal konfirmasi
        setErrorHapus(json.error?.pesan || 'Gagal menghapus data');
        setMemprosesHapus(false);
        return;
      }

      setItemDihapus(null);
      await muatData();
    } catch {
      setErrorHapus('Gagal terhubung ke server');
    } finally {
      setMemprosesHapus(false);
    }
  };

  return (
    <div className={styles.wadah}>
      {/* Tab Filter Antara Kategori dan Satuan */}
      <TabFilter
        tabs={[
          { id: 'kategori', label: 'Kategori', count: daftarKategori.length },
          { id: 'satuan', label: 'Satuan', count: daftarSatuan.length },
        ]}
        activeTab={tabAktif}
        onChange={(id) => setTabAktif(id as 'kategori' | 'satuan')}
      />

      {tabAktif === 'kategori' ? (
        <>
          <JudulSeksi
            title="Data Kategori"
            subtitle={`${daftarKategori.length} kategori terdaftar`}
            action={
              <Tombol
                variant="utama"
                title="Tambah Kategori"
                onClick={() => {
                  setKategoriDiedit(null);
                  setFormKategori({ namaKategori: '', deskripsi: '' });
                  setErrorKategori(null);
                  setBukaModalKategori(true);
                }}
              />
            }
          />

          {sedangMemuat ? (
            <KartuPanel variant="abu" padding="md">
              <div className={styles.keadaanKosong}>Memuat kategori...</div>
            </KartuPanel>
          ) : daftarKategori.length === 0 ? (
            <KartuPanel variant="abu" padding="md">
              <div className={styles.keadaanKosong}>Belum ada kategori buah</div>
            </KartuPanel>
          ) : (
            <div className={styles.daftarKartu}>
              {daftarKategori.map((k) => (
                <KartuPanel key={k.idKategori} variant="putih" padding="md">
                  <div className={styles.kartuItem}>
                    <div className={styles.teksItem}>
                      <h4 className={styles.judulItem}>{k.namaKategori}</h4>
                      {k.deskripsi && <p className={styles.deskripsiItem}>{k.deskripsi}</p>}
                    </div>
                    <div className={styles.aksiGrup}>
                      <Tombol
                        variant="sekunder"
                        title="Ubah"
                        onClick={() => {
                          setKategoriDiedit(k);
                          setFormKategori({
                            namaKategori: k.namaKategori,
                            deskripsi: k.deskripsi || '',
                          });
                          setErrorKategori(null);
                          setBukaModalKategori(true);
                        }}
                      />
                      <Tombol
                        variant="bahaya"
                        title="Hapus"
                        onClick={() => {
                          setErrorHapus(null);
                          setItemDihapus({
                            tipe: 'kategori',
                            id: k.idKategori,
                            nama: k.namaKategori,
                          });
                        }}
                      />
                    </div>
                  </div>
                </KartuPanel>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <JudulSeksi
            title="Data Satuan"
            subtitle={`${daftarSatuan.length} satuan terdaftar`}
            action={
              <Tombol
                variant="utama"
                title="Tambah Satuan"
                onClick={() => {
                  setSatuanDiedit(null);
                  setFormSatuan({ namaSatuan: '', simbol: '' });
                  setErrorSatuan(null);
                  setBukaModalSatuan(true);
                }}
              />
            }
          />

          {sedangMemuat ? (
            <KartuPanel variant="abu" padding="md">
              <div className={styles.keadaanKosong}>Memuat satuan...</div>
            </KartuPanel>
          ) : daftarSatuan.length === 0 ? (
            <KartuPanel variant="abu" padding="md">
              <div className={styles.keadaanKosong}>Belum ada satuan buah</div>
            </KartuPanel>
          ) : (
            <div className={styles.daftarKartu}>
              {daftarSatuan.map((s) => (
                <KartuPanel key={s.idSatuan} variant="putih" padding="md">
                  <div className={styles.kartuItem}>
                    <div className={styles.teksItem}>
                      <h4 className={styles.judulItem}>{s.namaSatuan} ({s.simbol})</h4>
                      <p className={styles.deskripsiItem}>Simbol cetak: {s.simbol}</p>
                    </div>
                    <div className={styles.aksiGrup}>
                      <Tombol
                        variant="sekunder"
                        title="Ubah"
                        onClick={() => {
                          setSatuanDiedit(s);
                          setFormSatuan({
                            namaSatuan: s.namaSatuan,
                            simbol: s.simbol,
                          });
                          setErrorSatuan(null);
                          setBukaModalSatuan(true);
                        }}
                      />
                      <Tombol
                        variant="bahaya"
                        title="Hapus"
                        onClick={() => {
                          setErrorHapus(null);
                          setItemDihapus({
                            tipe: 'satuan',
                            id: s.idSatuan,
                            nama: `${s.namaSatuan} (${s.simbol})`,
                          });
                        }}
                      />
                    </div>
                  </div>
                </KartuPanel>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lembar Bawah Form Kategori */}
      <LembarBawah
        isOpen={bukaModalKategori}
        onClose={() => setBukaModalKategori(false)}
        title={kategoriDiedit ? 'Ubah Kategori Buah' : 'Tambah Kategori Baru'}
      >
        <form onSubmit={tanganiSubmitKategori} className={styles.formModal} noValidate>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Nama Kategori</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Contoh: Buah Lokal"
              value={formKategori.namaKategori}
              onChange={(e) => setFormKategori({ ...formKategori, namaKategori: e.target.value })}
              required
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Deskripsi (opsional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Deskripsi singkat kategori"
              value={formKategori.deskripsi}
              onChange={(e) => setFormKategori({ ...formKategori, deskripsi: e.target.value })}
            />
          </div>

          {errorKategori && <div className={styles.panelErrorModal}>{errorKategori}</div>}

          <div className={styles.tombolGrupModal}>
            <Tombol
              type="button"
              variant="sekunder"
              title="Batal"
              onClick={() => setBukaModalKategori(false)}
            />
            <Tombol
              type="submit"
              variant="utama"
              title={memprosesKategori ? 'Menyimpan...' : 'Simpan Kategori'}
              loading={memprosesKategori}
              disabled={memprosesKategori}
            />
          </div>
        </form>
      </LembarBawah>

      {/* Lembar Bawah Form Satuan */}
      <LembarBawah
        isOpen={bukaModalSatuan}
        onClose={() => setBukaModalSatuan(false)}
        title={satuanDiedit ? 'Ubah Satuan Buah' : 'Tambah Satuan Baru'}
      >
        <form onSubmit={tanganiSubmitSatuan} className={styles.formModal} noValidate>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Nama Satuan</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Contoh: Kilogram"
              value={formSatuan.namaSatuan}
              onChange={(e) => setFormSatuan({ ...formSatuan, namaSatuan: e.target.value })}
              required
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Simbol</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Contoh: kg"
              value={formSatuan.simbol}
              onChange={(e) => setFormSatuan({ ...formSatuan, simbol: e.target.value })}
              required
            />
          </div>

          {errorSatuan && <div className={styles.panelErrorModal}>{errorSatuan}</div>}

          <div className={styles.tombolGrupModal}>
            <Tombol
              type="button"
              variant="sekunder"
              title="Batal"
              onClick={() => setBukaModalSatuan(false)}
            />
            <Tombol
              type="submit"
              variant="utama"
              title={memprosesSatuan ? 'Menyimpan...' : 'Simpan Satuan'}
              loading={memprosesSatuan}
              disabled={memprosesSatuan}
            />
          </div>
        </form>
      </LembarBawah>

      {/* Lembar Bawah Konfirmasi Hapus (Menampilkan 409 jika terikat buah) */}
      <LembarBawah
        isOpen={Boolean(itemDihapus)}
        onClose={() => setItemDihapus(null)}
        title={`Hapus ${itemDihapus?.tipe === 'kategori' ? 'Kategori' : 'Satuan'}?`}
      >
        <div className={styles.formModal}>
          <p className={styles.teksKonfirmasi}>
            Apakah Anda yakin ingin menghapus <strong>{itemDihapus?.nama}</strong>?
          </p>

          {errorHapus && <div className={styles.panelErrorModal}>{errorHapus}</div>}

          <div className={styles.tombolGrupModal}>
            <Tombol
              type="button"
              variant="sekunder"
              title="Batal"
              onClick={() => setItemDihapus(null)}
            />
            <Tombol
              type="button"
              variant="bahaya"
              title={memprosesHapus ? 'Menghapus...' : 'Ya, Hapus'}
              loading={memprosesHapus}
              disabled={memprosesHapus}
              onClick={tanganiHapus}
            />
          </div>
        </div>
      </LembarBawah>
    </div>
  );
};
