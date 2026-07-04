import type { FarmRecord, FarmRecordDraft, Project, ProjectDraft, ProjectStatus } from "@/types";
import * as repository from "@/lib/farm-repository";

export async function loadFarmData(farmerId?: string) {
  return repository.listFarmData(farmerId);
}

export async function saveProject(project: ProjectDraft): Promise<Project> {
  if (project.id) return repository.updateProject(project.id, project);
  return repository.createProject(project);
}

export async function removeProject(projectId: string) {
  return repository.deleteProject(projectId);
}

export async function changeProjectPhase(project: Project, phase: string) {
  return saveProject({ ...project, phase });
}

export async function changeProjectStatus(project: Project, status: ProjectStatus) {
  return saveProject({ ...project, status });
}

export async function saveRecord(record: FarmRecordDraft): Promise<FarmRecord> {
  if (record.id) return repository.updateRecord(record.id, record);
  return repository.createRecord(record);
}

export async function removeRecord(recordId: string) {
  return repository.deleteRecord(recordId);
}

export function duplicateRecordDraft(record: FarmRecord): FarmRecordDraft {
  return {
    project_id: record.project_id,
    type: record.type,
    category: record.category,
    title: `${record.title} (salinan)`,
    description: record.description,
    amount: record.amount,
    quantity: record.quantity,
    unit: record.unit,
    price_per_unit: record.price_per_unit,
    record_date: record.record_date,
    photo_url: record.photo_url,
  };
}
