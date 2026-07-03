import type { FarmRecord, Project } from "@/types";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ProjectList } from "@/components/dashboard/ProjectList";

export function Dashboard({
  projects,
  records,
  onNewProject,
  onOpenProject,
}: {
  projects: Project[];
  records: FarmRecord[];
  onNewProject: () => void;
  onOpenProject: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <SummaryCards projects={projects} records={records} />

      {projects.length > 0 && (
        <button onClick={onNewProject} className="w-full rounded-3xl border-2 border-dashed border-green-300 bg-white p-5 text-left font-black text-green-800">
          + Buat Proyek Tanam
        </button>
      )}

      <ProjectList
        projects={projects}
        records={records}
        onNewProject={onNewProject}
        onOpenProject={onOpenProject}
      />
    </div>
  );
}
