"use client";

import { phases } from "@/lib/defaults";

export function PhaseStepper({
  value,
  onChange,
}: {
  value: string;
  onChange: (phase: string) => void;
}) {
  const activeIndex = Math.max(0, phases.findIndex((phase) => phase === value));

  return (
    <section className="rounded-[1.75rem] border border-green-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">Fase Tanaman</p>
          <h3 className="mt-1 text-lg font-black text-green-950">{value || "Persiapan"}</h3>
        </div>
        <span className="rounded-2xl bg-green-50 px-3 py-2 text-xs font-black text-green-800">
          Tap ubah
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {phases.map((phase, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <button
              key={phase}
              onClick={() => onChange(phase)}
              className="flex w-full items-center gap-3 text-left active:scale-[0.99]"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                    : isDone
                      ? "bg-green-100 text-green-800"
                      : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {isDone ? "✓" : isActive ? "●" : "○"}
              </span>
              <span className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black ${isActive ? "bg-green-50 text-green-950" : "text-zinc-600"}`}>
                {phase}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
