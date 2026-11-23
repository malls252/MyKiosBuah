// [AI] prompt: "Buat route handler GET /api/kesehatan untuk memeriksa koneksi basis data Neon secara end-to-end dengan format standar { data }."
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// [AI] prompt: "Handler GET mengeksekusi query COUNT(*) dari tabel buah untuk membuktikan konektivitas Neon."
export async function GET() {
  try {
    const hasil = await query<{ count: string }>("SELECT COUNT(*) FROM buah;");
    return NextResponse.json({
      data: {
        status: "sehat",
        pesan: "Koneksi basis data Neon berhasil terhubung",
        totalBuah: Number(hasil.rows[0].count),
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          kode: "DB_ERROR",
          pesan: (err as Error).message || "Gagal menghubungi basis data Neon.",
        },
      },
      { status: 500 }
    );
  }
}
