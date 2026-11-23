// [AI] prompt: "Buat MenuAkun.tsx Client Component dengan BottomSheet, info profil nama/peran pengguna, dan aksi logout POST /api/auth/logout."
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import styles from "./MenuAkun.module.css";

export interface MenuAkunProps {
  isOpen: boolean;
  onClose: () => void;
  nama?: string;
  peran?: string;
}

// [AI] prompt: "Render MenuAkun dengan integrasi proses logout, penanganan error, dan navigasi redirect ke /login."
export const MenuAkun: React.FC<MenuAkunProps> = ({
  isOpen,
  onClose,
  nama = "Pengguna Kios",
  peran = "Pembeli",
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorPesan, setErrorPesan] = useState<string | null>(null);

  const inisialNama = nama
    .split(" ")
    .map((kata) => kata[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tanganiKeluar = async () => {
    setLoading(true);
    setErrorPesan(null);

    try {
      const respons = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!respons.ok) {
        const json = await respons.json().catch(() => null);
        throw new Error(json?.error?.pesan || "Gagal melakukan proses keluar.");
      }

      onClose();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setErrorPesan((err as Error).message || "Terjadi kesalahan saat logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Menu Akun">
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{inisialNama}</div>
          <div className={styles.info}>
            <div className={styles.nama}>{nama}</div>
            <div className={styles.peranWrapper}>
              <Pill variant="hijau">{peran}</Pill>
            </div>
          </div>
        </div>

        {errorPesan && <div className={styles.pesanError}>{errorPesan}</div>}

        <Button
          variant="bahaya"
          title="Keluar dari Akun"
          subtitle="Akhiri sesi Anda pada perangkat ini"
          fullWidth
          loading={loading}
          onClick={tanganiKeluar}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
        />
      </div>
    </BottomSheet>
  );
};
