// [AI] prompt: Komponen FormBuah untuk tambah/ubah buah dengan dropdown kategori dan satuan, validasi harga, dan tombol simpan
'use client';

import React, { useState, useEffect } from 'react';
import { Tombol } from '@/components/ui/Button';
import type { Buah, Kategori, Satuan } from '../types';
import styles from './FormBuah.module.css';

interface FormBuahProps {
  buahDiedit: Buah | null;
  daftarKategori: Kategori[];
  daftarSatuan: Satuan[];
  onSubmit: (data: {
    namaBuah: string;
    idKategori: number;
    idSatuan: number;
    hargaPerKg: number;
    stokMinimum: number;
  }) => Promise<void>;
  onBatal: () => void;
  sedangMemuat?: boolean;
  pesanError?: string | null;
}

// [AI] prompt: Form interaktif untuk input data buah dengan dropdown relasi kategori & satuan
export const FormBuah: React.FC<FormBuahProps> = ({
  buahDiedit,
  daftarKategori,
  daftarSatuan,
  onSubmit,
  onBatal,
  sedangMemuat = false,
  pesanError,
}) => {
  const [namaBuah, setNamaBuah] = useState(buahDiedit ? buahDiedit.namaBuah : '');
  const [idKategori, setIdKategori] = useState<number>(
    buahDiedit ? buahDiedit.idKategori : daftarKategori[0]?.idKategori || 0
  );
  const [idSatuan, setIdSatuan] = useState<number>(
    buahDiedit ? buahDiedit.idSatuan : daftarSatuan[0]?.idSatuan || 0
  );
  const [hargaPerKg, setHargaPerKg] = useState(buahDiedit ? String(buahDiedit.hargaPerKg) : '');
  const [stokMinimum, setStokMinimum] = useState(buahDiedit ? String(buahDiedit.stokMinimum) : '0');
  const [errorLokal, setErrorLokal] = useState<string | null>(null);

  useEffect(() => {
    if (buahDiedit) {
      setNamaBuah(buahDiedit.namaBuah);
      setIdKategori(buahDiedit.idKategori);
      setIdSatuan(buahDiedit.idSatuan);
      setHargaPerKg(String(buahDiedit.hargaPerKg));
      setStokMinimum(String(buahDiedit.stokMinimum));
    } else {
      setNamaBuah('');
      setIdKategori(daftarKategori[0]?.idKategori || 0);
      setIdSatuan(daftarSatuan[0]?.idSatuan || 0);
      setHargaPerKg('');
      setStokMinimum('0');
    }
  }, [buahDiedit, daftarKategori, daftarSatuan]);

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLokal(null);

    if (!namaBuah.trim()) {
      setErrorLokal('Nama buah wajib diisi');
      return;
    }
    if (!idKategori) {
      setErrorLokal('Kategori wajib dipilih');
      return;
    }
    if (!idSatuan) {
      setErrorLokal('Satuan wajib dipilih');
      return;
    }
    const harga = Number(hargaPerKg);
    if (isNaN(harga) || harga < 0) {
      setErrorLokal('Harga per kg harus berupa angka positif');
      return;
    }
    const stokMin = Number(stokMinimum);
    if (isNaN(stokMin) || stokMin < 0) {
      setErrorLokal('Stok minimum harus berupa angka positif');
      return;
    }

    await onSubmit({
      namaBuah: namaBuah.trim(),
      idKategori,
      idSatuan,
      hargaPerKg: harga,
      stokMinimum: stokMin,
    });
  };

  const errorTampil = errorLokal || pesanError;

  return (
    <form onSubmit={tanganiSubmit} className={styles.formModal} noValidate>
      <div className={styles.kelompokInput}>
        <label className={styles.label}>Nama Buah</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Contoh: Apel Malang Manis"
          value={namaBuah}
          onChange={(e) => setNamaBuah(e.target.value)}
          required
        />
      </div>

      <div className={styles.barisDuaKolom}>
        <div className={styles.kelompokInput}>
          <label className={styles.label}>Kategori</label>
          <select
            className={styles.select}
            value={idKategori}
            onChange={(e) => setIdKategori(Number(e.target.value))}
            required
          >
            {daftarKategori.map((k) => (
              <option key={k.idKategori} value={k.idKategori}>
                {k.namaKategori}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.kelompokInput}>
          <label className={styles.label}>Satuan</label>
          <select
            className={styles.select}
            value={idSatuan}
            onChange={(e) => setIdSatuan(Number(e.target.value))}
            required
          >
            {daftarSatuan.map((s) => (
              <option key={s.idSatuan} value={s.idSatuan}>
                {s.namaSatuan} ({s.simbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.barisDuaKolom}>
        <div className={styles.kelompokInput}>
          <label className={styles.label}>Harga per Kg (Rp)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="Contoh: 28000"
            value={hargaPerKg}
            onChange={(e) => setHargaPerKg(e.target.value)}
            min="0"
            step="100"
            required
          />
        </div>

        <div className={styles.kelompokInput}>
          <label className={styles.label}>Stok Minimum</label>
          <input
            type="number"
            className={styles.input}
            placeholder="Contoh: 5"
            value={stokMinimum}
            onChange={(e) => setStokMinimum(e.target.value)}
            min="0"
            step="0.1"
            required
          />
        </div>
      </div>

      {errorTampil && <div className={styles.panelErrorModal}>{errorTampil}</div>}

      <div className={styles.tombolGrupModal}>
        <Tombol
          type="button"
          variant="sekunder"
          title="Batal"
          onClick={onBatal}
        />
        <Tombol
          type="submit"
          variant="utama"
          title={sedangMemuat ? 'Menyimpan...' : buahDiedit ? 'Perbarui Buah' : 'Simpan Buah'}
          loading={sedangMemuat}
          disabled={sedangMemuat}
        />
      </div>
    </form>
  );
};
