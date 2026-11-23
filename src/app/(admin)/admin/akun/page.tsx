// [AI] prompt: Halaman /admin/akun untuk Super Admin yang merakit KerangkaHalaman dan komponen SeksiKelolaAkunKasir
import React from 'react';
import type { Metadata } from 'next';
import { KerangkaHalaman } from '@/components/layout/PageLayout';
import { SeksiKelolaAkunKasir } from '@/modules/akun/components/SeksiKelolaAkunKasir';

export const metadata: Metadata = {
  title: 'Kelola Akun Kasir — Super Admin MyKiosBuah',
  description: 'Halaman kelola akun kasir kios buah untuk Super Admin',
};

// [AI] prompt: Halaman admin akun dengan header Super Admin dan menu peran admin aktif
export default function HalamanAdminAkun() {
  return (
    <KerangkaHalaman
      title="Super Admin"
      peran="admin"
      chipKiri={{ baris1: 'KIOS', baris2: 'Pasuruan' }}
      chipKanan={{ baris1: 'STATUS', baris2: 'Buka' }}
    >
      <SeksiKelolaAkunKasir />
    </KerangkaHalaman>
  );
}
