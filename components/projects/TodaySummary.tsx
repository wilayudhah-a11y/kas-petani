import type { FarmRecord } from "@/types";
import { formatRupiah, todayISO } from "@/lib/format";
import { typeIcon, typeLabel } from "@/lib/labels";

export function TodaySummary({ records }: { records: FarmRecord[] }) {
  const today = todayISO();
  const todayRecords = records
    .filter((record) => record.record_date === today)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const todayExpense = todayRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + record.amount, 0);

  const latest = todayRecords[0];

  return (
    <section className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Hari Ini</p>
          <h3 className="mt-1 text-lg font-black text-green-950">
            {todayRecords.length === 0 ? "Belum ada aktivitas" : `${todayRecords.length} aktivitas tercatat`}
          </h3>
        </div>
        <div className="rounded-2xl bg-green-50 px-3 py-2 text-right">
          <p className="text-[10px] font-black uppercase text-green-700">Modal Hari Ini</p>
          <p className="text-sm font-black text-green-950">{formatRupiah(todayExpense)}</p>
        </div>
      </div>

      {latest ? (
        <div className="mt-4 rounded-2xl bg-green-50 p-4">
          <p className="text-xs font-black text-green-700">Catatan terakhir</p>
          <div className="mt-2 flex items-start gap-3">
            <span className="text-2xl">{typeIcon[latest.type]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-green-950">{latest.title}</p>
              <p className="text-xs font-bold text-zinc-500">{typeLabel[latest.type]} • {latest.category}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">
          Tekan tombol + CATAT kalau ada beli pupuk, kerja lahan, panen, atau catatan kondisi tanaman hari ini.
        </p>
      )}
    </section>
  );
}
