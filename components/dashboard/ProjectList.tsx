import type { FarmRecord, Project } from "@/types";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

export function ProjectList({ projects, records, onNewProject, onOpenProject }: { projects: Project[]; records: FarmRecord[]; onNewProject: () => void; onOpenProject: (id: string) => void }) {
  if (projects.length === 0) return <EmptyState onNewProject={onNewProject} />;

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} records={records} onOpen={onOpenProject} />
      ))}
    </div>
  );
}
