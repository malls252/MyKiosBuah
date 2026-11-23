// [AI] prompt: Halaman /login merakit FormLogin dengan tata letak wireframe: judul MyKiosBuah, subjudul kios, tanpa header chip dan navigasi bawah
import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { FormLogin } from '@/modules/akun/components/FormLogin';
import styles from '../auth.module.css';

export const metadata: Metadata = {
  title: 'Masuk — MyKiosBuah',
  description: 'Halaman masuk sistem kasir dan persediaan MyKiosBuah',
};

// [AI] prompt: Komponen halaman login yang memusatkan wadah 480px di latar abu-abu terang
export default function HalamanLogin() {
  return (
    <main className={styles.wadahHalaman}>
      <div className={styles.konten}>
        <header className={styles.headerHalaman}>
          <h1 className={styles.judul}>MyKiosBuah</h1>
          <p className={styles.subjudul}>Kios buah Bapak Ali Mansur</p>
        </header>

        <Suspense fallback={<div>Memuat formulir...</div>}>
          <FormLogin />
        </Suspense>
      </div>
    </main>
  );
}
