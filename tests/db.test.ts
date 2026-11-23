// [AI] prompt: "Buat tests/db.test.ts untuk menguji koneksi basis data Neon end-to-end menggunakan Vitest dan lib/db.ts."
import { describe, it, expect } from "vitest";
import { query } from "../src/lib/db";

describe("Pengujian Koneksi Basis Data Neon", () => {
  it("harus berhasil melakukan kalkulasi query sederhana", async () => {
    const hasil = await query<{ hasil: number }>("SELECT 1 + 1 AS hasil;");
    expect(Number(hasil.rows[0].hasil)).toBe(2);
  });

  it("harus berhasil membaca data buah dari skema awal", async () => {
    const hasil = await query<{ count: string }>("SELECT COUNT(*) FROM buah;");
    const totalBuah = Number(hasil.rows[0].count);
    expect(totalBuah).toBeGreaterThanOrEqual(10);
  });

  it("harus berhasil membaca pengguna awal dari skema migrasi", async () => {
    const hasil = await query<{ email: string; peran: string }>(
      "SELECT email, peran FROM pengguna WHERE email = $1",
      ["ali.mansur@kiosbuah.test"]
    );
    expect(hasil.rows.length).toBe(1);
    expect(hasil.rows[0].peran).toBe("Super Admin");
  });
});
