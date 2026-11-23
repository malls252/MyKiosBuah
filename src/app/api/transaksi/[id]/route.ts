// [AI] prompt: "Buat src/app/api/transaksi/[id]/route.ts untuk GET detail struk satu transaksi berdasarkan id."

import { NextRequest, NextResponse } from "next/server";
import { ambilStruk } from "@/modules/transaksi/service";
import { getSesi } from "@/modules/transaksi/stub-sementara";

// [AI] prompt: "GET /api/transaksi/[id] — validasi sesi Kasir, parse params.id (await params di Next.js 16), lalu kembalikan objek Struk."
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const sesi = await getSesi();
    if (!sesi) {
      return NextResponse.json(
        { berhasil: false, pesan: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }
    if (sesi.peran !== "Kasir") {
      return NextResponse.json(
        { berhasil: false, pesan: "Akses ditolak. Hanya kasir yang dapat melihat struk ini." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const idTransaksi = Number(id);

    if (!Number.isInteger(idTransaksi) || idTransaksi <= 0) {
      return NextResponse.json(
        { berhasil: false, pesan: "Nomor transaksi tidak valid." },
        { status: 400 }
      );
    }

    const struk = await ambilStruk(idTransaksi);
    if (!struk) {
      return NextResponse.json(
        { berhasil: false, pesan: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        berhasil: true,
        data: struk,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/transaksi/[id]] Error tak terduga:", error);
    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Terjadi kesalahan pada server saat mengambil struk.",
      },
      { status: 500 }
    );
  }
}
