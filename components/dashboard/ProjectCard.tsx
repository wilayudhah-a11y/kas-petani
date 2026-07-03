import type { FarmRecord, Project } from "@/types";
import { formatRupiah } from "@/lib/format";
import { cropEmoji } from "@/lib/labels";
import { getProjectStats } from "@/lib/stats";
import { hstLabel } from "@/lib/hst";
import { MiniStat } from "@/components/ui/FormField";

export function ProjectCard({ project, records, onOpen }: { project: Project; records: FarmRecord[]; onOpen: (id: string) => void }) {
  const stats = getProjectStats(project, records);

  return (
    <button onClick={() => onOpen(project.id)} className="w-full rounded-3xl border border-green-900/10 bg-white p-5 text-left shadow-sm active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black uppercase text-green-950">{cropEmoji(project.crop)} {project.name}</h2>
          <p className="text-sm text-zinc-500">{project.crop} • {hstLabel(stats.age)}</p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">{project.phase}</span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-green-100">
        <div className="h-2 rounded-full bg-green-600" style={{ width: `${stats.progress}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-zinc-500">{stats.isPlanted ? `Progress ${stats.progress}% dari estimasi` : "Masih persiapan, HST belum mulai"}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Modal" value={formatRupiah(stats.totals.expense)} />
        <MiniStat label="Masuk" value={formatRupiah(stats.totals.income)} />
        <MiniStat label="Laba" value={formatRupiah(stats.profit)} />
      </div>
    </button>
  );
}
