"use client";

import { useState } from "react";
import type { FarmRecord, Project, ProjectStatus, RecordType } from "@/types";
import { makeCategoryTotals, makeTotals } from "@/lib/calc";
import { formatRupiah } from "@/lib/format";
import { cropEmoji, typeLabel } from "@/lib/labels";
import { ReportRow, TabButton } from "@/components/ui/FormField";
import { TimelineFeed } from "@/components/records/TimelineFeed";
import { RecordTypeSheet } from "@/components/records/RecordTypeSheet";
import { PhaseStepper } from "@/components/projects/PhaseStepper";
import { ProjectProgress } from "@/components/projects/ProjectProgress";
import { ProjectActionMenu } from "@/components/projects/ProjectActionMenu";
import { TodaySummary } from "@/components/projects/TodaySummary";
import { getProjectStats } from "@/lib/stats";
import { hstLabel } from "@/lib/hst";

export function ProjectDetail({
  project,
  records,
  onBack,
  onEdit,
  onDelete,
  onChangePhase,
  onQuickAdd,
  onChangeStatus,
  onEditRecord,
  onDeleteRecord,
  onCopyRecord,
}: {
  project: Project;
  records: FarmRecord[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangePhase: (phase: string) => void;
  onChangeStatus: (status: ProjectStatus) => void;
  onQuickAdd: (type?: RecordType) => void;
  onEditRecord: (record: FarmRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onCopyRecord: (record: FarmRecord) => void;
}) {
  const [tab, setTab] = useState<"timeline" | "finance" | "report">("timeline");
  const [sheetOpen, setSheetOpen] = useState(false);
  const totals = makeTotals(records);
  const byCategory = makeCategoryTotals(records);
  const stats = getProjectStats(project, records);

  const archiveToggle = () => onChangeStatus(project.status === "arsip" ? "berjalan" : "arsip");

  return (
    <div className="space-y-4">
      <section className="rounded-b-[2rem] bg-green-800 px-5 pb-6 pt-4 text-white shadow-lg shadow-green-900/15 -mx-4 -mt-4">
        <div className="flex items-center justify-between gap-3">
          <button onClick={onBack} className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-black active:scale-95">
            ← Home
          </button>
          <ProjectActionMenu
            status={project.status}
            onEdit={onEdit}
            onArchiveToggle={archiveToggle}
            onDelete={onDelete}
          />
        </div>

        <div className="mt-5 flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white/15 text-4xl">
            {cropEmoji(project.crop)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-200">Musim Tanam</p>
            <h1 className="mt-1 text-2xl font-black uppercase leading-tight">{project.name}</h1>
            <p className="mt-1 text-sm font-bold text-green-100">
              {project.location || "Lokasi belum diisi"} • {hstLabel(stats.age)}
            </p>
          </div>
        </div>
      </section>

      <ProjectProgress project={project} records={records} compact />

      <TodaySummary records={records} />

      <button
        onClick={() => setSheetOpen(true)}
        className="w-full rounded-[1.75rem] bg-green-600 p-5 text-center text-lg font-black text-white shadow-lg shadow-green-900/20 active:scale-[0.99]"
      >
        + CATAT UNTUK LAHAN INI
      </button>

      <PhaseStepper value={project.phase} onChange={onChangePhase} />

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-green-50 p-1">
        <TabButton active={tab === "timeline"} onClick={() => setTab("timeline")}>Timeline</TabButton>
        <TabButton active={tab === "finance"} onClick={() => setTab("finance")}>Keuangan</TabButton>
        <TabButton active={tab === "report"} onClick={() => setTab("report")}>Laporan</TabButton>
      </div>

      {tab === "timeline" && (
        <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Riwayat</p>
              <h3 className="mt-1 text-lg font-black text-green-950">Riwayat Lahan</h3>
            </div>
            <span className="rounded-2xl bg-green-50 px-3 py-2 text-xs font-black text-green-800">{records.length} catatan</span>
          </div>
          <div className="mt-4">
            <TimelineFeed project={project} records={records} onEdit={onEditRecord} onDelete={onDeleteRecord} onCopy={onCopyRecord} />
          </div>
        </section>
      )}

      {tab === "finance" && (
        <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
          <h3 className="font-black text-green-950">Keuangan per Kategori</h3>
          <div className="mt-4 space-y-3">
            {byCategory.length === 0 ? <p className="text-sm text-zinc-500">Belum ada data keuangan.</p> : byCategory.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
                <div>
                  <p className="font-black text-green-950">{item.category}</p>
                  <p className="text-xs font-bold text-zinc-500">{typeLabel[item.type]}</p>
                </div>
                <p className="font-black text-green-900">{formatRupiah(item.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "report" && (
        <section className="space-y-3">
          <div className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
            <h3 className="font-black text-green-950">Ringkasan Musim</h3>
            <div className="mt-4 space-y-3">
              <ReportRow label="Total Modal" value={formatRupiah(totals.expense)} />
              <ReportRow label="Total Pemasukan" value={formatRupiah(totals.income)} />
              <ReportRow label="Untung/Rugi" value={formatRupiah(stats.profit)} />
              <ReportRow label="Total Panen" value={`${stats.totalKg} kg`} />
              <ReportRow label="Rata-rata Harga" value={formatRupiah(stats.avgPrice) + "/kg"} />
            </div>
          </div>
        </section>
      )}

      <RecordTypeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={(type) => {
          setSheetOpen(false);
          onQuickAdd(type);
        }}
      />
    </div>
  );
}
