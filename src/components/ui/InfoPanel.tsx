// [AI] prompt: "Buat InfoPanel.tsx sebagai kartu pesan informasi dengan ikon kiri, judul, deskripsi, dan varian latar."
import React from "react";
import styles from "./InfoPanel.module.css";

export interface InfoPanelProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  variant?: "hijau" | "cream";
  className?: string;
}

// [AI] prompt: "Render InfoPanel dengan ikon hijau ramah lingkungan dan teks bertingkat."
export const InfoPanel: React.FC<InfoPanelProps> = ({
  icon,
  title,
  description,
  variant = "hijau",
  className = "",
}) => {
  return (
    <div className={`${styles.panel} ${styles[variant]} ${className}`}>
      {icon ? (
        <span className={styles.icon}>{icon}</span>
      ) : (
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
      )}
      <div className={styles.textGroup}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{description}</div>
      </div>
    </div>
  );
};
