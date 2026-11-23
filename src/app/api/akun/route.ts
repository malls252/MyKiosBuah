// [AI] prompt: Route handler GET dan POST /api/akun untuk melihat daftar dan membuat akun kasir (khusus Super Admin)
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaBuatAkunKasir } from '@/modules/akun/schema';
import { daftarAkunKasir, buatAkunKasir } from '@/modules/akun/service';

export const runtime = 'nodejs';

// [AI] prompt: Handler GET untuk mengambil daftar akun kasir dengan proteksi peran Super Admin
export async function GET(): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);
    const daftarKasir = await daftarAkunKasir();
    return Response.json({ data: daftarKasir });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}

// [AI] prompt: Handler POST untuk membuat akun kasir baru dengan validasi skemaBuatAkunKasir dan proteksi peran Super Admin
export async function POST(request: Request): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaBuatAkunKasir.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.errors[0]?.message || 'Data pembuatan akun kasir tidak valid');
    }

    const kasirBaru = await buatAkunKasir(hasilValidasi.data);
    return Response.json({ data: kasirBaru }, { status: 201 });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
