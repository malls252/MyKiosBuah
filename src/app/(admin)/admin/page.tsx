// [AI] prompt: Halaman sementara /admin supaya login tidak 404; merakit PanelInfo sesi dan SeksiKelolaAkunKasir. Konten ringkasan penjualan dan pesanan online akan digantikan pada Tugas 8.
import React from 'react';
import type { Metadata } from 'next';
import { getSesi } from '@/lib/auth';
import { KerangkaHalaman } from '@/components/layout/PageLayout';
import { PanelInfo } from '@/components/ui/InfoPanel';
import { SeksiKelolaAkunKasir } from '@/modules/akun/components/SeksiKelolaAkunKasir';

export const metadata: Metadata = {
  title: 'Beranda Super Admin — MyKiosBuah',
  description: 'Beranda utama Super Admin pemilik kios buah',
};

export const instant = false;

// [AI] prompt: Render halaman beranda Super Admin dengan sapaan sesi dan integrasi SeksiKelolaAkunKasir
export default async function HalamanBerandaAdmin() {
  const sesi = await getSesi();

  return (
    <KerangkaHalaman
      title="Super Admin"
      peran="admin"
      namaPengguna={sesi?.nama || 'Super Admin'}
      chipKiri={{ baris1: 'KIOS', baris2: 'Pasuruan' }}
      chipKanan={{ baris1: 'STATUS', baris2: 'Buka' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <PanelInfo
          variant="hijau"
          title={`Selamat Datang, ${sesi?.nama || 'Pemilik Kios'}!`}
          description={`Anda masuk sebagai ${sesi?.peran || 'Super Admin'}. Pantau dan kelola seluruh aktivitas kios buah Anda di sini.`}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        {/* Seksi Kelola Akun Kasir */}
        <SeksiKelolaAkunKasir />

        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary, #737b73)', fontSize: '13px', paddingBottom: '24px' }}>
          <em>* Ringkasan penjualan dan pesanan online menyusul pada modul berikutnya.</em>
        </div>
      </div>
    </KerangkaHalaman>
  );
}
