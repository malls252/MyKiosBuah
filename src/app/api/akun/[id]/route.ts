// [AI] prompt: Route handler PATCH /api/akun/[id] untuk mengubah data kasir atau status aktif akun kasir (khusus Super Admin)
import { ubahErrorKeRespons, ErrorValidasi } from '@/lib/errors';
import { wajibPeran } from '@/lib/auth';
import { skemaUbahAkunKasir, skemaSetAktif } from '@/modules/akun/schema';
import { ubahAkunKasir, ubahStatusAkun } from '@/modules/akun/service';

export const runtime = 'nodejs';

// [AI] prompt: Handler PATCH untuk memproses pembaruan akun kasir atau status aktifnya berdasarkan ID parameter
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const sesi = await wajibPeran(['Super Admin']);
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorValidasi('ID akun harus berupa bilangan bulat positif');
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      throw new ErrorValidasi('Data masukan tidak valid');
    }

    // Jika body memuat properti 'aktif', gunakan skemaSetAktif untuk pengubahan status aktif akun
    if ('aktif' in body) {
      const hasilValidasi = skemaSetAktif.safeParse(body);
      if (!hasilValidasi.success) {
        throw new ErrorValidasi(hasilValidasi.error.errors[0]?.message || 'Data status aktif tidak valid');
      }
      const hasil = await ubahStatusAkun(id, hasilValidasi.data.aktif, sesi.idPengguna);
      return Response.json({ data: hasil });
    }

    // Jika bukan perubahan status aktif, validasi dengan skemaUbahAkunKasir
    const hasilValidasi = skemaUbahAkunKasir.safeParse(body);
    if (!hasilValidasi.success) {
      throw new ErrorValidasi(hasilValidasi.error.errors[0]?.message || 'Data perubahan akun kasir tidak valid');
    }

    const hasil = await ubahAkunKasir(id, hasilValidasi.data);
    return Response.json({ data: hasil });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
