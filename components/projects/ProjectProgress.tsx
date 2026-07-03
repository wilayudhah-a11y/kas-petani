import type { FarmRecord, Project } from "@/types";
import { formatRupiah } from "@/lib/format";
import { statusLabel } from "@/lib/labels";
import { getProjectStats } from "@/lib/stats";
import { hstLabel } from "@/lib/hst";
import { SummaryBox } from "@/components/ui/FormField";

export function ProjectProgress({
  project,
  records,
  compact = false,
}: {
  project: Project;
  records: FarmRecord[];
  compact?: boolean;
}) {
  const stats = getProjectStats(project, records);

  return (
    <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
            {stats.isPlanted ? "Umur Tanaman" : "Status Lahan"}
          </p>
          <h2 className="mt-1 text-lg font-black text-green-950">
            {stats.isPlanted ? hstLabel(stats.age) : "Belum Tanam"}
          </h2>
        </div>
        <div className="rounded-2xl bg-green-50 px-3 py-2 text-right">
          <p className="text-[10px] font-black uppercase text-green-700">Fase</p>
          <p className="text-sm font-black text-green-950">{project.phase}</p>
        </div>
      </div>

      <div className="mt-4 h-3 rounded-full bg-green-100">
        <div className="h-3 rounded-full bg-green-600" style={{ width: `${stats.progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-black text-zinc-500">
        {stats.isPlanted ? (
          <>
            <span>{stats.progress}% dari estimasi</span>
            <span>Sisa ± {stats.remainingDays} hari</span>
          </>
        ) : (
          <>
            <span>HST mulai setelah kegiatan Tanam dicatat</span>
            <span>Estimasi ± {stats.estimateDays} hari</span>
          </>
        )}
      </div>

      {!compact ? (
        <p className="mt-2 text-xs font-bold text-zinc-500">Status: {statusLabel(project.status)}</p>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <SummaryBox label="Modal" value={formatRupiah(stats.totals.expense)} />
        <SummaryBox label="Masuk" value={formatRupiah(stats.totals.income)} />
        <SummaryBox label="Laba" value={formatRupiah(stats.profit)} />
      </div>
    </section>
  );
}
