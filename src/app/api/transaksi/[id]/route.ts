// [AI] prompt: "Perbarui src/app/api/transaksi/[id]/route.ts agar memakai wajibPeran dari @/lib/auth dan AppError dari @/lib/errors (menggantikan stub-sementara)."

import { NextRequest, NextResponse } from "next/server";
import { wajibPeran } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { ambilStruk } from "@/modules/transaksi/service";

// [AI] prompt: "GET /api/transaksi/[id] — validasi sesi Kasir lewat wajibPeran, parse params.id (await params di Next.js 16), lalu kembalikan objek Struk."
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await wajibPeran(["Kasir"]);

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
    if (error instanceof AppError) {
      return NextResponse.json(
        { berhasil: false, pesan: error.message, kode: error.kode },
        { status: error.status }
      );
    }

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
