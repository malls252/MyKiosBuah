// [AI] prompt: Komponen SeksiKelolaAkunKasir untuk antarmuka manajemen akun kasir (tambah kasir, atur ulang data, nonaktifkan, aktifkan kembali)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { JudulSeksi } from '@/components/ui/SectionHeader';
import { PanelInfo } from '@/components/ui/InfoPanel';
import { KartuPanel } from '@/components/ui/CardPanel';
import { Pill } from '@/components/ui/Pill';
import { Tombol } from '@/components/ui/Button';
import { LembarBawah } from '@/components/ui/BottomSheet';
import type { Pengguna } from '../types';
import styles from './SeksiKelolaAkunKasir.module.css';

// [AI] prompt: Komponen utama SeksiKelolaAkunKasir dengan integrasi endpoint /api/akun dan /api/akun/[id]
export const SeksiKelolaAkunKasir: React.FC = () => {
  const [daftarKasir, setDaftarKasir] = useState<Pengguna[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // State Modal Tambah Kasir
  const [bukaModalTambah, setBukaModalTambah] = useState(false);
  const [formTambah, setFormTambah] = useState({
    nama: '',
    email: '',
    noTelepon: '',
    password: '',
  });
  const [errorTambah, setErrorTambah] = useState<string | null>(null);
  const [memprosesTambah, setMemprosesTambah] = useState(false);

  // State Modal Edit / Atur Ulang Kasir
  const [kasirDiedit, setKasirDiedit] = useState<Pengguna | null>(null);
  const [formEdit, setFormEdit] = useState({
    nama: '',
    noTelepon: '',
    passwordBaru: '',
  });
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [memprosesEdit, setMemprosesEdit] = useState(false);

  // State Modal Konfirmasi Nonaktifkan
  const [kasirDinonaktifkan, setKasirDinonaktifkan] = useState<Pengguna | null>(null);
  const [memprosesStatus, setMemprosesStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const muatDaftarKasir = useCallback(async () => {
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const res = await fetch('/api/akun');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.pesan || 'Gagal memuat daftar kasir');
      }
      setDaftarKasir(json.data || []);
    } catch (err: unknown) {
      setPesanError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat');
    } finally {
      setSedangMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatDaftarKasir();
  }, [muatDaftarKasir]);

  // Handler Submit Tambah Kasir
  const tanganiTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTambah(null);

    if (!formTambah.nama.trim() || !formTambah.email.trim() || !formTambah.password) {
      setErrorTambah('Nama, email, dan password wajib diisi');
      return;
    }

    setMemprosesTambah(true);
    try {
      const res = await fetch('/api/akun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formTambah.nama.trim(),
          email: formTambah.email.trim(),
          noTelepon: formTambah.noTelepon.trim() || undefined,
          password: formTambah.password,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorTambah(json.error?.pesan || 'Gagal membuat akun kasir');
        setMemprosesTambah(false);
        return;
      }

      setBukaModalTambah(false);
      setFormTambah({ nama: '', email: '', noTelepon: '', password: '' });
      await muatDaftarKasir();
    } catch {
      setErrorTambah('Gagal terhubung ke server');
    } finally {
      setMemprosesTambah(false);
    }
  };

  // Buka Modal Edit
  const bukaModalAturUlang = (kasir: Pengguna) => {
    setKasirDiedit(kasir);
    setFormEdit({
      nama: kasir.nama,
      noTelepon: kasir.noTelepon || '',
      passwordBaru: '',
    });
    setErrorEdit(null);
  };

  // Handler Submit Edit Kasir
  const tanganiEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kasirDiedit) return;
    setErrorEdit(null);

    setMemprosesEdit(true);
    try {
      const res = await fetch(`/api/akun/${kasirDiedit.idPengguna}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formEdit.nama.trim() || undefined,
          noTelepon: formEdit.noTelepon.trim() || undefined,
          passwordBaru: formEdit.passwordBaru || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorEdit(json.error?.pesan || 'Gagal memperbarui akun kasir');
        setMemprosesEdit(false);
        return;
      }

      setKasirDiedit(null);
      await muatDaftarKasir();
    } catch {
      setErrorEdit('Gagal terhubung ke server');
    } finally {
      setMemprosesEdit(false);
    }
  };

  // Handler Ubah Status Aktif (Aktifkan / Nonaktifkan)
  const tanganiUbahStatus = async (idPengguna: number, aktif: boolean) => {
    setMemprosesStatus(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`/api/akun/${idPengguna}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktif }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorStatus(json.error?.pesan || 'Gagal mengubah status akun');
        setMemprosesStatus(false);
        return;
      }

      setKasirDinonaktifkan(null);
      await muatDaftarKasir();
    } catch {
      setErrorStatus('Gagal terhubung ke server');
    } finally {
      setMemprosesStatus(false);
    }
  };

  const totalAkun = daftarKasir.length;
  const totalAktif = daftarKasir.filter((k) => k.aktif).length;

  return (
    <section className={styles.seksi}>
      {/* 1. Judul Seksi dengan Tombol Tambah Akun */}
      <JudulSeksi
        title="Kelola Akun Kasir"
        subtitle={`${totalAkun} akun - ${totalAktif} aktif`}
        action={
          <Tombol
            variant="utama"
            title="Tambah akun"
            subtitle="Kasir baru"
            onClick={() => {
              setErrorTambah(null);
              setBukaModalTambah(true);
            }}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            }
          />
        }
      />

      {/* 2. Panel Info Abu-Abu Berikon Perisai */}
      <PanelInfo
        variant="cream"
        title="Hak akses Kasir"
        description="Kasir hanya bisa membuka halaman kasir dan riwayat transaksinya; tidak bisa melihat laporan, stok, atau data master; akun tidak dihapus tetapi dinonaktifkan supaya riwayat transaksi tetap utuh; password disimpan terenkripsi dan tidak bisa dilihat siapa pun, hanya bisa diatur ulang."
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
      />

      {/* 3. Daftar Kartu Akun Kasir */}
      {sedangMemuat ? (
        <KartuPanel variant="abu" padding="md">
          <div className={styles.keadaanKosong}>Memuat daftar akun kasir...</div>
        </KartuPanel>
      ) : pesanError ? (
        <KartuPanel variant="abu" padding="md">
          <div className={styles.keadaanError}>
            <span>{pesanError}</span>
            <Tombol variant="sekunder" title="Coba lagi" onClick={muatDaftarKasir} />
          </div>
        </KartuPanel>
      ) : daftarKasir.length === 0 ? (
        <KartuPanel variant="abu" padding="md">
          <div className={styles.keadaanKosong}>Belum ada akun kasir</div>
        </KartuPanel>
      ) : (
        <div className={styles.daftarKartu}>
          {daftarKasir.map((kasir) => (
            <KartuPanel key={kasir.idPengguna} variant={kasir.aktif ? 'putih' : 'abu'} padding="md">
              <div className={styles.kartuAkun}>
                {/* Badge Kasir di Pojok Kanan Atas */}
                <div className={styles.badgePeran}>
                  <Pill variant="hitam">Kasir</Pill>
                </div>

                {/* Bagian Atas: Avatar & Teks Pengguna */}
                <div className={styles.barisAtas}>
                  <div className={styles.kotakIkon}>
                    {kasir.aktif ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="18" y1="8" x2="23" y2="13" />
                        <line x1="23" y1="8" x2="18" y2="13" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.teksAkun}>
                    <h3 className={styles.namaKasir}>{kasir.nama}</h3>
                    <p className={styles.emailKasir}>{kasir.email}</p>
                    <div className={styles.pillGrup}>
                      {kasir.aktif ? (
                        <Pill variant="hijau">Aktif</Pill>
                      ) : (
                        <>
                          <Pill variant="merah">Nonaktif</Pill>
                          <Pill variant="netral">Tidak bisa login</Pill>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bagian Tengah: Baris Identitas / Keterangan */}
                {kasir.aktif ? (
                  <div className={styles.barisIdentitas}>
                    <span className={styles.teleponGroup}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {kasir.noTelepon || 'Tanpa telepon'}
                    </span>
                    <span className={styles.idKasir}>ID #{kasir.idPengguna}</span>
                  </div>
                ) : (
                  <div className={styles.barisIdentitas}>
                    <span className={styles.teleponGroup}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Riwayat transaksi tetap tersimpan
                    </span>
                    <span className={styles.idKasir}>ID #{kasir.idPengguna}</span>
                  </div>
                )}

                {/* Bagian Bawah: Tombol Aksi */}
                {kasir.aktif ? (
                  <div className={styles.barisAksi}>
                    <Tombol
                      variant="sekunder"
                      title="Atur ulang"
                      className={styles.tombolAksi}
                      onClick={() => bukaModalAturUlang(kasir)}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                      }
                    />
                    <Tombol
                      variant="bahaya"
                      title="Nonaktifkan"
                      className={styles.tombolAksi}
                      onClick={() => {
                        setErrorStatus(null);
                        setKasirDinonaktifkan(kasir);
                      }}
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
                    onClick={() => tanganiUbahStatus(kasir.idPengguna, true)}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    }
                  />
                )}
              </div>
            </KartuPanel>
          ))}
        </div>
      )}

      {/* Lembar Bawah: Tambah Akun Kasir */}
      <LembarBawah
        isOpen={bukaModalTambah}
        onClose={() => setBukaModalTambah(false)}
        title="Tambah Akun Kasir Baru"
      >
        <form onSubmit={tanganiTambah} className={styles.formModal} noValidate>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Nama Lengkap Kasir</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Contoh: Budi Santoso"
              value={formTambah.nama}
              onChange={(e) => setFormTambah({ ...formTambah, nama: e.target.value })}
              required
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Email Kasir (untuk login)</label>
            <input
              type="email"
              className={styles.input}
              placeholder="kasir@mykiosbuah.com"
              value={formTambah.email}
              onChange={(e) => setFormTambah({ ...formTambah, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>
              Nomor Telepon <span className={styles.opsional}>(opsional)</span>
            </label>
            <input
              type="tel"
              className={styles.input}
              placeholder="08123456789"
              value={formTambah.noTelepon}
              onChange={(e) => setFormTambah({ ...formTambah, noTelepon: e.target.value })}
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Password Awal</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Minimal 8 karakter (huruf & angka)"
              value={formTambah.password}
              onChange={(e) => setFormTambah({ ...formTambah, password: e.target.value })}
              required
            />
          </div>

          {errorTambah && <div className={styles.panelErrorModal}>{errorTambah}</div>}

          <div className={styles.tombolGrupModal}>
            <Tombol
              type="button"
              variant="sekunder"
              title="Batal"
              onClick={() => setBukaModalTambah(false)}
            />
            <Tombol
              type="submit"
              variant="utama"
              title={memprosesTambah ? 'Menyimpan...' : 'Simpan Akun'}
              loading={memprosesTambah}
              disabled={memprosesTambah}
            />
          </div>
        </form>
      </LembarBawah>

      {/* Lembar Bawah: Atur Ulang Data / Password Kasir */}
      <LembarBawah
        isOpen={Boolean(kasirDiedit)}
        onClose={() => setKasirDiedit(null)}
        title={`Atur Ulang Akun — ${kasirDiedit?.nama || ''}`}
      >
        <form onSubmit={tanganiEdit} className={styles.formModal} noValidate>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>Nama Lengkap</label>
            <input
              type="text"
              className={styles.input}
              value={formEdit.nama}
              onChange={(e) => setFormEdit({ ...formEdit, nama: e.target.value })}
              required
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>
              Nomor Telepon <span className={styles.opsional}>(opsional)</span>
            </label>
            <input
              type="tel"
              className={styles.input}
              value={formEdit.noTelepon}
              onChange={(e) => setFormEdit({ ...formEdit, noTelepon: e.target.value })}
            />
          </div>
          <div className={styles.kelompokInput}>
            <label className={styles.label}>
              Password Baru <span className={styles.opsional}>(kosongkan jika tidak diubah)</span>
            </label>
            <input
              type="password"
              className={styles.input}
              placeholder="Minimal 8 karakter kombinasi"
              value={formEdit.passwordBaru}
              onChange={(e) => setFormEdit({ ...formEdit, passwordBaru: e.target.value })}
            />
          </div>

          {errorEdit && <div className={styles.panelErrorModal}>{errorEdit}</div>}

          <div className={styles.tombolGrupModal}>
            <Tombol
              type="button"
              variant="sekunder"
              title="Batal"
              onClick={() => setKasirDiedit(null)}
            />
            <Tombol
              type="submit"
              variant="utama"
              title={memprosesEdit ? 'Memperbarui...' : 'Perbarui Akun'}
              loading={memprosesEdit}
              disabled={memprosesEdit}
            />
          </div>
        </form>
      </LembarBawah>

      {/* Lembar Bawah: Konfirmasi Nonaktifkan Kasir */}
      <LembarBawah
        isOpen={Boolean(kasirDinonaktifkan)}
        onClose={() => setKasirDinonaktifkan(null)}
        title="Nonaktifkan Akun Kasir?"
      >
        <div className={styles.formModal}>
          <p className={styles.teksKonfirmasi}>
            Apakah Anda yakin ingin menonaktifkan akun <strong>{kasirDinonaktifkan?.nama}</strong>?
            Akun yang dinonaktifkan tidak akan bisa masuk lagi ke sistem kasir, namun seluruh riwayat transaksinya tetap tersimpan utuh di basis data.
          </p>

          {errorStatus && <div className={styles.panelErrorModal}>{errorStatus}</div>}

          <div className={styles.tombolGrupModal}>
            <Tombol
              type="button"
              variant="sekunder"
              title="Batal"
              onClick={() => setKasirDinonaktifkan(null)}
            />
            <Tombol
              type="button"
              variant="bahaya"
              title={memprosesStatus ? 'Memproses...' : 'Ya, Nonaktifkan'}
              loading={memprosesStatus}
              disabled={memprosesStatus}
              onClick={() => {
                if (kasirDinonaktifkan) {
                  tanganiUbahStatus(kasirDinonaktifkan.idPengguna, false);
                }
              }}
            />
          </div>
        </div>
      </LembarBawah>
    </section>
  );
};
