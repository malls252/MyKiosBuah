// [AI] prompt: Class dasar AppError untuk error aplikasi dengan properti kode error dan status kode HTTP
export class AppError extends Error {
  readonly kode: string;
  readonly status: number;

  constructor(pesan: string, kode: string, status: number) {
    super(pesan);
    this.name = 'AppError';
    this.kode = kode;
    this.status = status;
  }
}

// [AI] prompt: Class turunan AppError untuk kasus HTTP 400 (ErrorValidasi), HTTP 401 (ErrorTidakLogin), dan HTTP 403 (ErrorDilarang)
export class ErrorValidasi extends AppError {
  constructor(pesan: string = 'Data masukan tidak valid') {
    super(pesan, 'VALIDASI', 400);
    this.name = 'ErrorValidasi';
  }
}

export class ErrorTidakLogin extends AppError {
  constructor(pesan: string = 'Autentikasi dibutuhkan. Silakan masuk terlebih dahulu') {
    super(pesan, 'TIDAK_LOGIN', 401);
    this.name = 'ErrorTidakLogin';
  }
}

export class ErrorDilarang extends AppError {
  constructor(pesan: string = 'Anda tidak memiliki hak akses untuk tindakan ini') {
    super(pesan, 'DILARANG', 403);
    this.name = 'ErrorDilarang';
  }
}

// [AI] prompt: Class turunan AppError untuk kasus HTTP 404 (ErrorTidakDitemukan), HTTP 409 (ErrorBentrok), dan HTTP 409 khusus stok (StokTidakCukupError)
export class ErrorTidakDitemukan extends AppError {
  constructor(pesan: string = 'Sumber daya tidak ditemukan') {
    super(pesan, 'TIDAK_DITEMUKAN', 404);
    this.name = 'ErrorTidakDitemukan';
  }
}

export class ErrorBentrok extends AppError {
  constructor(pesan: string = 'Terjadi konflik data') {
    super(pesan, 'BENTROK', 409);
    this.name = 'ErrorBentrok';
  }
}

export class StokTidakCukupError extends AppError {
  constructor(pesan: string = 'Stok buah tidak mencukupi untuk pesanan ini') {
    super(pesan, 'STOK_TIDAK_CUKUP', 409);
    this.name = 'StokTidakCukupError';
  }
}

// [AI] prompt: Fungsi ubahErrorKeRespons(error) untuk mengubah error apa pun menjadi format Response JSON standar { error: { kode, pesan } }
export function ubahErrorKeRespons(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          kode: error.kode,
          pesan: error.message,
        },
      },
      { status: error.status }
    );
  }

  console.error('Terjadi kesalahan internal tak tertangani:', error);

  return Response.json(
    {
      error: {
        kode: 'SERVER_ERROR',
        pesan: 'Terjadi kesalahan pada server',
      },
    },
    { status: 500 }
  );
}
