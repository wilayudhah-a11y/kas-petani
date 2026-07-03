import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-green-950">{label}</span>
      {children}
    </label>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-4 font-bold outline-none focus:border-green-500"
      />
    </Field>
  );
}

export function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-xs text-green-100">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-green-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xs font-black text-green-950">{value}</p>
    </div>
  );
}

export function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-xl py-3 text-xs font-black ${active ? "bg-white text-green-900 shadow-sm" : "text-green-700"}`}>
      {children}
    </button>
  );
}

export function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
      <p className="font-bold text-zinc-600">{label}</p>
      <p className="font-black text-green-950">{value}</p>
    </div>
  );
}
