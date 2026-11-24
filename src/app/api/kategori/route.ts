// [AI] prompt: Route handler GET dan POST /api/kategori untuk daftar kategori dan penambahan kategori baru
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaKategori } from '@/modules/master/schema';
import { daftarKategori, buatKategori } from '@/modules/master/service';

// [AI] prompt: Handler GET untuk mengambil seluruh kategori buah (semua peran login)
export async function GET(): Promise<Response> {
  try {
    await wajibPeran(['Super Admin', 'Kasir', 'Pembeli']);
    const data = await daftarKategori();
    return Response.json({ data });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}

// [AI] prompt: Handler POST untuk membuat kategori buah baru (khusus Super Admin)
export async function POST(request: Request): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaKategori.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.issues[0]?.message || 'Data kategori tidak valid');
    }

    const kategoriBaru = await buatKategori(hasilValidasi.data);
    return Response.json({ data: kategoriBaru }, { status: 201 });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
