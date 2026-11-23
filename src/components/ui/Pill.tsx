// [AI] prompt: "Buat Pill.tsx sebagai komponen label kapsul dengan varian netral, hitam, hijau, merah, dan kuning."
import React from "react";
import styles from "./Pill.module.css";

export type PillVariant = "netral" | "hitam" | "hijau" | "merah" | "kuning";

export interface PillProps {
  variant?: PillVariant;
  children: React.ReactNode;
  className?: string;
}

// [AI] prompt: "Render komponen Pill dengan kelas varian warna sesuai sistem desain."
export const Pill: React.FC<PillProps> = ({
  variant = "netral",
  children,
  className = "",
}) => {
  const kelasPill = [styles.pill, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return <span className={kelasPill}>{children}</span>;
};
