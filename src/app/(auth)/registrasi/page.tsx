// [AI] prompt: Halaman /registrasi merakit FormRegistrasi dengan tata letak visual selaras: judul MyKiosBuah dan subjudul kios
import React from 'react';
import type { Metadata } from 'next';
import { FormRegistrasi } from '@/modules/akun/components/FormRegistrasi';
import styles from '../auth.module.css';

export const metadata: Metadata = {
  title: 'Daftar Akun — MyKiosBuah',
  description: 'Daftar akun Pembeli baru di MyKiosBuah',
};

// [AI] prompt: Komponen halaman registrasi khusus pembeli dalam tata letak kartu tengah 480px
export default function HalamanRegistrasi() {
  return (
    <main className={styles.wadahHalaman}>
      <div className={styles.konten}>
        <header className={styles.headerHalaman}>
          <h1 className={styles.judul}>MyKiosBuah</h1>
          <p className={styles.subjudul}>Kios buah Bapak Ali Mansur</p>
        </header>

        <FormRegistrasi />
      </div>
    </main>
  );
}
