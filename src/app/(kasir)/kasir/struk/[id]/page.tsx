// [AI] prompt: "Perbarui src/app/(kasir)/kasir/struk/[id]/page.tsx agar akses params dan query database dibungkus dalam Suspense sesuai aturan Cache Components Next.js 16."

import React, { Suspense } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CardPanel } from "@/components/ui/CardPanel";
import { ambilStruk } from "@/modules/transaksi/service";
import { StrukTransaksi } from "@/modules/transaksi/components/StrukTransaksi";
import styles from "./page.module.css";

interface HalamanStrukProps {
  params: Promise<{ id: string }>;
}

async function KontenStruk({ params }: HalamanStrukProps) {
  const { id } = await params;
  const idTransaksi = Number(id);

  const struk =
    Number.isInteger(idTransaksi) && idTransaksi > 0
      ? await ambilStruk(idTransaksi)
      : null;

  return (
    <>
      <SectionHeader
        title={struk ? `Struk Transaksi #${struk.idTransaksi}` : "Struk Tidak Ditemukan"}
        subtitle={
          struk
            ? "Siap dicetak untuk printer termal 58mm atau disimpan sebagai PDF"
            : "Periksa kembali nomor transaksi"
        }
      />

      {struk ? (
        <StrukTransaksi struk={struk} labelTutup="Kembali ke Riwayat" />
      ) : (
        <CardPanel variant="abu" padding="md" className={styles.kosongPanel}>
          <p className={styles.teksKosong}>
            Data transaksi dengan nomor #{id} tidak ditemukan.
          </p>
          <Link href="/kasir/riwayat" className={styles.linkKembali}>
            Kembali ke Riwayat Transaksi
          </Link>
        </CardPanel>
      )}
    </>
  );
}

export default function HalamanStrukDetail({ params }: HalamanStrukProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <CardPanel variant="abu" padding="md">
            <p className={styles.teksKosong}>Memuat data struk...</p>
          </CardPanel>
        </div>
      }
    >
      <PageLayout title="Struk" peran="kasir" namaPengguna="Rina Wulandari">
        <div className={styles.container}>
          <KontenStruk params={params} />
        </div>
      </PageLayout>
    </Suspense>
  );
}
