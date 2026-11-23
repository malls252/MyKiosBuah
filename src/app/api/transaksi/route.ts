// [AI] prompt: "Buat src/app/api/transaksi/route.ts sebagai POST handler Next.js App Router untuk endpoint pembuatan transaksi kasir, dengan validasi Zod, penanganan StokTidakCukupError, dan respons JSON terstruktur."

import { NextRequest, NextResponse } from "next/server";
import { skemaBuatTransaksi } from "@/modules/transaksi/schema";
import { buatTransaksi, StokTidakCukupError } from "@/modules/transaksi/service";

// [AI] prompt: "POST /api/transaksi — parse body JSON, validasi dengan skemaBuatTransaksi.safeParse, panggil buatTransaksi, tangani error validasi (422), stok habis (409), dan error tak terduga (500)."
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse body JSON
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Body request bukan JSON yang valid.",
      },
      { status: 400 }
    );
  }

  // 2. Validasi input dengan Zod
  const hasil = skemaBuatTransaksi.safeParse(body);

  if (!hasil.success) {
    // [AI] prompt: "Kembalikan HTTP 422 dengan array isu validasi Zod (path + message) agar klien bisa menampilkan error per field."
    const isu = hasil.error.issues.map((i) => ({
      field: i.path.join("."),
      pesan: i.message,
    }));

    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Data transaksi tidak valid.",
        isu,
      },
      { status: 422 }
    );
  }

  // 3. Jalankan service buatTransaksi
  try {
    const struk = await buatTransaksi(hasil.data);

    // [AI] prompt: "Kembalikan HTTP 201 dengan objek struk lengkap dalam field data jika transaksi berhasil dibuat."
    return NextResponse.json(
      {
        berhasil: true,
        pesan: "Transaksi berhasil dicatat.",
        data: struk,
      },
      { status: 201 }
    );
  } catch (error) {
    // [AI] prompt: "Tangani StokTidakCukupError dengan HTTP 409 Conflict agar UI bisa menampilkan pesan stok habis tanpa crash."
    if (error instanceof StokTidakCukupError) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: error.message,
        },
        { status: 409 }
      );
    }

    // [AI] prompt: "Log error tak terduga di server dan kembalikan HTTP 500 tanpa detail internal ke klien."
    console.error("[POST /api/transaksi] Error tak terduga:", error);
    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Terjadi kesalahan pada server. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
