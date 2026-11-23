// [AI] prompt: "Perbarui src/app/api/transaksi/route.ts agar memakai wajibPeran dari @/lib/auth dan AppError/StokTidakCukupError dari @/lib/errors (menggantikan stub-sementara)."

import { NextRequest, NextResponse } from "next/server";
import { wajibPeran } from "@/lib/auth";
import { AppError, StokTidakCukupError } from "@/lib/errors";
import { skemaBuatTransaksi } from "@/modules/transaksi/schema";
import {
  buatTransaksi,
  ambilRiwayatTransaksi,
} from "@/modules/transaksi/service";

// [AI] prompt: "GET /api/transaksi — validasi sesi Kasir lewat wajibPeran, ambil riwayat transaksi dengan filter opsional ?tanggal=YYYY-MM-DD."
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await wajibPeran(["Kasir"]);

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
    if (error instanceof AppError) {
      return NextResponse.json(
        { berhasil: false, pesan: error.message, kode: error.kode },
        { status: error.status }
      );
    }

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

// [AI] prompt: "POST /api/transaksi — validasi sesi Kasir lewat wajibPeran, validasi body Zod, panggil buatTransaksi(sesi.idPengguna, data), dan tangani AppError/StokTidakCukupError."
export async function POST(req: NextRequest): Promise<NextResponse> {
  let sesi;
  try {
    sesi = await wajibPeran(["Kasir"]);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { berhasil: false, pesan: error.message, kode: error.kode },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { berhasil: false, pesan: "Gagal memverifikasi sesi." },
      { status: 500 }
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
    const struk = await buatTransaksi(sesi.idPengguna, hasil.data);

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
          kode: error.kode,
        },
        { status: 409 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          berhasil: false,
          pesan: error.message,
          kode: error.kode,
        },
        { status: error.status }
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
