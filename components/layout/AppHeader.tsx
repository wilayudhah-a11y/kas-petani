import type { ReactNode } from "react";

export function AppHeader({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-green-900/10 bg-white/95 px-4 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">🌱 KAS PETANI</p>
          <h1 className="text-xl font-black text-green-950">Selamat datang 👋</h1>
        </div>
        <button
          onClick={onQuickAdd}
          className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 active:scale-95"
        >
          + CATAT
        </button>
      </div>
    </header>
  );
}

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-200 text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#FAFAFA] shadow-2xl">
        {children}
      </div>
    </main>
  );
}
