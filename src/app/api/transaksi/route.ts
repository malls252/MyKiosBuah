// [AI] prompt: "Perbarui src/app/api/transaksi/route.ts dengan handler POST (buat transaksi) dan GET (riwayat transaksi opsional ?tanggal=YYYY-MM-DD)."

import { NextRequest, NextResponse } from "next/server";
import { skemaBuatTransaksi } from "@/modules/transaksi/schema";
import {
  buatTransaksi,
  ambilRiwayatTransaksi,
  StokTidakCukupError,
} from "@/modules/transaksi/service";
import { getSesi } from "@/modules/transaksi/stub-sementara";

// [AI] prompt: "GET /api/transaksi — ambil riwayat transaksi kasir, mendukung query opsional ?tanggal=YYYY-MM-DD."
export async function GET(req: NextRequest): Promise<NextResponse> {
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
        { berhasil: false, pesan: "Akses ditolak. Hanya kasir yang dapat mengakses riwayat ini." },
        { status: 403 }
      );
    }

    const tanggalParam = req.nextUrl.searchParams.get("tanggal") ?? undefined;
    if (tanggalParam && !/^\d{4}-\d{2}-\d{2}$/.test(tanggalParam)) {
      return NextResponse.json(
        { berhasil: false, pesan: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const riwayat = await ambilRiwayatTransaksi({ tanggal: tanggalParam });

    return NextResponse.json(
      {
        berhasil: true,
        data: riwayat,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/transaksi] Error tak terduga:", error);
    return NextResponse.json(
      {
        berhasil: false,
        pesan: "Terjadi kesalahan pada server saat memuat riwayat transaksi.",
      },
      { status: 500 }
    );
  }
}

// [AI] prompt: "POST /api/transaksi — parse body JSON, validasi dengan skemaBuatTransaksi.safeParse, panggil buatTransaksi, tangani error validasi (422), stok habis (409), dan error tak terduga (500)."
export async function POST(req: NextRequest): Promise<NextResponse> {
  const sesi = await getSesi();
  if (!sesi) {
    return NextResponse.json(
      { berhasil: false, pesan: "Sesi tidak ditemukan. Silakan login kembali." },
      { status: 401 }
    );
  }
  if (sesi.peran !== "Kasir") {
    return NextResponse.json(
      { berhasil: false, pesan: "Akses ditolak. Hanya kasir yang dapat mencatat transaksi." },
      { status: 403 }
    );
  }

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

  const hasil = skemaBuatTransaksi.safeParse(body);

  if (!hasil.success) {
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

  try {
    const struk = await buatTransaksi(hasil.data);

    return NextResponse.json(
      {
        berhasil: true,
        pesan: "Transaksi berhasil dicatat.",
        data: struk,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof StokTidakCukupError) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: error.message,
        },
        { status: 409 }
      );
    }

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
