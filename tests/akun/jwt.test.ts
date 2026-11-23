// [AI] prompt: Pengujian unit Vitest untuk jwt.ts: pembuatan dan verifikasi token, tamper resistance, penanganan kedaluwarsa, dan ketidakcocokan secret
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignJWT } from 'jose';
import { buatToken, verifikasiToken, type PayloadSesi } from '@/lib/jwt';

const SECRET_TES = 'kunci_rahasia_jwt_minimal_32_karakter_contoh_tes';

describe('Modul JWT (jwt.ts)', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', SECRET_TES);
    vi.stubEnv('JWT_EXPIRES_IN', '8h');
  });

  // [AI] prompt: Tes token valid terbaca lagi dengan payload yang sama
  it('harus dapat membaca kembali token yang valid dengan payload yang identik', async () => {
    const payloadAsli: PayloadSesi = {
      idPengguna: 101,
      nama: 'Budi Santoso',
      peran: 'Kasir',
    };

    const token = await buatToken(payloadAsli);
    const hasilVerifikasi = await verifikasiToken(token);

    expect(hasilVerifikasi).not.toBeNull();
    expect(hasilVerifikasi).toEqual(payloadAsli);
  });

  // [AI] prompt: Tes token yang dimodifikasi satu karakter menghasilkan null
  it('harus menghasilkan null jika token diubah satu karakter', async () => {
    const payload: PayloadSesi = {
      idPengguna: 102,
      nama: 'Siti Aminah',
      peran: 'Pembeli',
    };

    const token = await buatToken(payload);
    // Ganti karakter terakhir token untuk mensimulasikan token palsu/dimanipulasi
    const tokenDimodifikasi =
      token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');

    const hasilVerifikasi = await verifikasiToken(tokenDimodifikasi);
    expect(hasilVerifikasi).toBeNull();
  });

  // [AI] prompt: Tes token kedaluwarsa menghasilkan null
  it('harus menghasilkan null jika token sudah kedaluwarsa', async () => {
    const kunci = new TextEncoder().encode(SECRET_TES);
    const tokenKedaluwarsa = await new SignJWT({
      idPengguna: 103,
      nama: 'Kasir Kedaluwarsa',
      peran: 'Kasir',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10) // Kedaluwarsa 10 detik lalu
      .sign(kunci);

    const hasilVerifikasi = await verifikasiToken(tokenKedaluwarsa);
    expect(hasilVerifikasi).toBeNull();
  });

  // [AI] prompt: Tes token dengan secret berbeda menghasilkan null
  it('harus menghasilkan null jika token ditandatangani dengan secret berbeda', async () => {
    const kunciLain = new TextEncoder().encode('kunci_rahasia_lain_yang_berbeda_dan_panjang_32');
    const tokenSecretLain = await new SignJWT({
      idPengguna: 104,
      nama: 'Penyusup',
      peran: 'Super Admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(kunciLain);

    const hasilVerifikasi = await verifikasiToken(tokenSecretLain);
    expect(hasilVerifikasi).toBeNull();
  });
});
