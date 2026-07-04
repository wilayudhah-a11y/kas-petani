"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppHeader, MobileShell } from "@/components/layout/AppHeader";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { QuickAddForm } from "@/components/records/QuickAddForm";
import { Reports } from "@/components/reports/Reports";
import { useFarmStore } from "@/hooks/useFarmStore";
import { clearFarmerSession, getFarmerSession, isAdminSession } from "@/lib/farmer-auth";
import type { FarmerSession, ProjectDraft } from "@/types";

function LoginGate() {
  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-8 text-emerald-950">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center">
        <div className="rounded-[32px] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-3xl">🌱</div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">KAS PETANI</p>
          <h1 className="mt-2 text-2xl font-black">Masuk dulu, boss</h1>
          <p className="mt-2 text-sm font-bold text-zinc-500">Petani masuk pakai nomor HP dan PIN dari admin.</p>
          <div className="mt-6 grid gap-3">
            <Link href="/login" className="rounded-2xl bg-emerald-600 py-4 font-black text-white">Masuk Petani</Link>
            <Link href="/admin/login" className="rounded-2xl bg-emerald-50 py-4 font-black text-emerald-700">Masuk Admin</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<FarmerSession | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getFarmerSession());
    setAdminMode(isAdminSession());
    setReady(true);
  }, []);

  const farmerId = adminMode ? undefined : session?.id;
  const farm = useFarmStore(farmerId);

  const ownerName = adminMode ? "Admin" : session?.name || "Petani";

  const handleSaveProject = (project: ProjectDraft) => {
    farm.upsertProject({
      ...project,
      farmer_id: project.farmer_id || session?.id,
    });
  };

  function logout() {
    clearFarmerSession();
    router.replace("/login");
  }

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8faf5] font-black text-emerald-900">Memuat...</main>;
  }

  if (!session && !adminMode) return <LoginGate />;

  return (
    <MobileShell>
      <div className="px-4 pt-4">
        <div className="rounded-[28px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{adminMode ? "Mode Admin" : "Petani"}</p>
              <h1 className="text-xl font-black text-emerald-950">Halo, {ownerName}</h1>
            </div>
            <button onClick={logout} className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-black text-red-600">
              Keluar
            </button>
          </div>
        </div>
      </div>

      <AppHeader onQuickAdd={() => farm.openQuickAdd()} />

      <section className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {farm.error ? <div className="mb-4 rounded-3xl bg-red-50 p-4 text-sm font-bold text-red-700">{farm.error}</div> : null}

        {farm.screen === "home" && (
          <Dashboard
            projects={farm.projects}
            records={farm.records}
            onNewProject={farm.openNewProject}
            onOpenProject={farm.openProject}
          />
        )}

        {farm.screen === "reports" && (
          <Reports
            projects={farm.projects}
            records={farm.records}
            onOpenProject={farm.openProject}
          />
        )}

        {farm.screen === "newProject" && (
          <ProjectForm onCancel={farm.openHome} onSave={handleSaveProject} />
        )}

        {farm.screen === "editProject" && farm.activeProject && (
          <ProjectForm
            initialProject={farm.activeProject}
            onCancel={() => farm.openProject(farm.activeProject!.id)}
            onSave={handleSaveProject}
          />
        )}

        {farm.screen === "quickAdd" && (
          <QuickAddForm
            projects={farm.projects}
            defaultProjectId={farm.activeProject?.id || ""}
            initialType={farm.quickAddType}
            onCancel={farm.activeProject ? () => farm.openProject(farm.activeProject!.id) : farm.openHome}
            onNeedProject={farm.openNewProject}
            onSave={farm.addRecord}
          />
        )}

        {farm.screen === "editRecord" && farm.editingRecord && (
          <QuickAddForm
            projects={farm.projects}
            defaultProjectId={farm.editingRecord.project_id}
            initialRecord={farm.editingRecord}
            onCancel={() => farm.openProject(farm.editingRecord!.project_id)}
            onNeedProject={farm.openNewProject}
            onSave={farm.updateRecord}
          />
        )}

        {farm.screen === "project" && farm.activeProject && (
          <ProjectDetail
            project={farm.activeProject}
            records={farm.activeProjectRecords}
            onBack={farm.openHome}
            onEdit={farm.openEditProject}
            onDelete={() => farm.deleteProject(farm.activeProject!.id)}
            onChangePhase={(phase) => farm.updateProjectPhase(farm.activeProject!.id, phase)}
            onChangeStatus={(status) => farm.updateProjectStatus(farm.activeProject!.id, status)}
            onQuickAdd={(type) => farm.openQuickAdd(farm.activeProject!.id, type)}
            onEditRecord={farm.openEditRecord}
            onDeleteRecord={farm.deleteRecord}
            onCopyRecord={farm.duplicateRecord}
          />
        )}
      </section>

      <BottomNav
        onHome={farm.openHome}
        onQuickAdd={() => farm.openQuickAdd()}
        onReports={farm.openReports}
        onNewProject={farm.openNewProject}
      />
    </MobileShell>
  );
}
