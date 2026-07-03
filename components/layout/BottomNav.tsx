import { BarChart3, Home, Plus, Sprout } from "lucide-react";

export function BottomNav({
  onHome,
  onQuickAdd,
  onReports,
  onNewProject,
}: {
  onHome: () => void;
  onQuickAdd: () => void;
  onReports: () => void;
  onNewProject: () => void;
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-4 border-t border-green-900/10 bg-white px-3 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
      <button onClick={onHome} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-green-900">
        <Home size={20} /> Home
      </button>
      <button onClick={onQuickAdd} className="-mt-7 flex flex-col items-center gap-1 text-xs font-black text-green-900">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-green-600 text-white shadow-xl shadow-green-900/25">
          <Plus size={30} />
        </span>
        Catat
      </button>
      <button onClick={onReports} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-green-900">
        <BarChart3 size={20} /> Laporan
      </button>
      <button onClick={onNewProject} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-green-900">
        <Sprout size={20} /> Lahan
      </button>
    </nav>
  );
}
