// [AI] prompt: Import pustaka bcryptjs, next/headers, decodeJwt jose, verifikasiToken jwt, dan kelas error autentikasi
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { verifikasiToken, type PayloadSesi } from './jwt';
import { ErrorTidakLogin, ErrorDilarang } from './errors';

// [AI] prompt: Konstanta nama cookie sesi yang disimpan di browser
export const NAMA_COOKIE_SESI = 'sesi_kios';

// [AI] prompt: Fungsi hashPassword(teks) dan cocokkanPassword(teks, hash) memakai bcryptjs dengan cost 10
export async function hashPassword(teks: string): Promise<string> {
  return bcrypt.hash(teks, 10);
}

export async function cocokkanPassword(teks: string, hash: string): Promise<boolean> {
  return bcrypt.compare(teks, hash);
}

// [AI] prompt: Fungsi setCookieSesi(token) dan hapusCookieSesi() untuk mengelola cookie sesi httpOnly, sameSite lax, path /, secure di production
export async function setCookieSesi(token: string): Promise<void> {
  const cookieStore = await cookies();
  const payload = decodeJwt(token);
  const waktuSekarang = Math.floor(Date.now() / 1000);
  const maxAge = payload.exp ? Math.max(0, payload.exp - waktuSekarang) : 8 * 3600;

  cookieStore.set(NAMA_COOKIE_SESI, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  });
}

export async function hapusCookieSesi(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NAMA_COOKIE_SESI);
}

// [AI] prompt: Fungsi getSesi() untuk membaca cookie sesi, verifikasi token, dan mengembalikan PayloadSesi atau null
export async function getSesi(): Promise<PayloadSesi | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NAMA_COOKIE_SESI)?.value;

  if (!token) {
    return null;
  }

  return verifikasiToken(token);
}

// [AI] prompt: Fungsi wajibPeran(daftarPeran) untuk memastikan sesi ada (ErrorTidakLogin) dan memiliki hak akses yang sesuai (ErrorDilarang)
export async function wajibPeran(
  daftarPeran: Array<PayloadSesi['peran']>
): Promise<PayloadSesi> {
  const sesi = await getSesi();

  if (!sesi) {
    throw new ErrorTidakLogin();
  }

  if (!daftarPeran.includes(sesi.peran)) {
    throw new ErrorDilarang();
  }

  return sesi;
}
