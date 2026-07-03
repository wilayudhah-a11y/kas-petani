"use client";

import type { RecordType } from "@/types";
import { typeIcon, typeLabel } from "@/lib/labels";

const actions: RecordType[] = ["expense", "income", "harvest", "activity", "note"];

export function RecordTypeSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: RecordType) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4 pb-4" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl shadow-black/20"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">Tambah Catatan</p>
            <h3 className="mt-1 text-xl font-black text-green-950">Mau catat apa?</h3>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-black text-zinc-700">
            Batal
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {actions.slice(0, 4).map((type) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="min-h-24 rounded-3xl bg-green-50 p-4 text-left font-black text-green-950 active:scale-[0.98]"
            >
              <span className="block text-3xl">{typeIcon[type]}</span>
              <span className="mt-2 block text-base">{typeLabel[type]}</span>
            </button>
          ))}
          <button
            onClick={() => onSelect("note")}
            className="col-span-2 flex items-center gap-4 rounded-3xl bg-green-600 p-4 text-left font-black text-white shadow-lg shadow-green-900/20 active:scale-[0.98]"
          >
            <span className="text-3xl">{typeIcon.note}</span>
            <span className="text-base">Catatan kondisi tanaman</span>
          </button>
        </div>
      </div>
    </div>
  );
}
