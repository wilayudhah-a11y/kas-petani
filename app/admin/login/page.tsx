"use client";

import { useEffect, useState } from "react";
import { Lock, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "123456";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authValue = window.localStorage.getItem("kas_petani_admin_auth");
    if (authValue === "yes") router.replace("/admin");
  }, [router]);

  function loginAdmin() {
    if (pin.trim() !== ADMIN_PIN) {
      setError("PIN admin salah.");
      return;
    }

    window.localStorage.setItem("kas_petani_admin_auth", "yes");
    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-8 text-emerald-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
              <Sprout size={26} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Admin</p>
              <h1 className="text-2xl font-black text-emerald-950">Masuk Admin</h1>
              <p className="text-sm font-semibold text-emerald-600">Kelola data petani.</p>
            </div>
          </div>

          <label className="mb-3 block text-sm font-black text-emerald-900">PIN Admin</label>
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-emerald-700">
            <Lock size={18} />
            <input
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") loginAdmin();
              }}
              inputMode="numeric"
              type="password"
              placeholder="Masukkan PIN"
              className="w-full bg-transparent text-lg font-black tracking-widest outline-none placeholder:text-emerald-300"
            />
          </div>

          {error ? <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p> : null}

          <button
            onClick={loginAdmin}
            className="w-full rounded-2xl bg-emerald-700 px-4 py-4 text-sm font-black text-white shadow-sm active:scale-[0.99]"
          >
            Masuk
          </button>

          <p className="mt-4 text-center text-xs font-semibold text-emerald-500">
            PIN default lokal: 123456. Ubah lewat ENV NEXT_PUBLIC_ADMIN_PIN.
          </p>
        </section>
      </div>
    </main>
  );
}
