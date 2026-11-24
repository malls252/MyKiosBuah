// [AI] prompt: Route handler PATCH /api/buah/[id] untuk mengubah data buah atau status aktif/nonaktif buah (khusus Super Admin)
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaUbahBuah } from '@/modules/master/schema';
import { ubahBuah } from '@/modules/master/service';

// [AI] prompt: Handler PATCH untuk memperbarui buah berdasarkan ID parameter dengan await params
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await wajibPeran(['Super Admin']);

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorValidasi('ID buah harus berupa bilangan bulat positif');
    }

    const body = await request.json().catch(() => null);
    const hasilValidasi = skemaUbahBuah.safeParse(body);

    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.issues[0]?.message || 'Data pengubahan buah tidak valid');
    }

    const buahDiperbarui = await ubahBuah(id, hasilValidasi.data);
    return Response.json({ data: buahDiperbarui });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
