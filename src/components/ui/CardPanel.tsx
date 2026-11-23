// [AI] prompt: "Buat CardPanel.tsx sebagai wadah kartu pembungkus serbaguna dengan varian putih dan abu serta opsi padding."
import React from "react";
import styles from "./CardPanel.module.css";

export interface CardPanelProps {
  variant?: "putih" | "abu";
  padding?: "sm" | "md" | "lg" | "none";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// [AI] prompt: "Render CardPanel dengan penanganan kelas varian, padding, dan status interaktif clickable."
export const CardPanel: React.FC<CardPanelProps> = ({
  variant = "putih",
  padding = "md",
  children,
  className = "",
  onClick,
}) => {
  const mapPadding = {
    sm: styles.padSm,
    md: styles.padMd,
    lg: styles.padLg,
    none: styles.padNone,
  };

  const kelasCard = [
    styles.card,
    styles[variant],
    mapPadding[padding],
    onClick ? styles.clickable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={kelasCard} onClick={onClick}>
      {children}
    </div>
  );
};

export const KartuPanel = CardPanel;
