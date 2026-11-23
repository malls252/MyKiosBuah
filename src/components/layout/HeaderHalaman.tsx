// [AI] prompt: "Buat HeaderHalaman.tsx dengan dua chip informasi di kiri, judul di kanan chip, dan tombol profil di pojok kanan."
import React from "react";
import styles from "./HeaderHalaman.module.css";

export interface ChipInfo {
  baris1: string;
  baris2: string;
}

export interface HeaderHalamanProps {
  chipKiri?: ChipInfo;
  chipKanan?: ChipInfo;
  title: string;
  onProfileClick?: () => void;
}

// [AI] prompt: "Render HeaderHalaman dengan susunan persis wireframe dan tombol profil pembuka MenuAkun."
export const HeaderHalaman: React.FC<HeaderHalamanProps> = ({
  chipKiri = { baris1: "KIOS", baris2: "Pasuruan" },
  chipKanan = { baris1: "STATUS", baris2: "Buka" },
  title,
  onProfileClick,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.chip}>
          <span className={styles.chipBaris1}>{chipKiri.baris1}</span>
          <span className={styles.chipBaris2}>{chipKiri.baris2}</span>
        </div>
        <div className={styles.chip}>
          <span className={styles.chipBaris1}>{chipKanan.baris1}</span>
          <span className={styles.chipBaris2}>{chipKanan.baris2}</span>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <button
        type="button"
        className={styles.profileBtn}
        onClick={onProfileClick}
        aria-label="Buka menu profil akun"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </header>
  );
};
