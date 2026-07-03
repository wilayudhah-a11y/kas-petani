import type { FarmRecord, Project } from "@/types";

const PROJECTS_KEY = "kas_petani_projects";
const RECORDS_KEY = "kas_petani_records";

export function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getRecords(): FarmRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecords(records: FarmRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}
