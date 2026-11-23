// [AI] prompt: Definisi tipe PayloadSesi untuk data pengguna di dalam token JWT
import { SignJWT, jwtVerify } from 'jose';

export type PayloadSesi = {
  idPengguna: number;
  nama: string;
  peran: 'Super Admin' | 'Kasir' | 'Pembeli';
};

// [AI] prompt: Dapatkan kunci HMAC-SHA256 dari JWT_SECRET dengan validasi minimal 32 karakter saat dipakai
function dapatkanKunciRahasia(): Uint8Array {
  const rahasia = process.env.JWT_SECRET;
  if (!rahasia || rahasia.length < 32) {
    throw new Error('JWT_SECRET harus diatur dan minimal sepanjang 32 karakter.');
  }
  return new TextEncoder().encode(rahasia);
}

// [AI] prompt: Fungsi buatToken(payload) menandatangani token HS256 dengan masa berlaku dari JWT_EXPIRES_IN (default 8h)
export async function buatToken(payload: PayloadSesi): Promise<string> {
  const kunci = dapatkanKunciRahasia();
  const masaBerlaku = process.env.JWT_EXPIRES_IN || '8h';

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(masaBerlaku)
    .sign(kunci);
}

// [AI] prompt: Fungsi verifikasiToken(token) memvalidasi token JWT dan mengembalikan PayloadSesi atau null jika salah/kedaluwarsa/berubah tanpa lempar error
export async function verifikasiToken(token: string): Promise<PayloadSesi | null> {
  try {
    const kunci = dapatkanKunciRahasia();
    const { payload } = await jwtVerify(token, kunci, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload.idPengguna !== 'number' ||
      typeof payload.nama !== 'string' ||
      !['Super Admin', 'Kasir', 'Pembeli'].includes(payload.peran as string)
    ) {
      return null;
    }

    return {
      idPengguna: payload.idPengguna,
      nama: payload.nama,
      peran: payload.peran as PayloadSesi['peran'],
    };
  } catch {
    return null;
  }
}
