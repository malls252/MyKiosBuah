// [AI] prompt: "Buat PageLayout.tsx sebagai kerangka layout utama perakitan HeaderHalaman, isi konten halaman, NavigasiBawah, dan MenuAkun."
"use client";

import React, { useState } from "react";
import { HeaderHalaman, ChipInfo } from "./HeaderHalaman";
import { BottomNavigation } from "./BottomNavigation";
import { MenuAkun } from "./MenuAkun";
import { PeranPengguna } from "./menu";
import styles from "./PageLayout.module.css";

export interface PageLayoutProps {
  title: string;
  chipKiri?: ChipInfo;
  chipKanan?: ChipInfo;
  peran?: PeranPengguna;
  namaPengguna?: string;
  children: React.ReactNode;
  className?: string;
}

// [AI] prompt: "Komponen PageLayout menyatukan header, children, bottom navigation, dan modal sheet menu akun."
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  chipKiri,
  chipKanan,
  peran = "pembeli",
  namaPengguna = "Pengguna Kios",
  children,
  className = "",
}) => {
  const [isMenuAkunOpen, setIsMenuAkunOpen] = useState(false);

  return (
    <div className={`${styles.viewport} ${className}`}>
      <HeaderHalaman
        title={title}
        chipKiri={chipKiri}
        chipKanan={chipKanan}
        onProfileClick={() => setIsMenuAkunOpen(true)}
      />

      <main className={styles.content}>{children}</main>

      <BottomNavigation
        peran={peran}
        onOpenAkun={() => setIsMenuAkunOpen(true)}
      />

      <MenuAkun
        isOpen={isMenuAkunOpen}
        onClose={() => setIsMenuAkunOpen(false)}
        nama={namaPengguna}
        peran={peran.charAt(0).toUpperCase() + peran.slice(1)}
      />
    </div>
  );
};
