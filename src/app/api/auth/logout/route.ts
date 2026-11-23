// [AI] prompt: Route handler POST /api/auth/logout untuk menghapus cookie sesi pengguna
import { ubahErrorKeRespons } from '@/lib/errors';
import { hapusCookieSesi } from '@/lib/auth';

export const runtime = 'nodejs';

// [AI] prompt: Handler POST untuk logout dengan menghapus cookie sesi dan mengembalikan status ok
export async function POST(): Promise<Response> {
  try {
    await hapusCookieSesi();
    return Response.json({ data: { ok: true } });
  } catch (error) {
    return ubahErrorKeRespons(error);
  }
}
