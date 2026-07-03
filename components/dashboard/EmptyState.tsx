export function EmptyState({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="rounded-3xl border border-green-900/10 bg-white p-6 text-center shadow-sm">
      <div className="text-5xl">🌱</div>
      <h2 className="mt-3 text-lg font-black text-green-950">Belum ada proyek</h2>
      <p className="mt-1 text-sm text-zinc-600">Buat proyek cabai, timun, atau tanaman lain dulu.</p>
      <button onClick={onNewProject} className="mt-5 w-full rounded-2xl bg-green-700 px-4 py-4 font-black text-white">
        + Buat Proyek Pertama
      </button>
    </div>
  );
}
