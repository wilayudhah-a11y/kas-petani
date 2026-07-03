"use client";

import type { FarmRecord, Project } from "@/types";
import { formatRupiah } from "@/lib/format";
import { cropEmoji } from "@/lib/labels";
import { makeCategoryTotals } from "@/lib/calc";
import { getDashboardStats, getProjectStats } from "@/lib/stats";
import { hstLabel } from "@/lib/hst";
import { ReportRow } from "@/components/ui/FormField";

function kg(value: number) {
  return `${Number(value || 0).toLocaleString("id-ID")} kg`;
}

export function Reports({ projects, records, onOpenProject }: { projects: Project[]; records: FarmRecord[]; onOpenProject: (id: string) => void }) {
  const dashboard = getDashboardStats(projects, records);
  const categoryTotals = makeCategoryTotals(records);
  const harvestRecords = records.filter((item) => item.type === "harvest");
  const totalKg = harvestRecords.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const avgPrice = totalKg > 0 ? Math.round(dashboard.totals.income / totalKg) : 0;
  const activeProjects = projects.filter((item) => item.status !== "arsip");
  const archivedProjects = projects.filter((item) => item.status === "arsip");

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] bg-green-800 p-5 text-white shadow-lg shadow-green-900/15">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-200">Laporan</p>
        <h1 className="mt-2 text-2xl font-black">Ringkasan Kebun</h1>
        <p className="mt-1 text-sm font-bold text-green-100">Modal, hasil panen, dan untung/rugi semua lahan.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="text-xs font-bold text-green-100">Total Modal</p>
            <p className="mt-1 text-lg font-black">{formatRupiah(dashboard.totals.expense)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="text-xs font-bold text-green-100">Uang Masuk</p>
            <p className="mt-1 text-lg font-black">{formatRupiah(dashboard.totals.income)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="text-xs font-bold text-green-100">Untung/Rugi</p>
            <p className="mt-1 text-lg font-black">{formatRupiah(dashboard.profit)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4">
            <p className="text-xs font-bold text-green-100">Total Panen</p>
            <p className="mt-1 text-lg font-black">{kg(totalKg)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-green-950">Laporan Singkat</h2>
        <div className="mt-4 space-y-3">
          <ReportRow label="Lahan Aktif" value={`${activeProjects.length}`} />
          <ReportRow label="Lahan Selesai/Arsip" value={`${archivedProjects.length}`} />
          <ReportRow label="Rata-rata Harga Panen" value={`${formatRupiah(avgPrice)}/kg`} />
        </div>
      </section>

      <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-green-950">Per Lahan</h2>
        <div className="mt-4 space-y-3">
          {projects.length === 0 ? (
            <p className="rounded-3xl bg-green-50 p-5 text-center text-sm font-bold text-zinc-500">Belum ada lahan.</p>
          ) : (
            projects.map((project) => {
              const stats = getProjectStats(project, records);
              return (
                <button key={project.id} onClick={() => onOpenProject(project.id)} className="w-full rounded-3xl bg-green-50 p-4 text-left active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black uppercase text-green-950">{cropEmoji(project.crop)} {project.name}</p>
                      <p className="mt-1 text-xs font-bold text-zinc-500">{hstLabel(stats.age)} • {project.location || "Lokasi belum diisi"}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-green-800 shadow-sm">{project.status}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-2xl bg-white p-3"><p className="text-zinc-500">Modal</p><p className="font-black text-green-950">{formatRupiah(stats.totals.expense)}</p></div>
                    <div className="rounded-2xl bg-white p-3"><p className="text-zinc-500">Masuk</p><p className="font-black text-green-950">{formatRupiah(stats.totals.income)}</p></div>
                    <div className="rounded-2xl bg-white p-3"><p className="text-zinc-500">Untung</p><p className="font-black text-green-950">{formatRupiah(stats.profit)}</p></div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-green-950">Modal per Kategori</h2>
        <div className="mt-4 space-y-3">
          {categoryTotals.filter((item) => item.type === "expense").length === 0 ? (
            <p className="rounded-3xl bg-green-50 p-5 text-center text-sm font-bold text-zinc-500">Belum ada catatan modal.</p>
          ) : (
            categoryTotals.filter((item) => item.type === "expense").map((item) => (
              <ReportRow key={item.key} label={item.category} value={formatRupiah(item.amount)} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
