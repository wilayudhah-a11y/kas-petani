import { Copy, Pencil, Trash2 } from "lucide-react";
import type { FarmRecord, Project } from "@/types";
import { formatRupiah, todayISO } from "@/lib/format";
import { typeIcon, typeLabel } from "@/lib/labels";
import { hstFromDate, hstLabel } from "@/lib/hst";

function recordTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function recordDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date || "Tanggal tidak jelas";
  return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function isOldRecordDate(date: string) {
  return Boolean(date) && date < todayISO();
}

export function TimelineItem({
  project,
  record,
  onEdit,
  onDelete,
  onCopy,
}: {
  project: Project;
  record: FarmRecord;
  onEdit: (record: FarmRecord) => void;
  onDelete: (recordId: string) => void;
  onCopy: (record: FarmRecord) => void;
}) {
  const recordHst = hstFromDate(project.planting_date, record.record_date);
  const isOld = isOldRecordDate(record.record_date);

  return (
    <div className="relative rounded-[1.5rem] bg-green-50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-16 shrink-0 text-center">
          <p className="text-[11px] font-black text-green-700">{recordTime(record.created_at)}</p>
          <p className="mt-1 rounded-full bg-white px-2 py-1 text-[10px] font-black text-green-800 shadow-sm">{hstLabel(recordHst)}</p>
          <p className="mt-1 text-[10px] font-black text-zinc-500">{recordDateLabel(record.record_date)}</p>
          <span className="mx-auto mt-2 grid h-10 w-10 place-items-center rounded-full bg-white text-2xl shadow-sm">
            {typeIcon[record.type]}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-green-700">
                  {typeLabel[record.type]} • {record.category}
                </p>
                {isOld ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">
                    📚 Catatan Lama
                  </span>
                ) : null}
              </div>
              <h4 className="mt-1 font-black text-green-950">{record.title}</h4>
            </div>
            {record.amount > 0 && <p className="shrink-0 text-sm font-black text-green-900">{formatRupiah(record.amount)}</p>}
          </div>
          {record.quantity ? <p className="mt-1 text-sm font-bold text-zinc-600">{record.quantity} {record.unit} × {formatRupiah(record.price_per_unit || 0)}</p> : null}
          {record.description ? <p className="mt-2 text-sm leading-relaxed text-zinc-600">{record.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => onEdit(record)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-green-800 shadow-sm"><Pencil size={13} className="inline" /> Edit</button>
            <button onClick={() => onCopy(record)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-green-800 shadow-sm"><Copy size={13} className="inline" /> Salin</button>
            <button onClick={() => onDelete(record.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 shadow-sm"><Trash2 size={13} className="inline" /> Hapus</button>
          </div>
        </div>
      </div>
    </div>
  );
}
