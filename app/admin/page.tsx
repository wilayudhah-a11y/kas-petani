"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Eye, LogOut, Power, RefreshCw, Search, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasSupabase, supabase } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";

type FarmerStatus = "aktif" | "nonaktif";

type Farmer = {
  id: string;
  name: string;
  phone: string;
  status: FarmerStatus;
  note?: string | null;
  created_at: string;
};

type ProjectRow = {
  id: string;
  name: string;
  crop: string;
  location?: string | null;
  status: string;
  farmer_id?: string | null;
  created_at: string;
};

type RecordRow = {
  id: string;
  project_id: string;
  type: string;
  amount: number;
  quantity?: number | null;
};

type FarmerSummary = {
  farmer: Farmer;
  projects: ProjectRow[];
  modal: number;
  masuk: number;
  panenKg: number;
};

const emptyForm = {
  name: "",
  phone: "",
  note: "",
};

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadAdminData() {
    if (!isAuthorized) return;

    if (!hasSupabase || !supabase) {
      setError("Supabase belum aktif. Isi ENV dulu untuk memakai Admin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [farmersRes, projectsRes, recordsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("projects").select("id,name,crop,location,status,farmer_id,created_at").order("created_at", { ascending: false }),
        supabase.from("records").select("id,project_id,type,amount,quantity"),
      ]);

      if (farmersRes.error) throw farmersRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (recordsRes.error) throw recordsRes.error;

      setFarmers((farmersRes.data || []) as Farmer[]);
      setProjects((projectsRes.data || []) as ProjectRow[]);
      setRecords((recordsRes.data || []) as RecordRow[]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat data admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const authValue = window.localStorage.getItem("kas_petani_admin_auth");

    if (authValue === "yes") {
      setIsAuthorized(true);
      setCheckingAuth(false);
      return;
    }

    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    loadAdminData();
  }, [isAuthorized]);

  function logoutAdmin() {
    window.localStorage.removeItem("kas_petani_admin_auth");
    router.replace("/admin/login");
  }

  async function addFarmer() {
    if (!supabase) return;
    if (!form.name.trim()) {
      alert("Nama petani wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("profiles").insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        note: form.note.trim() || null,
        role: "farmer",
        status: "aktif",
      });

      if (insertError) throw insertError;

      setForm(emptyForm);
      await loadAdminData();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menambah petani.");
      alert(err?.message || "Gagal menambah petani.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFarmerStatus(farmer: Farmer) {
    if (!supabase) return;

    const nextStatus: FarmerStatus = farmer.status === "aktif" ? "nonaktif" : "aktif";

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: nextStatus })
        .eq("id", farmer.id);

      if (updateError) throw updateError;
      await loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal mengubah status petani.");
    }
  }

  async function deleteFarmer(farmer: Farmer) {
    if (!supabase) return;
    const ok = confirm(`Hapus petani ${farmer.name}? Lahan tidak dihapus, hanya dilepas dari petani ini.`);
    if (!ok) return;

    try {
      await supabase.from("projects").update({ farmer_id: null }).eq("farmer_id", farmer.id);
      const { error: deleteError } = await supabase.from("profiles").delete().eq("id", farmer.id);
      if (deleteError) throw deleteError;

      if (selectedFarmerId === farmer.id) setSelectedFarmerId(null);
      await loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal menghapus petani.");
    }
  }

  const summaries = useMemo<FarmerSummary[]>(() => {
    return farmers.map((farmer) => {
      const farmerProjects = projects.filter((project) => project.farmer_id === farmer.id);
      const projectIds = new Set(farmerProjects.map((project) => project.id));
      const farmerRecords = records.filter((record) => projectIds.has(record.project_id));

      const modal = farmerRecords
        .filter((record) => record.type === "expense")
        .reduce((sum, record) => sum + toNumber(record.amount), 0);

      const masuk = farmerRecords
        .filter((record) => record.type === "income" || record.type === "harvest")
        .reduce((sum, record) => sum + toNumber(record.amount), 0);

      const panenKg = farmerRecords
        .filter((record) => record.type === "harvest")
        .reduce((sum, record) => sum + toNumber(record.quantity), 0);

      return {
        farmer,
        projects: farmerProjects,
        modal,
        masuk,
        panenKg,
      };
    });
  }, [farmers, projects, records]);

  const filteredSummaries = summaries.filter((summary) => {
    const text = `${summary.farmer.name} ${summary.farmer.phone}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const activeFarmers = farmers.filter((farmer) => farmer.status === "aktif").length;
  const selectedSummary = summaries.find((summary) => summary.farmer.id === selectedFarmerId) || null;
  const unassignedProjects = projects.filter((project) => !project.farmer_id);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf5] px-4 text-emerald-950">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-black text-emerald-700">Memeriksa akses admin...</p>
        </div>
      </main>
    );
  }

  if (!isAuthorized) return null;

  return (
    <main className="min-h-screen bg-[#f8faf5] text-emerald-950">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f8faf5] px-4 pb-28 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Admin</p>
            <h1 className="text-2xl font-black tracking-tight text-emerald-950">Kelola Petani</h1>
            <p className="text-sm text-emerald-700">Pantau petani, lahan, dan catatan.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-700 shadow-sm"
              aria-label="Kembali ke aplikasi petani"
            >
              <ArrowLeft size={20} />
            </Link>
            <button
              onClick={logoutAdmin}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-600 shadow-sm"
              aria-label="Keluar admin"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mb-4 grid grid-cols-2 gap-3">
          <StatCard icon={<Users size={18} />} label="Petani" value={farmers.length.toString()} />
          <StatCard icon={<Power size={18} />} label="Aktif" value={activeFarmers.toString()} />
          <StatCard icon={<BarChart3 size={18} />} label="Lahan" value={projects.length.toString()} />
          <StatCard icon={<Eye size={18} />} label="Belum Dipilih" value={unassignedProjects.length.toString()} />
        </section>

        <section className="mb-4 rounded-[28px] border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-black text-emerald-950">Tambah Petani</h2>
              <p className="text-xs text-emerald-600">Cukup nama dan nomor HP dulu.</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nama petani"
              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Nomor HP"
              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400"
            />
            <textarea
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="Catatan singkat, contoh: petani cabai lahan belakang"
              rows={2}
              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400"
            />
            <button
              onClick={addFarmer}
              disabled={saving}
              className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white shadow-sm active:scale-[0.99] disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "+ Simpan Petani"}
            </button>
          </div>
        </section>

        <section className="mb-4 rounded-[28px] border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-emerald-950">Data Petani</h2>
              <p className="text-xs text-emerald-600">Klik Lihat untuk detail lahan.</p>
            </div>
            <button
              onClick={loadAdminData}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
              aria-label="Refresh data"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <label className="mb-3 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-emerald-700">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama / nomor HP"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-emerald-400"
            />
          </label>

          <div className="space-y-3">
            {filteredSummaries.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
                Belum ada petani.
              </div>
            ) : null}

            {filteredSummaries.map((summary) => (
              <article key={summary.farmer.id} className="rounded-3xl border border-emerald-100 bg-[#fbfdf8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-emerald-950">{summary.farmer.name}</h3>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${summary.farmer.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {summary.farmer.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600">{summary.farmer.phone || "Nomor HP belum diisi"}</p>
                    {summary.farmer.note ? <p className="mt-1 text-xs text-emerald-600">{summary.farmer.note}</p> : null}
                  </div>
                  <button
                    onClick={() => setSelectedFarmerId(summary.farmer.id)}
                    className="rounded-2xl bg-emerald-700 px-3 py-2 text-xs font-black text-white"
                  >
                    Lihat
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Lahan" value={summary.projects.length.toString()} />
                  <MiniStat label="Modal" value={formatRupiah(summary.modal)} />
                  <MiniStat label="Masuk" value={formatRupiah(summary.masuk)} />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => toggleFarmerStatus(summary.farmer)}
                    className="flex-1 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
                  >
                    {summary.farmer.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => deleteFarmer(summary.farmer)}
                    className="flex items-center justify-center rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600"
                    aria-label="Hapus petani"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {selectedSummary ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 pb-3">
          <div className="max-h-[82vh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Detail Petani</p>
                <h2 className="text-xl font-black text-emerald-950">{selectedSummary.farmer.name}</h2>
                <p className="text-sm font-semibold text-emerald-600">{selectedSummary.farmer.phone || "Nomor HP belum diisi"}</p>
              </div>
              <button
                onClick={() => setSelectedFarmerId(null)}
                className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700"
              >
                Tutup
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <StatCard label="Total Lahan" value={selectedSummary.projects.length.toString()} />
              <StatCard label="Total Panen" value={`${selectedSummary.panenKg} Kg`} />
              <StatCard label="Modal" value={formatRupiah(selectedSummary.modal)} />
              <StatCard label="Masuk" value={formatRupiah(selectedSummary.masuk)} />
            </div>

            <h3 className="mb-2 font-black text-emerald-950">Lahan Petani</h3>
            <div className="space-y-2">
              {selectedSummary.projects.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  Belum ada lahan yang terhubung ke petani ini.
                </div>
              ) : null}

              {selectedSummary.projects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="font-black text-emerald-950">{project.crop || project.name}</p>
                  <p className="text-xs font-semibold text-emerald-600">{project.location || "Lokasi belum diisi"}</p>
                  <p className="mt-1 text-[11px] font-black uppercase text-emerald-700">{project.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-emerald-700">
        {icon}
        <span className="text-xs font-black uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-black text-emerald-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-2 py-3">
      <p className="text-[10px] font-black uppercase text-emerald-500">{label}</p>
      <p className="truncate text-xs font-black text-emerald-950">{value}</p>
    </div>
  );
}
