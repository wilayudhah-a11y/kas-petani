"use client";

import type { FarmRecord, Project } from "@/types";
import { hstFromDate, hstLabel } from "@/lib/hst";
import { TimelineItem } from "@/components/records/TimelineItem";

function groupLabel(date: string, project: Project) {
  const today = new Date();
  const target = new Date(`${date}T00:00:00`);
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const hst = hstLabel(hstFromDate(project.planting_date, date));

  if (date === todayKey) return `Hari Ini • ${hst}`;
  if (date === yesterdayKey) return `Kemarin • ${hst}`;

  return `${target.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} • ${hst}`;
}

export function TimelineFeed({
  project,
  records,
  onEdit,
  onDelete,
  onCopy,
}: {
  project: Project;
  records: FarmRecord[];
  onEdit: (record: FarmRecord) => void;
  onDelete: (recordId: string) => void;
  onCopy: (record: FarmRecord) => void;
}) {
  const sorted = [...records].sort((a, b) => {
    const byDate = b.record_date.localeCompare(a.record_date);
    if (byDate !== 0) return byDate;
    return b.created_at.localeCompare(a.created_at);
  });

  const groups = sorted.reduce<Record<string, FarmRecord[]>>((acc, record) => {
    acc[record.record_date] ||= [];
    acc[record.record_date].push(record);
    return acc;
  }, {});

  if (sorted.length === 0) {
    return (
      <div className="rounded-3xl bg-green-50 p-5 text-center text-sm font-bold text-zinc-500">
        Belum ada catatan. Tekan + CATAT untuk mulai mencatat modal, kerja lahan, panen, atau kondisi tanaman.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([date, items]) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-green-600 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white">
              {groupLabel(date, project)}
            </span>
            <span className="h-px flex-1 bg-green-100" />
          </div>
          <div className="space-y-3">
            {items.map((record) => (
              <TimelineItem key={record.id} project={project} record={record} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
