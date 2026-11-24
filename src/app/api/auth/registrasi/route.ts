// [AI] prompt: Route handler POST /api/auth/registrasi untuk validasi skemaRegistrasi dan pendaftaran akun pembeli baru
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { skemaRegistrasi } from '@/modules/akun/schema';
import { registrasiPembeli } from '@/modules/akun/service';

// [AI] prompt: Handler POST untuk registrasi pembeli dengan status respons 201 Created
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaRegistrasi.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.issues[0]?.message || 'Data registrasi tidak valid');
    }

    const penggunaBaru = await registrasiPembeli(hasilValidasi.data);

    return Response.json({ data: penggunaBaru }, { status: 201 });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
