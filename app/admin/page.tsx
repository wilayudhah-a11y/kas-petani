"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Search, UserPlus } from "lucide-react";
import type { FarmerDraft, FarmerProfile, FarmRecord, Project } from "@/types";
import { changeFarmerStatus, createFarmer, deleteFarmer, listFarmers, resetFarmerPin, updateFarmer } from "@/lib/farmer-repository";
import { hasSupabase, supabase } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";

const emptyForm: FarmerDraft = {
  name: "",
  phone: "",
  pin: "",
  note: "",
  status: "aktif",
};

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function randomPin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FarmerDraft>({ ...emptyForm, pin: randomPin() });
  const [editingId, setEditingId] = useState("");
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ok = window.localStorage.getItem("kas_petani_admin_auth") === "yes";
    if (!ok) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
    setChecking(false);
  }, [router]);

  async function loadData() {
    if (!authorized) return;
    if (!hasSupabase || !supabase) {
      setError("Supabase belum aktif. Isi ENV Supabase dulu.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [farmerRows, projectsRes, recordsRes] = await Promise.all([
        listFarmers(),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("records").select("*").order("record_date", { ascending: false }),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (recordsRes.error) throw recordsRes.error;

      setFarmers(farmerRows);
      setProjects((projectsRes.data || []) as Project[]);
      setRecords((recordsRes.data || []) as FarmRecord[]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat data admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [authorized]);

  const summaries = useMemo(() => {
    return farmers.map((farmer) => {
      const farmerProjects = projects.filter((project) => project.farmer_id === farmer.id);
      const projectIds = new Set(farmerProjects.map((project) => project.id));
      const farmerRecords = records.filter((record) => projectIds.has(record.project_id));
      const modal = farmerRecords.filter((record) => record.type === "expense").reduce((sum, record) => sum + toNumber(record.amount), 0);
      const masuk = farmerRecords.filter((record) => record.type === "income" || record.type === "harvest").reduce((sum, record) => sum + toNumber(record.amount), 0);
      const panenKg = farmerRecords.filter((record) => record.type === "harvest").reduce((sum, record) => sum + toNumber(record.quantity), 0);
      return { farmer, projects: farmerProjects, records: farmerRecords, modal, masuk, panenKg };
    });
  }, [farmers, projects, records]);

  const filteredSummaries = summaries.filter((summary) => `${summary.farmer.name} ${summary.farmer.phone}`.toLowerCase().includes(query.toLowerCase()));
  const selectedSummary = summaries.find((summary) => summary.farmer.id === selectedFarmerId) || filteredSummaries[0] || null;

  async function submitFarmer() {
    if (!form.name?.trim()) return alert("Nama petani wajib diisi.");
    if (!form.phone?.trim()) return alert("Nomor HP wajib diisi.");

    try {
      setSaving(true);
      if (editingId) {
        await updateFarmer(editingId, form);
      } else {
        await createFarmer(form);
      }
      setForm({ ...emptyForm, pin: randomPin() });
      setEditingId("");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Gagal menyimpan petani.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(farmer: FarmerProfile) {
    setEditingId(farmer.id);
    setSelectedFarmerId(farmer.id);
    setForm({
      id: farmer.id,
      name: farmer.name,
      phone: farmer.phone,
      pin: "",
      note: farmer.note || "",
      status: farmer.status,
    });
  }

  async function doResetPin(farmer: FarmerProfile) {
    const next = prompt(`PIN baru untuk ${farmer.name}`, randomPin());
    if (!next) return;
    try {
      const savedPin = await resetFarmerPin(farmer.id, next);
      alert(`PIN baru ${farmer.name}: ${savedPin}`);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Gagal reset PIN.");
    }
  }

  async function toggleStatus(farmer: FarmerProfile) {
    try {
      await changeFarmerStatus(farmer.id, farmer.status === "aktif" ? "nonaktif" : "aktif");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Gagal mengubah status.");
    }
  }

  async function removeFarmer(farmer: FarmerProfile) {
    if (!confirm(`Hapus petani ${farmer.name}? Lahan tidak dihapus, hanya dilepas dari petani.`)) return;
    try {
      await deleteFarmer(farmer.id);
      if (selectedFarmerId === farmer.id) setSelectedFarmerId("");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Gagal hapus petani.");
    }
  }

  function logout() {
    window.localStorage.removeItem("kas_petani_admin_auth");
    router.replace("/admin/login");
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8faf5] font-black text-emerald-900">Memeriksa admin...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] text-emerald-950">
      <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-24 pt-5">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Admin</p>
            <h1 className="text-2xl font-black tracking-tight">Kelola Petani</h1>
            <p className="text-sm font-bold text-zinc-500">Tambah petani, PIN, lahan, dan monitoring.</p>
          </div>
          <button onClick={logout} className="rounded-2xl bg-white p-3 text-red-500 shadow-sm" title="Logout admin">
            <LogOut size={18} />
          </button>
        </header>

        {error ? <div className="mb-4 rounded-3xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-zinc-400">Petani</p>
            <p className="mt-1 text-3xl font-black">{farmers.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-zinc-400">Lahan</p>
            <p className="mt-1 text-3xl font-black">{projects.length}</p>
          </div>
        </section>

        <section className="mb-4 rounded-[28px] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">{editingId ? "Edit Petani" : "+ Tambah Petani"}</h2>
            <button onClick={loadData} className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama petani" className="w-full rounded-2xl bg-emerald-50 px-4 py-3 font-bold outline-none" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Nomor HP" inputMode="tel" className="w-full rounded-2xl bg-emerald-50 px-4 py-3 font-bold outline-none" />
            <input value={form.pin || ""} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder={editingId ? "PIN baru opsional" : "PIN"} inputMode="numeric" className="w-full rounded-2xl bg-emerald-50 px-4 py-3 font-bold outline-none" />
            <input value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Catatan opsional" className="w-full rounded-2xl bg-emerald-50 px-4 py-3 font-bold outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={submitFarmer} disabled={saving} className="rounded-2xl bg-emerald-600 py-3 font-black text-white disabled:opacity-60">
                {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
              </button>
              <button onClick={() => { setEditingId(""); setForm({ ...emptyForm, pin: randomPin() }); }} className="rounded-2xl bg-zinc-100 py-3 font-black text-zinc-700">
                Reset Form
              </button>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[28px] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-3">
            <Search size={18} className="text-emerald-700" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari petani..." className="w-full bg-transparent text-sm font-bold outline-none" />
          </div>
        </section>

        <section className="space-y-3">
          {filteredSummaries.map((summary) => (
            <div key={summary.farmer.id} className="rounded-[28px] bg-white p-4 shadow-sm">
              <button onClick={() => setSelectedFarmerId(summary.farmer.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black">👨‍🌾 {summary.farmer.name}</p>
                    <p className="text-sm font-bold text-zinc-500">{summary.farmer.phone || "Tanpa HP"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${summary.farmer.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{summary.farmer.status}</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xs font-black text-zinc-400">Lahan</p><p className="font-black">{summary.projects.length}</p></div>
                  <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xs font-black text-zinc-400">Modal</p><p className="font-black">{formatRupiah(summary.modal)}</p></div>
                  <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xs font-black text-zinc-400">Masuk</p><p className="font-black">{formatRupiah(summary.masuk)}</p></div>
                </div>
              </button>

              <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-black">
                <button onClick={() => startEdit(summary.farmer)} className="rounded-2xl bg-zinc-100 py-3 text-zinc-700">Edit</button>
                <button onClick={() => doResetPin(summary.farmer)} className="rounded-2xl bg-blue-50 py-3 text-blue-700">PIN</button>
                <button onClick={() => toggleStatus(summary.farmer)} className="rounded-2xl bg-amber-50 py-3 text-amber-700">{summary.farmer.status === "aktif" ? "Nonaktif" : "Aktif"}</button>
                <button onClick={() => removeFarmer(summary.farmer)} className="rounded-2xl bg-red-50 py-3 text-red-700">Hapus</button>
              </div>
            </div>
          ))}

          {!loading && filteredSummaries.length === 0 ? (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm">
              <UserPlus className="mx-auto text-emerald-600" />
              <p className="mt-3 font-black">Belum ada petani.</p>
            </div>
          ) : null}
        </section>

        {selectedSummary ? (
          <section className="mt-5 rounded-[28px] bg-emerald-900 p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Monitoring</p>
            <h2 className="mt-1 text-xl font-black">{selectedSummary.farmer.name}</h2>
            <div className="mt-4 space-y-2">
              {selectedSummary.projects.length === 0 ? <p className="text-sm font-bold text-emerald-100">Belum ada lahan.</p> : null}
              {selectedSummary.projects.map((project) => (
                <div key={project.id} className="rounded-2xl bg-white/10 p-3">
                  <p className="font-black">{project.name}</p>
                  <p className="text-sm font-bold text-emerald-100">{project.crop} • {project.phase} • {project.status}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Buka Aplikasi Petani</Link>
        </div>
      </div>
    </main>
  );
}
