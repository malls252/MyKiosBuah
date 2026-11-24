// [AI] prompt: Proxy Next.js 16 pemeriksa token JWT dan otorisasi peran berdasarkan matriks hak akses Tugas 4 (migrasi dari src/middleware.ts)
import { NextResponse, type NextRequest } from 'next/server';
import { verifikasiToken, type PayloadSesi } from './lib/jwt';

// Catatan keamanan: Proxy ini berfungsi sebagai lapisan pertahanan pertama (first layer).
// Handler API tetap wajib memanggil fungsi wajibPeran() dari src/lib/auth.ts sebagai lapisan pertahanan kedua (defense-in-depth).

const NAMA_COOKIE_SESI = 'sesi_kios';

// [AI] prompt: Fungsi pembantu untuk menentukan rute beranda default berdasarkan peran pengguna
function dapatkanRuteBeranda(peran: PayloadSesi['peran']): string {
  switch (peran) {
    case 'Super Admin':
      return '/admin';
    case 'Kasir':
      return '/kasir';
    case 'Pembeli':
      return '/katalog';
  }
}

// [AI] prompt: Logika utama proxy untuk validasi sesi, pengalihan halaman login/beranda, dan perlindungan endpoint API
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(NAMA_COOKIE_SESI)?.value;
  const sesi = token ? await verifikasiToken(token) : null;

  // 1. Rute otentikasi publik: cegah pengguna yang sudah login mengakses /login atau /registrasi
  const ruteHalamanAuth = ['/login', '/registrasi'];
  if (ruteHalamanAuth.includes(pathname)) {
    if (sesi) {
      return NextResponse.redirect(new URL(dapatkanRuteBeranda(sesi.peran), request.url));
    }
    return NextResponse.next();
  }

  // 2. Rute API publik (tanpa login)
  if (pathname === '/api/auth/login' || pathname === '/api/auth/registrasi') {
    return NextResponse.next();
  }

  // 3. Menentukan peran yang dibutuhkan berdasarkan rute
  let peranYangDibutuhkan: PayloadSesi['peran'] | null = null;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/akun')) {
    peranYangDibutuhkan = 'Super Admin';
  } else if (pathname.startsWith('/kasir') || pathname.startsWith('/api/transaksi')) {
    peranYangDibutuhkan = 'Kasir';
  } else if (
    pathname.startsWith('/katalog') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/pesanan')
  ) {
    peranYangDibutuhkan = 'Pembeli';
  }

  // Jika bukan rute yang dilindungi peran khusus, izinkan lewat
  if (!peranYangDibutuhkan) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith('/api');

  // 4. Periksa apakah pengguna belum login
  if (!sesi) {
    if (isApi) {
      return NextResponse.json(
        {
          error: {
            kode: 'TIDAK_LOGIN',
            pesan: 'Autentikasi dibutuhkan. Silakan masuk terlebih dahulu',
          },
        },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. Periksa apakah peran pengguna sesuai dengan hak akses rute
  if (sesi.peran !== peranYangDibutuhkan) {
    if (isApi) {
      return NextResponse.json(
        {
          error: {
            kode: 'DILARANG',
            pesan: 'Anda tidak memiliki hak akses untuk tindakan ini',
          },
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL(dapatkanRuteBeranda(sesi.peran), request.url));
  }

  return NextResponse.next();
}

// [AI] prompt: Konfigurasi matcher proxy agar mengabaikan file statis, favicon, dan internal Next.js (_next)
export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (file favicon)
     * - gambar atau file media statis (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
