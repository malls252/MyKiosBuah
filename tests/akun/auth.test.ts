// [AI] prompt: Pengujian unit Vitest untuk auth.ts: keacakan salt bcrypt, pencocokan password yang benar/salah, dan perbandingan hash
import { describe, it, expect } from 'vitest';
import { hashPassword, cocokkanPassword } from '@/lib/auth';

describe('Modul Autentikasi Password (auth.ts)', () => {
  const passwordAsli = 'KiosBuah123!';

  // [AI] prompt: Tes hashPassword tidak sama dengan password asli dalam teks biasa
  it('harus menghasilkan hash yang tidak sama dengan password asli', async () => {
    const hash = await hashPassword(passwordAsli);

    expect(hash).not.toBe(passwordAsli);
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // Format standar hash bcrypt
  });

  // [AI] prompt: Tes cocokkanPassword benar untuk password benar dan salah untuk password salah
  it('harus mengembalikan true untuk password benar dan false untuk password salah', async () => {
    const hash = await hashPassword(passwordAsli);

    const cocok = await cocokkanPassword(passwordAsli, hash);
    const tidakCocok = await cocokkanPassword('PasswordSalah123!', hash);

    expect(cocok).toBe(true);
    expect(tidakCocok).toBe(false);
  });

  // [AI] prompt: Tes dua hash dari password yang sama menghasilkan string berbeda karena salt acak
  it('harus menghasilkan string hash berbeda untuk dua kali hashing password yang sama karena salt acak', async () => {
    const hashPertama = await hashPassword(passwordAsli);
    const hashKedua = await hashPassword(passwordAsli);

    expect(hashPertama).not.toBe(hashKedua);
    // Keduanya tetap valid saat dicocokkan
    expect(await cocokkanPassword(passwordAsli, hashPertama)).toBe(true);
    expect(await cocokkanPassword(passwordAsli, hashKedua)).toBe(true);
  });
});
