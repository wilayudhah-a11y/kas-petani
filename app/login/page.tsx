"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginFarmer } from "@/lib/farmer-repository";
import { saveFarmerSession } from "@/lib/farmer-auth";

export default function FarmerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!phone.trim()) return alert("Nomor HP wajib diisi.");
    if (!pin.trim()) return alert("PIN wajib diisi.");

    try {
      setLoading(true);
      const session = await loginFarmer(phone, pin);
      saveFarmerSession(session);
      router.replace("/");
    } catch (err: any) {
      alert(err?.message || "Gagal masuk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-8 text-emerald-950">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center">
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-3xl">🌱</div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">KAS PETANI</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight">Masuk Petani</h1>
            <p className="mt-2 text-sm font-bold text-zinc-500">Pakai nomor HP dan PIN dari admin.</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-black text-emerald-900">Nomor HP</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                placeholder="081234567890"
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-lg font-black outline-none focus:border-emerald-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-emerald-900">PIN</span>
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                inputMode="numeric"
                type="password"
                placeholder="6 digit"
                className="mt-2 w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-lg font-black outline-none focus:border-emerald-400"
              />
            </label>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 py-4 text-base font-black text-white shadow-lg shadow-emerald-900/15 disabled:opacity-60"
            >
              {loading ? "Memeriksa..." : "MASUK"}
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
            Belum punya PIN? Minta admin menambahkan akun petani dulu.
          </div>
        </div>

        <Link href="/admin/login" className="mt-5 text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
          Masuk Admin
        </Link>
      </div>
    </main>
  );
}
