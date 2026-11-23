// [AI] prompt: Halaman /admin/kategori-satuan untuk mengelola data master kategori dan satuan buah dengan integrasi DaftarKategoriSatuan
'use client';

import React from 'react';
import Link from 'next/link';
import { KerangkaHalaman } from '@/components/layout/PageLayout';
import { Tombol } from '@/components/ui/Button';
import { DaftarKategoriSatuan } from '@/modules/master/components/DaftarKategoriSatuan';

// [AI] prompt: Komponen halaman kelola kategori dan satuan buah Super Admin
export default function HalamanAdminKategoriSatuan() {
  return (
    <KerangkaHalaman
      title="Super Admin"
      peran="admin"
      chipKiri={{ baris1: 'KIOS', baris2: 'Pasuruan' }}
      chipKanan={{ baris1: 'STATUS', baris2: 'Buka' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '8px' }}>
          <Link href="/admin/buah">
            <Tombol
              variant="sekunder"
              title="Kembali ke Data Buah"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              }
            />
          </Link>
        </div>

        <DaftarKategoriSatuan />
      </div>
    </KerangkaHalaman>
  );
}
