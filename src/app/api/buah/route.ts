// [AI] prompt: Route handler GET dan POST /api/buah untuk daftar buah (?aktif=true atau semua) dan penambahan buah baru
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaBuah } from '@/modules/master/schema';
import { daftarBuah, getDaftarBuahAktif, buatBuah } from '@/modules/master/service';

export const runtime = 'nodejs';

// [AI] prompt: Handler GET untuk mengambil daftar buah (bisa diakses semua peran login, filter ?aktif=true)
export async function GET(request: Request): Promise<Response> {
  try {
    await wajibPeran(['Super Admin', 'Kasir', 'Pembeli']);

    const { searchParams } = new URL(request.url);
    const hanyaAktif = searchParams.get('aktif') === 'true';

    const data = hanyaAktif ? await getDaftarBuahAktif() : await daftarBuah();
    return Response.json({ data });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}

// [AI] prompt: Handler POST untuk menambah buah baru (khusus Super Admin)
export async function POST(request: Request): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaBuah.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.errors[0]?.message || 'Data buah tidak valid');
    }

    const buahBaru = await buatBuah(hasilValidasi.data);
    return Response.json({ data: buahBaru }, { status: 201 });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
