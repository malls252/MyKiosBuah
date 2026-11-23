// [AI] prompt: "Susun ulang halaman src/app/(kasir)/kasir/page.tsx persis mengikuti wireframe: banner shift, baris pencarian + tombol keranjang, panel transaksi ditahan, ringkasan keranjang, daftar item dengan stepper, kartu ringkasan total, kartu pembayaran 3 tab dengan nominal cepat, tombol CTA proses transaksi, dan bar transaksi terakhir. Logika bisnis tetap di service/API; komponen hanya tampilan dan interaksi."
"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardPanel } from "@/components/ui/CardPanel";
import { Button } from "@/components/ui/Button";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { BuahAktif, Struk } from "@/modules/transaksi/types";
import { StrukTransaksi } from "@/modules/transaksi/components/StrukTransaksi";
import styles from "./page.module.css";

// [AI] prompt: "ItemKeranjang mewakili baris item yang dipilih kasir sebelum dikirim ke API (diskon per item selalu 0 sesuai wireframe)."
interface ItemKeranjang {
  idBuah: number;
  namaBuah: string;
  hargaPerKg: number;
  beratKg: number;
}

type MetodeBayar = "Tunai" | "QRIS";

const LANGKAH_BERAT = 0.5;
const BERAT_MAKS = 999;

// [AI] prompt: "Daftar buah aktif dikodekan sementara modul Elvya belum selesai; akan diganti fetch API setelah modul digabung."
const DAFTAR_BUAH_AKTIF: BuahAktif[] = [
  { idBuah: 1, namaBuah: "Apel Malang", hargaPerKg: 28000, simbolSatuan: "kg" },
  { idBuah: 2, namaBuah: "Jeruk Medan", hargaPerKg: 25000, simbolSatuan: "kg" },
  { idBuah: 3, namaBuah: "Pisang Cavendish", hargaPerKg: 22000, simbolSatuan: "kg" },
  { idBuah: 7, namaBuah: "Melon Hijau", hargaPerKg: 14000, simbolSatuan: "kg" },
];

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nilai);
}

function bulat2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function bulat3(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

function kelipatanBerikut(nilai: number, kelipatan: number): number {
  return Math.ceil(nilai / kelipatan) * kelipatan;
}

// ─── Ikon inline ──────────────────────────────────────────────────────────────
const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const IkonShift = () => (
  <svg {...svgProps}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="3" y1="13" x2="21" y2="13" />
  </svg>
);
const IkonBarcode = () => (
  <svg {...svgProps}>
    <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
    <line x1="8" y1="8" x2="8" y2="16" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="16" y1="8" x2="16" y2="16" />
  </svg>
);
const IkonCari = () => (
  <svg {...svgProps} width={16} height={16}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IkonKeranjang = () => (
  <svg {...svgProps}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IkonTahan = () => (
  <svg {...svgProps} width={20} height={20}>
    <path d="M6 2h12M6 22h12" />
    <path d="M6 2v4a6 6 0 0 0 3 5 6 6 0 0 1-3 5v6M18 2v4a6 6 0 0 1-3 5 6 6 0 0 0 3 5v6" />
  </svg>
);
const IkonSinkron = () => (
  <svg {...svgProps} width={14} height={14}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IkonBuah = () => (
  <svg {...svgProps} width={20} height={20}>
    <path d="M12 7c-1-2-3-3-5-2-3 1-4 5-3 9 1 4 4 7 6 6 1-.5 1.5-.5 2 0 2 1 5-2 6-6 1-4 0-8-3-9-2-1-4 0-5 2z" />
    <path d="M12 7c0-2 1-3 3-4" />
  </svg>
);
const IkonStruk = () => (
  <svg {...svgProps} width={20} height={20}>
    <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 1V2z" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const IkonRiwayat = () => (
  <svg {...svgProps}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);
const IkonCetak = () => (
  <svg {...svgProps} width={14} height={14}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

// ─── Halaman utama kasir ──────────────────────────────────────────────────────
export default function HalamanKasir() {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [ditahan, setDitahan] = useState<ItemKeranjang[][]>([]);
  const [kataCari, setKataCari] = useState("");
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar>("Tunai");
  const [uangDiterima, setUangDiterima] = useState(0);

  const [sedangProses, setSedangProses] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [strukTerakhir, setStrukTerakhir] = useState<Struk | null>(null);
  const [showStruk, setShowStruk] = useState(false);

  const refKeranjang = useRef<HTMLDivElement>(null);

  // ─── Kalkulasi ringkasan (tampilan saja; angka resmi dihitung server) ───────
  const ringkasan = useMemo(() => {
    let totalBruto = 0;
    let totalBerat = 0;
    for (const i of keranjang) {
      totalBruto = bulat2(totalBruto + i.beratKg * i.hargaPerKg);
      totalBerat = bulat3(totalBerat + i.beratKg);
    }
    const totalDiskon = 0;
    return { totalBruto, totalDiskon, totalBerat, totalBayar: bulat2(totalBruto - totalDiskon) };
  }, [keranjang]);

  const { totalBruto, totalDiskon, totalBerat, totalBayar } = ringkasan;

  const kembalian =
    metodeBayar === "Tunai" && totalBayar > 0 && uangDiterima >= totalBayar
      ? bulat2(uangDiterima - totalBayar)
      : null;

  const hasilCari = useMemo(() => {
    const kata = kataCari.trim().toLowerCase();
    if (!kata) return [];
    return DAFTAR_BUAH_AKTIF.filter((b) => b.namaBuah.toLowerCase().includes(kata));
  }, [kataCari]);

  const nominalCepat = useMemo(() => {
    if (totalBayar <= 0) return [];
    const nilai = [totalBayar, kelipatanBerikut(totalBayar, 50000), kelipatanBerikut(totalBayar, 100000)];
    return Array.from(new Set(nilai));
  }, [totalBayar]);

  // ─── Handler keranjang ─────────────────────────────────────────────────────
  // [AI] prompt: "tambahBuah menambah buah ke keranjang (berat awal 1 kg) atau menambah berat jika sudah ada."
  const tambahBuah = useCallback((buah: BuahAktif) => {
    setKeranjang((prev) => {
      const ada = prev.find((i) => i.idBuah === buah.idBuah);
      if (ada) {
        return prev.map((i) =>
          i.idBuah === buah.idBuah
            ? { ...i, beratKg: Math.min(BERAT_MAKS, bulat3(i.beratKg + LANGKAH_BERAT)) }
            : i
        );
      }
      return [
        ...prev,
        { idBuah: buah.idBuah, namaBuah: buah.namaBuah, hargaPerKg: buah.hargaPerKg, beratKg: 1 },
      ];
    });
    setKataCari("");
    setPesan(null);
  }, []);

  // [AI] prompt: "ubahBerat mengubah berat item dengan langkah 0.5 kg; jika turun di bawah langkah minimum item dihapus."
  const ubahBerat = useCallback((idBuah: number, delta: number) => {
    setKeranjang((prev) =>
      prev
        .map((i) =>
          i.idBuah === idBuah
            ? { ...i, beratKg: Math.min(BERAT_MAKS, bulat3(i.beratKg + delta)) }
            : i
        )
        .filter((i) => i.beratKg >= LANGKAH_BERAT)
    );
  }, []);

  const resetTransaksi = useCallback(() => {
    setKeranjang([]);
    setUangDiterima(0);
    setMetodeBayar("Tunai");
    setKataCari("");
  }, []);

  // [AI] prompt: "tahanTransaksi menyimpan keranjang aktif ke daftar ditahan dan mengosongkan keranjang; pulihkanTransaksi mengambil transaksi ditahan terakhir dan menukarnya dengan keranjang aktif."
  const tahanTransaksi = () => {
    if (keranjang.length === 0) {
      setPesan("Keranjang kosong, tidak ada yang bisa ditahan.");
      return;
    }
    setDitahan((prev) => [...prev, keranjang]);
    resetTransaksi();
    setPesan(null);
  };

  const pulihkanTransaksi = () => {
    if (ditahan.length === 0) {
      setPesan("Tidak ada transaksi yang ditahan.");
      return;
    }
    const terakhir = ditahan[ditahan.length - 1];
    setDitahan((prev) => {
      const sisa = prev.slice(0, -1);
      return keranjang.length > 0 ? [...sisa, keranjang] : sisa;
    });
    setKeranjang(terakhir);
    setUangDiterima(0);
    setPesan(null);
  };

  // ─── Submit transaksi ──────────────────────────────────────────────────────
  // [AI] prompt: "prosesTransaksi memvalidasi input sisi klien lalu POST ke /api/transaksi dan menangani respons 201/409/422/500."
  const prosesTransaksi = async () => {
    setPesan(null);

    if (keranjang.length === 0) {
      setPesan("Keranjang masih kosong. Cari dan tambahkan buah terlebih dahulu.");
      return;
    }
    if (metodeBayar === "Tunai" && uangDiterima < totalBayar) {
      setPesan(`Uang diterima kurang. Total bayar ${formatRupiah(totalBayar)}.`);
      return;
    }

    setSedangProses(true);
    try {
      const body = {
        item: keranjang.map((i) => ({ idBuah: i.idBuah, beratKg: i.beratKg, diskon: 0 })),
        metodeBayar,
        ...(metodeBayar === "Tunai" ? { uangDiterima } : {}),
      };

      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (res.status === 201 && json.berhasil) {
        setStrukTerakhir(json.data as Struk);
        setShowStruk(true);
        resetTransaksi();
      } else if (res.status === 422 && Array.isArray(json.isu)) {
        const isu = (json.isu as { pesan: string }[]).map((i) => i.pesan).join("; ");
        setPesan(`Data tidak valid: ${isu}`);
      } else {
        setPesan(json.pesan || "Terjadi kesalahan pada server.");
      }
    } catch {
      setPesan("Gagal terhubung ke server. Periksa koneksi internet.");
    } finally {
      setSedangProses(false);
    }
  };

  // [AI] prompt: "Hitung tanggal hari ini lewat timer 0ms di useEffect agar aman dari error prerender Next.js 16 dan aturan react-hooks/set-state-in-effect."
  const [tanggalHariIni, setTanggalHariIni] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => {
      setTanggalHariIni(
        new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <PageLayout title="Kasir" peran="kasir" namaPengguna="Rina Wulandari">
      <div className={styles.container}>
        {/* 1. Banner shift */}
        <div className={styles.bannerShift}>
          <span className={styles.ikonKotak}><IkonShift /></span>
          <div className={styles.bannerTeks}>
            <strong>Shift Kasir Aktif</strong>
            <span>Rina Wulandari</span>
            <span>{tanggalHariIni}</span>
          </div>
          <span className={styles.pillStatus}>
            <span className={styles.titik} aria-hidden="true" />
            Buka
          </span>
        </div>

        {/* Pesan error */}
        {pesan && <InfoPanel variant="cream" title="Perhatian" description={pesan} />}

        {/* 2. Pencarian + tombol keranjang */}
        <div className={styles.barisCari}>
          <div className={styles.kotakCari}>
            <button
              type="button"
              className={styles.btnIkon}
              disabled
              title="Pemindai barcode belum tersedia"
              aria-label="Pindai barcode (belum tersedia)"
            >
              <IkonBarcode />
            </button>
            <input
              type="search"
              className={styles.inputCari}
              placeholder="Cari nama buah..."
              value={kataCari}
              onChange={(e) => setKataCari(e.target.value)}
              aria-label="Cari buah"
            />
            <span className={styles.btnCariIkon} aria-hidden="true"><IkonCari /></span>
          </div>
          <button
            type="button"
            className={styles.btnKeranjang}
            onClick={() => refKeranjang.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <IkonKeranjang />
            <span>Keranjang ({keranjang.length})</span>
          </button>
        </div>

        {kataCari.trim() !== "" && (
          <CardPanel variant="putih" padding="sm" className={styles.hasilCari}>
            {hasilCari.length === 0 ? (
              <p className={styles.teksKosong}>Buah tidak ditemukan.</p>
            ) : (
              hasilCari.map((b) => (
                <button
                  key={b.idBuah}
                  type="button"
                  className={styles.barisHasil}
                  onClick={() => tambahBuah(b)}
                >
                  <span className={styles.namaItem}>{b.namaBuah}</span>
                  <span className={styles.hargaItem}>{formatRupiah(b.hargaPerKg)}/kg</span>
                </button>
              ))
            )}
          </CardPanel>
        )}

        {/* 3. Panel transaksi ditahan */}
        <div className={styles.panelTahan}>
          <span className={styles.ikonKotak}><IkonTahan /></span>
          <div className={styles.bannerTeks}>
            <strong>Transaksi Ditahan</strong>
            <span>
              {ditahan.length === 0
                ? "Belum ada transaksi ditahan"
                : `${ditahan.length} transaksi menunggu`}
            </span>
          </div>
          <div className={styles.aksiTahan}>
            <button type="button" className={styles.btnTahan} onClick={tahanTransaksi}>
              Tahan
            </button>
            <button type="button" className={styles.btnPulihkan} onClick={pulihkanTransaksi}>
              <IkonSinkron /> Pulihkan
            </button>
          </div>
        </div>

        {/* 4. Ringkasan keranjang */}
        <div className={styles.ringkasKeranjang} ref={refKeranjang}>
          <div>
            <strong>Daftar Belanja</strong>
            <span>Atur berat dengan tombol − dan +</span>
          </div>
          <div className={styles.kanan}>
            <strong>{keranjang.length} jenis</strong>
            <span>{totalBerat} kg</span>
          </div>
        </div>

        {/* 5. Daftar item */}
        <div className={styles.daftarItem}>
          {keranjang.length === 0 ? (
            <CardPanel variant="putih" padding="md">
              <p className={styles.teksKosong}>
                Keranjang kosong. Cari buah di kolom pencarian untuk menambahkannya.
              </p>
            </CardPanel>
          ) : (
            keranjang.map((item) => (
              <CardPanel key={item.idBuah} variant="putih" padding="sm" className={styles.kartuItem}>
                <span className={styles.ikonKotak}><IkonBuah /></span>
                <div className={styles.infoItem}>
                  <span className={styles.namaItem}>{item.namaBuah}</span>
                  <span className={styles.hargaItem}>{formatRupiah(item.hargaPerKg)}/kg</span>
                  <span className={styles.subtotalItem}>
                    {formatRupiah(bulat2(item.beratKg * item.hargaPerKg))}
                  </span>
                </div>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.btnStep}
                    onClick={() => ubahBerat(item.idBuah, -LANGKAH_BERAT)}
                    aria-label={`Kurangi berat ${item.namaBuah}`}
                  >
                    −
                  </button>
                  <span className={styles.nilaiStep}>{item.beratKg}</span>
                  <button
                    type="button"
                    className={styles.btnStep}
                    onClick={() => ubahBerat(item.idBuah, LANGKAH_BERAT)}
                    aria-label={`Tambah berat ${item.namaBuah}`}
                  >
                    +
                  </button>
                </div>
              </CardPanel>
            ))
          )}
        </div>

        {/* 6. Kartu ringkasan total */}
        <CardPanel variant="abu" padding="md" className={styles.kartuTotal}>
          <div className={styles.barisTotal}>
            <span>Subtotal</span>
            <span>{formatRupiah(totalBruto)}</span>
          </div>
          <div className={styles.barisTotal}>
            <span>Diskon</span>
            <span>{formatRupiah(totalDiskon)}</span>
          </div>
          <div className={styles.barisTotal}>
            <span>Total berat</span>
            <span>{totalBerat} kg</span>
          </div>
          <hr className={styles.garis} />
          <div className={`${styles.barisTotal} ${styles.tebal}`}>
            <span>Total Bayar</span>
            <span>{formatRupiah(totalBayar)}</span>
          </div>
          <div className={styles.barisTotal}>
            <span>Jumlah jenis buah</span>
            <span>{keranjang.length}</span>
          </div>
        </CardPanel>

        {/* 7. Kartu pembayaran */}
        <CardPanel variant="putih" padding="md" className={styles.kartuBayar}>
          <div className={styles.kepalaBayar}>
            <div>
              <strong>Pembayaran</strong>
              <span>Pilih metode bayar</span>
            </div>
            <div className={styles.kanan}>
              <span>Total Bayar</span>
              <strong>{formatRupiah(totalBayar)}</strong>
            </div>
          </div>

          <div className={styles.tabBayar} role="tablist" aria-label="Metode bayar">
            <button
              type="button"
              role="tab"
              aria-selected={metodeBayar === "Tunai"}
              className={`${styles.tab} ${metodeBayar === "Tunai" ? styles.aktif : ""}`}
              onClick={() => setMetodeBayar("Tunai")}
            >
              Tunai
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metodeBayar === "QRIS"}
              className={`${styles.tab} ${metodeBayar === "QRIS" ? styles.aktif : ""}`}
              onClick={() => setMetodeBayar("QRIS")}
            >
              QRIS
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className={`${styles.tab} ${styles.nonaktif}`}
              disabled
              title="Metode ini belum tersedia"
            >
              Kartu
              <small>Segera</small>
            </button>
          </div>

          {metodeBayar === "Tunai" ? (
            <>
              <div className={styles.labelKecil}>
                <strong>Nominal Cepat</strong>
                <span>Ketuk untuk mengisi uang diterima</span>
              </div>
              <div className={styles.nominalCepat}>
                {nominalCepat.length === 0 ? (
                  <span className={styles.teksKosong}>Tambahkan buah terlebih dahulu.</span>
                ) : (
                  nominalCepat.map((n, idx) => (
                    <button
                      key={n}
                      type="button"
                      className={styles.chipNominal}
                      onClick={() => setUangDiterima(n)}
                    >
                      {idx === 0 ? "Uang pas" : formatRupiah(n)}
                    </button>
                  ))
                )}
              </div>

              <div className={styles.duaKolom}>
                <label className={styles.kolomIsi}>
                  <span>Uang Diterima</span>
                  <input
                    type="number"
                    className={styles.kotakIsi}
                    value={uangDiterima === 0 ? "" : uangDiterima}
                    min={0}
                    step={1000}
                    placeholder="Rp0"
                    onChange={(e) => setUangDiterima(parseFloat(e.target.value) || 0)}
                  />
                </label>
                <div className={styles.kolomIsi}>
                  <span>Kembalian</span>
                  <div className={`${styles.kotakIsi} ${styles.kotakHasil}`}>
                    {kembalian === null ? "—" : formatRupiah(kembalian)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.teksKosong}>
              Pembayaran QRIS tidak memerlukan uang diterima. Pastikan pembeli sudah menyelesaikan
              pembayaran sebelum memproses transaksi.
            </p>
          )}
        </CardPanel>

        {/* 8. Tombol CTA */}
        <Button
          title={sedangProses ? "Memproses..." : "Proses Transaksi"}
          subtitle={`Total ${formatRupiah(totalBayar)} • ${metodeBayar}`}
          icon={<IkonStruk />}
          variant="utama"
          fullWidth
          loading={sedangProses}
          onClick={prosesTransaksi}
        />

        {/* 9. Keterangan kecil */}
        <div className={styles.keterangan}>
          <span>Kasir: Rina Wulandari</span>
          <span>{keranjang.length} jenis • {totalBerat} kg</span>
        </div>

        {/* 10. Bar transaksi terakhir */}
        <div className={styles.barTerakhir}>
          <span className={styles.ikonPolos}><IkonRiwayat /></span>
          <span className={styles.teksTerakhir}>
            {strukTerakhir
              ? `Transaksi terakhir #${strukTerakhir.idTransaksi} • ${formatRupiah(strukTerakhir.totalBayar)}`
              : "Belum ada transaksi pada sesi ini"}
          </span>
          <button
            type="button"
            className={styles.btnCetak}
            disabled={!strukTerakhir}
            onClick={() => setShowStruk(true)}
          >
            <IkonCetak /> Struk
          </button>
        </div>

        {/* Struk */}
        <BottomSheet isOpen={showStruk} onClose={() => setShowStruk(false)} title="Transaksi Berhasil">
          {strukTerakhir && (
            <StrukTransaksi
              struk={strukTerakhir}
              onTutup={() => setShowStruk(false)}
              labelTutup="Transaksi Baru"
            />
          )}
        </BottomSheet>
      </div>
    </PageLayout>
  );
}
