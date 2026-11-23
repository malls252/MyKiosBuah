// [AI] prompt: Halaman sementara /katalog supaya login tidak 404; merakit PanelInfo sapaan dan kartu abu-abu. Konten katalog buah akan digantikan oleh modul Pesanan Online pada Tugas 8.
import React from 'react';
import type { Metadata } from 'next';
import { getSesi } from '@/lib/auth';
import { KerangkaHalaman } from '@/components/layout/PageLayout';
import { PanelInfo } from '@/components/ui/InfoPanel';
import { KartuPanel } from '@/components/ui/CardPanel';

export const metadata: Metadata = {
  title: 'Katalog Buah — MyKiosBuah',
  description: 'Katalog belanja buah segar MyKiosBuah untuk pembeli',
};

// [AI] prompt: Render halaman katalog sementara untuk Pembeli dengan sapaan nama pengguna dan kerangka layout pembeli
export default async function HalamanKatalogPembeli() {
  const sesi = await getSesi();

  return (
    <KerangkaHalaman
      title="Katalog Pembeli"
      peran="pembeli"
      namaPengguna={sesi?.nama || 'Pelanggan'}
      chipKiri={{ baris1: 'KIOS', baris2: 'Pasuruan' }}
      chipKanan={{ baris1: 'PESAN', baris2: 'Online' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <PanelInfo
          variant="cream"
          title={`Halo, ${sesi?.nama || 'Pelanggan Setia'}!`}
          description="Selamat datang di MyKiosBuah. Temukan pilihan buah segar langsung dari kios kami."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />

        <KartuPanel variant="abu" padding="lg">
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--color-text-secondary, #737b73)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Katalog buah segera hadir
          </div>
        </KartuPanel>
      </div>
    </KerangkaHalaman>
  );
}
