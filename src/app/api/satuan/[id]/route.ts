// [AI] prompt: Route handler PATCH dan DELETE /api/satuan/[id] untuk pengubahan dan penghapusan satuan buah (khusus Super Admin)
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaSatuan } from '@/modules/master/schema';
import { ubahSatuan, hapusSatuan } from '@/modules/master/service';

// [AI] prompt: Handler PATCH untuk mengubah data satuan berdasarkan ID parameter
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorValidasi('ID satuan harus berupa bilangan bulat positif');
    }

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaSatuan.partial().safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.issues[0]?.message || 'Data pengubahan satuan tidak valid');
    }

    const satuanDiperbarui = await ubahSatuan(id, hasilValidasi.data);
    return Response.json({ data: satuanDiperbarui });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}

// [AI] prompt: Handler DELETE untuk menghapus satuan berdasarkan ID parameter
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorValidasi('ID satuan harus berupa bilangan bulat positif');
    }

    await hapusSatuan(id);
    return Response.json({ data: { ok: true } });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
