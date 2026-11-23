// [AI] prompt: "Buat Button.tsx sebagai komponen tombol serbaguna dengan varian utama/sekunder/bahaya, ikon, title, subtitle, status loading, dan aksesibilitas."
import React from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "utama" | "sekunder" | "bahaya";
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

// [AI] prompt: "Komponen Button dengan penanganan status loading dan render multi-baris title/subtitle."
export const Button: React.FC<ButtonProps> = ({
  variant = "utama",
  icon,
  title,
  subtitle,
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const kelasTombol = [
    styles.btn,
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    isDisabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={kelasTombol}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      <span className={styles.content}>
        <span className={styles.title}>{title || children}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
    </button>
  );
};
