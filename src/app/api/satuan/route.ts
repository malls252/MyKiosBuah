// [AI] prompt: Route handler GET dan POST /api/satuan untuk daftar satuan dan penambahan satuan baru
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaSatuan } from '@/modules/master/schema';
import { daftarSatuan, buatSatuan } from '@/modules/master/service';

// [AI] prompt: Handler GET untuk mengambil seluruh satuan buah (semua peran login)
export async function GET(): Promise<Response> {
  try {
    await wajibPeran(['Super Admin', 'Kasir', 'Pembeli']);
    const data = await daftarSatuan();
    return Response.json({ data });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}

// [AI] prompt: Handler POST untuk membuat satuan buah baru (khusus Super Admin)
export async function POST(request: Request): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaSatuan.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.issues[0]?.message || 'Data satuan tidak valid');
    }

    const satuanBaru = await buatSatuan(hasilValidasi.data);
    return Response.json({ data: satuanBaru }, { status: 201 });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
