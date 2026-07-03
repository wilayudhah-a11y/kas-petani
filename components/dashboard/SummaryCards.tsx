import type { FarmRecord, Project } from "@/types";
import { formatRupiah } from "@/lib/format";
import { getDashboardStats } from "@/lib/stats";
import { SummaryBox } from "@/components/ui/FormField";

export function SummaryCards({ projects, records }: { projects: Project[]; records: FarmRecord[] }) {
  const stats = getDashboardStats(projects, records);

  return (
    <div className="rounded-3xl bg-green-800 p-5 text-white shadow-lg shadow-green-900/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-green-100">Ringkasan semua proyek</p>
          <h2 className="mt-1 text-xl font-black">{stats.activeProjects} Proyek Aktif</h2>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
          Arsip {stats.archivedProjects}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <SummaryBox label="Modal" value={formatRupiah(stats.totals.expense)} />
        <SummaryBox label="Masuk" value={formatRupiah(stats.totals.income)} />
        <SummaryBox label="Laba" value={formatRupiah(stats.profit)} />
      </div>
    </div>
  );
}
