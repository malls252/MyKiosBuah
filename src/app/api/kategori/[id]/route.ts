// [AI] prompt: Route handler PATCH dan DELETE /api/kategori/[id] untuk pengubahan dan penghapusan kategori (khusus Super Admin)
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaKategori } from '@/modules/master/schema';
import { ubahKategori, hapusKategori } from '@/modules/master/service';

// [AI] prompt: Handler PATCH untuk mengubah data kategori berdasarkan ID parameter
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorValidasi('ID kategori harus berupa bilangan bulat positif');
    }

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaKategori.partial().safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.issues[0]?.message || 'Data pengubahan kategori tidak valid');
    }

    const kategoriDiperbarui = await ubahKategori(id, hasilValidasi.data);
    return Response.json({ data: kategoriDiperbarui });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}

// [AI] prompt: Handler DELETE untuk menghapus kategori berdasarkan ID parameter
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorValidasi('ID kategori harus berupa bilangan bulat positif');
    }

    await hapusKategori(id);
    return Response.json({ data: { ok: true } });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
