// [AI] prompt: "Buat SectionHeader.tsx untuk judul seksi dengan aksen indikator hijau vertikal, subjudul opsional, dan slot aksi kanan."
import React from "react";
import styles from "./SectionHeader.module.css";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

// [AI] prompt: "Render SectionHeader dengan penataan elemen kiri (indikator dan teks) dan slot aksi kanan."
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = "",
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.leftGroup}>
        <div className={styles.indicator} aria-hidden="true" />
        <div className={styles.textGroup}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};
