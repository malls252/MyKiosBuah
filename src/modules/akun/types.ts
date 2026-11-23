// [AI] prompt: Definisi tipe data peran pengguna sesuai ENUM database
export type PeranPengguna = 'Super Admin' | 'Kasir' | 'Pembeli';

// [AI] prompt: Tipe data Pengguna publik tanpa passwordHash untuk keamanan data
export type Pengguna = {
  idPengguna: number;
  nama: string;
  email: string;
  peran: PeranPengguna;
  noTelepon: string | null;
  alamat: string | null;
  aktif: boolean;
};

// [AI] prompt: Tipe data PenggunaDenganHash yang menyertakan passwordHash untuk keperluan internal modul akun
export type PenggunaDenganHash = Pengguna & {
  passwordHash: string;
};
