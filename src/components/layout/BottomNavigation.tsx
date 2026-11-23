// [AI] prompt: "Buat BottomNavigation.tsx Client Component dengan deteksi pathname Next.js, menu peran terpusat, status disabled redup, dan pemicu MenuAkun."
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dapatkanMenuPeran, PeranPengguna } from "./menu";
import styles from "./BottomNavigation.module.css";

export interface BottomNavigationProps {
  peran?: PeranPengguna;
  onOpenAkun?: () => void;
  className?: string;
}

// [AI] prompt: "Render BottomNavigation dengan 4 tombol menu sesuai peran pengguna dan penanda aktif garis hijau."
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  peran = "pembeli",
  onOpenAkun,
  className = "",
}) => {
  const pathname = usePathname();
  const daftarMenu = dapatkanMenuPeran(peran);

  return (
    <nav
      className={`${styles.navContainer} ${className}`}
      aria-label="Navigasi Bawah Utama"
    >
      {daftarMenu.map((item) => {
        const isAktif = item.href !== "#" && pathname === item.href;

        if (item.isAkun) {
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${!item.available ? styles.disabled : ""}`}
              onClick={onOpenAkun}
              aria-label="Buka Menu Akun"
            >
              <span className={styles.iconWrapper}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        }

        if (!item.available) {
          return (
            <div
              key={item.id}
              className={`${styles.navItem} ${styles.disabled}`}
              aria-disabled="true"
            >
              <span className={styles.iconWrapper}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${isAktif ? styles.active : ""}`}
            aria-current={isAktif ? "page" : undefined}
          >
            <span className={styles.iconWrapper}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
