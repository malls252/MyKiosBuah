// [AI] prompt: Komponen FormLogin dengan field email, password (toggle intip), validasi, panel error server, dan pengalihan ke beranda peran
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KartuPanel } from '@/components/ui/CardPanel';
import { Tombol } from '@/components/ui/Button';
import styles from './FormLogin.module.css';

// [AI] prompt: FormLogin interaktif untuk otentikasi pengguna dan penanganan status error/loading
export const FormLogin: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pesanSuksesRegistrasi = searchParams.get('sukses') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lihatPassword, setLihatPassword] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);

    if (!email.trim() || !password) {
      setPesanError('Email dan password wajib diisi');
      return;
    }

    setSedangMemuat(true);

    try {
      const respons = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const hasil = await respons.json();

      if (!respons.ok) {
        setPesanError(hasil.error?.pesan || 'Terjadi kesalahan saat masuk');
        setSedangMemuat(false);
        return;
      }

      const peran = hasil.data?.peran;
      if (peran === 'Super Admin') {
        router.push('/admin');
      } else if (peran === 'Kasir') {
        router.push('/kasir');
      } else {
        router.push('/katalog');
      }
    } catch {
      setPesanError('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
      setSedangMemuat(false);
    }
  };

  return (
    <KartuPanel variant="putih" padding="lg">
      <form onSubmit={tanganiSubmit} className={styles.form} noValidate>
        {pesanSuksesRegistrasi && (
          <div className={styles.panelSukses} role="status">
            Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.
          </div>
        )}

        <div className={styles.kelompokInput}>
          <label htmlFor="login-email" className={styles.label}>
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="login-password"
              type={lihatPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={sedangMemuat}
              autoComplete="current-password"
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

        {pesanError && (
          <div className={styles.panelError} role="alert">
            {pesanError}
          </div>
        )}

        <Tombol
          type="submit"
          variant="utama"
          title={sedangMemuat ? 'Memproses...' : 'Masuk'}
          fullWidth
          loading={sedangMemuat}
          disabled={sedangMemuat}
        />

        <div className={styles.footerForm}>
          <Link href="/registrasi" className={styles.tautan}>
            Belum punya akun? Daftar
          </Link>
        </div>
      </form>
    </KartuPanel>
  );
};
