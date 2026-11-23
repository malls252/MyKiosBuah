// [AI] prompt: Route handler POST /api/auth/login untuk validasi skemaLogin, proses login, dan penyimpanan cookie sesi
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { setCookieSesi } from '@/lib/auth';
import { skemaLogin } from '@/modules/akun/schema';
import { login } from '@/modules/akun/service';

export const runtime = 'nodejs';

// [AI] prompt: Handler POST untuk autentikasi pengguna masuk, mengembalikan data pengguna dan menyetel cookie sesi
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaLogin.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.errors[0]?.message || 'Data login tidak valid');
    }

    const { pengguna, token } = await login(hasilValidasi.data.email, hasilValidasi.data.password);
    await setCookieSesi(token);

    return Response.json({ data: pengguna });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
