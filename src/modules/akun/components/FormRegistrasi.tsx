// [AI] prompt: Komponen FormRegistrasi untuk pendaftaran akun Pembeli dengan validasi browser dan pengalihan ke /login?sukses=1
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KartuPanel } from '@/components/ui/CardPanel';
import { Tombol } from '@/components/ui/Button';
import styles from './FormRegistrasi.module.css';

// [AI] prompt: Form registrasi interaktif khusus Pembeli dengan validasi kecocokan password dan pesan respons server
export const FormRegistrasi: React.FC = () => {
  const router = useRouter();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [lihatPassword, setLihatPassword] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);

    // Validasi ringan browser
    if (!nama.trim() || !email.trim() || !password) {
      setPesanError('Nama, email, dan password wajib diisi');
      return;
    }

    if (password !== konfirmasiPassword) {
      setPesanError('Konfirmasi password tidak cocok dengan password');
      return;
    }

    setSedangMemuat(true);

    try {
      const respons = await fetch('/api/auth/registrasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim(),
          noTelepon: noTelepon.trim() || undefined,
          alamat: alamat.trim() || undefined,
          password,
        }),
      });

      const hasil = await respons.json();

      if (!respons.ok) {
        setPesanError(hasil.error?.pesan || 'Gagal melakukan pendaftaran');
        setSedangMemuat(false);
        return;
      }

      // Berhasil: arahkan ke /login dengan parameter sukses
      router.push('/login?sukses=1');
    } catch {
      setPesanError('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
      setSedangMemuat(false);
    }
  };

  return (
    <KartuPanel variant="putih" padding="lg">
      <form onSubmit={tanganiSubmit} className={styles.form} noValidate>
        <div className={styles.kelompokInput}>
          <label htmlFor="reg-nama" className={styles.label}>
            Nama Lengkap
          </label>
          <input
            id="reg-nama"
            type="text"
            className={styles.input}
            placeholder="Masukkan nama lengkap Anda"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={sedangMemuat}
            autoComplete="name"
            required
          />
        </div>

        <div className={styles.kelompokInput}>
          <label htmlFor="reg-email" className={styles.label}>
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            className={styles.input}
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sedangMemuat}
            autoComplete="email"
            required
          />
        </div>

        <div className={styles.kelompokInput}>
          <label htmlFor="reg-telepon" className={styles.label}>
            Nomor Telepon <span className={styles.opsional}>(opsional)</span>
          </label>
          <input
            id="reg-telepon"
            type="tel"
            className={styles.input}
            placeholder="Contoh: 08123456789"
            value={noTelepon}
            onChange={(e) => setNoTelepon(e.target.value)}
            disabled={sedangMemuat}
            autoComplete="tel"
          />
        </div>

        <div className={styles.kelompokInput}>
          <label htmlFor="reg-alamat" className={styles.label}>
            Alamat Pengiriman <span className={styles.opsional}>(opsional)</span>
          </label>
          <input
            id="reg-alamat"
            type="text"
            className={styles.input}
            placeholder="Alamat lengkap rumah atau kantor"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            disabled={sedangMemuat}
            autoComplete="street-address"
          />
        </div>

        <div className={styles.kelompokInput}>
          <label htmlFor="reg-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="reg-password"
              type={lihatPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Minimal 8 karakter (huruf & angka)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={sedangMemuat}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className={styles.tombolLihat}
              onClick={() => setLihatPassword((prev) => !prev)}
              aria-label={lihatPassword ? 'Sembunyikan password' : 'Lihat password'}
              tabIndex={-1}
            >
              {lihatPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.kelompokInput}>
          <label htmlFor="reg-konfirmasi" className={styles.label}>
            Konfirmasi Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="reg-konfirmasi"
              type={lihatPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Ulangi password Anda"
              value={konfirmasiPassword}
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              disabled={sedangMemuat}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {pesanError && (
          <div className={styles.panelError} role="alert">
            {pesanError}
          </div>
        )}

        <Tombol
          type="submit"
          variant="utama"
          title={sedangMemuat ? 'Memproses...' : 'Daftar Sekarang'}
          fullWidth
          loading={sedangMemuat}
          disabled={sedangMemuat}
        />

        <div className={styles.footerForm}>
          <Link href="/login" className={styles.tautan}>
            Sudah punya akun? Masuk
          </Link>
        </div>
      </form>
    </KartuPanel>
  );
};
