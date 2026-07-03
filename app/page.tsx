"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppHeader, MobileShell } from "@/components/layout/AppHeader";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { QuickAddForm } from "@/components/records/QuickAddForm";
import { Reports } from "@/components/reports/Reports";
import { useFarmStore } from "@/hooks/useFarmStore";

export default function HomePage() {
  const farm = useFarmStore();

  return (
    <MobileShell>
      <AppHeader onQuickAdd={() => farm.openQuickAdd()} />

      <section className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
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
          <ProjectForm onCancel={farm.openHome} onSave={farm.upsertProject} />
        )}

        {farm.screen === "editProject" && farm.activeProject && (
          <ProjectForm
            initialProject={farm.activeProject}
            onCancel={() => farm.openProject(farm.activeProject!.id)}
            onSave={farm.upsertProject}
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
