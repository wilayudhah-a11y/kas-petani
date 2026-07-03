import type { FarmRecord, FarmRecordDraft, Project, ProjectDraft, ProjectStatus } from "@/types";
import { getProjects, getRecords, saveProjects, saveRecords, uid } from "@/lib/storage";
import { hasSupabase, supabase } from "@/lib/supabase";

export type FarmSource = "supabase" | "local";
export type FarmData = {
  source: FarmSource;
  projects: Project[];
  records: FarmRecord[];
};

function messageFromError(error: unknown) {
  if (!error) return "Terjadi kesalahan tidak dikenal.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const item = error as { message?: string; details?: string; hint?: string; code?: string };
    return [item.message, item.details, item.hint, item.code].filter(Boolean).join(" | ") || JSON.stringify(error);
  }
  return String(error);
}

function throwRepositoryError(error: unknown, fallback: string): never {
  const message = messageFromError(error);
  throw new Error(message === "{}" ? fallback : message);
}

function normalizeProject(row: any): Project {
  return {
    id: String(row.id),
    name: row.name,
    crop: row.crop,
    variety: row.variety || undefined,
    location: row.location || undefined,
    land_size: row.land_size === null || row.land_size === undefined ? undefined : String(row.land_size),
    land_unit: row.land_unit || "m²",
    start_date: row.start_date,
    planting_date: row.planting_date || undefined,
    harvest_estimate_days: Number(row.harvest_estimate_days || 90),
    target_harvest_date: row.target_harvest_date || undefined,
    phase: row.phase || "Persiapan Lahan",
    status: (row.status || "berjalan") as ProjectStatus,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

function normalizeRecord(row: any): FarmRecord {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    type: row.type,
    category: row.category || "Lainnya",
    title: row.title,
    description: row.description || undefined,
    amount: Number(row.amount || 0),
    quantity: row.quantity === null || row.quantity === undefined ? undefined : Number(row.quantity),
    unit: row.unit || undefined,
    price_per_unit: row.price_per_unit === null || row.price_per_unit === undefined ? undefined : Number(row.price_per_unit),
    record_date: row.record_date,
    photo_url: row.photo_url || undefined,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

function projectInsertPayload(project: ProjectDraft) {
  return {
    name: project.name,
    crop: project.crop,
    variety: project.variety || null,
    location: project.location || null,
    land_size: project.land_size ? Number(project.land_size) : null,
    land_unit: project.land_unit || "m²",
    start_date: project.start_date,
    planting_date: project.planting_date || null,
    harvest_estimate_days: Number(project.harvest_estimate_days || 90),
    target_harvest_date: project.target_harvest_date || null,
    phase: project.phase || "Persiapan Lahan",
    status: project.status || "berjalan",
  };
}

function projectUpdatePayload(project: ProjectDraft) {
  return {
    ...projectInsertPayload(project),
    updated_at: new Date().toISOString(),
  };
}

function recordInsertPayload(record: FarmRecordDraft) {
  return {
    project_id: record.project_id,
    type: record.type,
    category: record.category || "Lainnya",
    title: record.title,
    description: record.description || null,
    amount: Number(record.amount || 0),
    quantity: record.quantity ?? null,
    unit: record.unit || null,
    price_per_unit: record.price_per_unit ?? null,
    record_date: record.record_date,
    photo_url: record.photo_url || null,
  };
}

function recordUpdatePayload(record: FarmRecordDraft) {
  return {
    ...recordInsertPayload(record),
    updated_at: new Date().toISOString(),
  };
}

function createLocalProject(project: ProjectDraft): Project {
  return normalizeProject({
    ...projectInsertPayload(project),
    id: project.id || uid("project"),
    created_at: project.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

function createLocalRecord(record: FarmRecordDraft): FarmRecord {
  return normalizeRecord({
    ...recordInsertPayload(record),
    id: record.id || uid("record"),
    created_at: record.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function listFarmData(): Promise<FarmData> {
  if (!hasSupabase || !supabase) {
    return {
      source: "local",
      projects: getProjects(),
      records: getRecords(),
    };
  }

  const [projectsRes, recordsRes] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase
      .from("records")
      .select("*")
      .order("record_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (projectsRes.error) throwRepositoryError(projectsRes.error, "Gagal membaca projects dari Supabase.");
  if (recordsRes.error) throwRepositoryError(recordsRes.error, "Gagal membaca records dari Supabase.");

  const projects = (projectsRes.data || []).map(normalizeProject);
  const records = (recordsRes.data || []).map(normalizeRecord);

  saveProjects(projects);
  saveRecords(records);

  return {
    source: "supabase",
    projects,
    records,
  };
}

export async function createProject(project: ProjectDraft): Promise<Project> {
  if (!hasSupabase || !supabase) {
    const saved = createLocalProject(project);
    saveProjects([saved, ...getProjects()]);
    return saved;
  }

  const { data, error } = await supabase.from("projects").insert(projectInsertPayload(project)).select("*").single();
  if (error) throwRepositoryError(error, "Gagal membuat proyek di Supabase.");
  return normalizeProject(data);
}

export async function updateProject(projectId: string, project: ProjectDraft): Promise<Project> {
  if (!hasSupabase || !supabase) {
    const saved = normalizeProject({ ...projectUpdatePayload(project), id: projectId, created_at: project.created_at || new Date().toISOString() });
    saveProjects(getProjects().map((item) => (item.id === projectId ? saved : item)));
    return saved;
  }

  const { data, error } = await supabase
    .from("projects")
    .update(projectUpdatePayload(project))
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) throwRepositoryError(error, "Gagal update proyek di Supabase.");
  return normalizeProject(data);
}

export async function deleteProject(projectId: string): Promise<void> {
  if (!hasSupabase || !supabase) {
    saveRecords(getRecords().filter((item) => item.project_id !== projectId));
    saveProjects(getProjects().filter((item) => item.id !== projectId));
    return;
  }

  const recordsDelete = await supabase.from("records").delete().eq("project_id", projectId);
  if (recordsDelete.error) throwRepositoryError(recordsDelete.error, "Gagal hapus catatan proyek.");

  const projectDelete = await supabase.from("projects").delete().eq("id", projectId);
  if (projectDelete.error) throwRepositoryError(projectDelete.error, "Gagal hapus proyek.");
}

export async function createRecord(record: FarmRecordDraft): Promise<FarmRecord> {
  if (!hasSupabase || !supabase) {
    const saved = createLocalRecord(record);
    saveRecords([saved, ...getRecords()]);
    return saved;
  }

  const { data, error } = await supabase.from("records").insert(recordInsertPayload(record)).select("*").single();
  if (error) throwRepositoryError(error, "Gagal membuat catatan di Supabase.");
  return normalizeRecord(data);
}

export async function updateRecord(recordId: string, record: FarmRecordDraft): Promise<FarmRecord> {
  if (!hasSupabase || !supabase) {
    const saved = normalizeRecord({ ...recordUpdatePayload(record), id: recordId, created_at: record.created_at || new Date().toISOString() });
    saveRecords(getRecords().map((item) => (item.id === recordId ? saved : item)));
    return saved;
  }

  const { data, error } = await supabase
    .from("records")
    .update(recordUpdatePayload(record))
    .eq("id", recordId)
    .select("*")
    .single();

  if (error) throwRepositoryError(error, "Gagal update catatan di Supabase.");
  return normalizeRecord(data);
}

export async function deleteRecord(recordId: string): Promise<void> {
  if (!hasSupabase || !supabase) {
    saveRecords(getRecords().filter((item) => item.id !== recordId));
    return;
  }

  const { error } = await supabase.from("records").delete().eq("id", recordId);
  if (error) throwRepositoryError(error, "Gagal hapus catatan.");
}
