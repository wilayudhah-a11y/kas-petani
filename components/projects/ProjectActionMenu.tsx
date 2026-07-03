"use client";

import { useState } from "react";
import { Archive, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { ProjectStatus } from "@/types";

export function ProjectActionMenu({
  status,
  onEdit,
  onArchiveToggle,
  onDelete,
}: {
  status: ProjectStatus;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="rounded-2xl bg-white/15 p-3 text-white active:scale-95"
        aria-label="Menu proyek"
      >
        <MoreVertical size={20} />
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-30 w-48 overflow-hidden rounded-3xl border border-green-900/10 bg-white p-2 text-zinc-950 shadow-2xl">
          <button
            onClick={() => run(onEdit)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-green-950 active:bg-green-50"
          >
            <Pencil size={16} />
            Edit Proyek
          </button>
          <button
            onClick={() => run(onArchiveToggle)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-amber-700 active:bg-amber-50"
          >
            <Archive size={16} />
            {status === "arsip" ? "Buka Arsip" : "Arsipkan"}
          </button>
          <button
            onClick={() => run(onDelete)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-red-700 active:bg-red-50"
          >
            <Trash2 size={16} />
            Hapus Proyek
          </button>
        </div>
      ) : null}
    </div>
  );
}
