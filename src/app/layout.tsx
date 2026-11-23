// [AI] prompt: "Perbarui layout.tsx agar menggunakan system font stack dari globals.css tanpa dependensi Google Fonts online."
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyKiosBuah",
  description: "Aplikasi Website Kios Buah - Sistem Kasir dan Inventori Stok FIFO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
