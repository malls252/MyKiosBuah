// [AI] prompt: "Buat TabFilter.tsx Client Component untuk filter tab horizontal scrollable dengan badge jumlah dan transisi tab aktif."
"use client";

import React from "react";
import styles from "./TabFilter.module.css";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabFilterProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

// [AI] prompt: "Render TabFilter dengan penanda tab aktif dan badge jumlah kuantitas."
export const TabFilter: React.FC<TabFilterProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div className={`no-scrollbar ${styles.container} ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isAktif = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isAktif}
            className={`${styles.tab} ${isAktif ? styles.aktif : styles.inaktif}`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`${styles.badge} ${
                  isAktif ? styles.badgeAktif : styles.badgeInaktif
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
