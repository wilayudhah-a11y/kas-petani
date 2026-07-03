"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FarmRecord, FarmRecordDraft, Project, ProjectDraft, ProjectStatus, RecordType } from "@/types";
import { changeProjectPhase, changeProjectStatus, duplicateRecordDraft, loadFarmData, removeProject, removeRecord, saveProject, saveRecord } from "@/lib/farm-db";
import { saveProjects, saveRecords } from "@/lib/storage";

export type AppScreen =
  | "home"
  | "newProject"
  | "editProject"
  | "quickAdd"
  | "editRecord"
  | "project"
  | "reports";

function isPlantingRecord(record: FarmRecordDraft | FarmRecord) {
  const text = `${record.category || ""} ${record.title || ""}`.toLowerCase();
  return record.type === "activity" && text.includes("tanam");
}

export function useFarmStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [screen, setScreen] = useState<AppScreen>("home");
  const [activeProjectId, setActiveProjectId] = useState("");
  const [editingRecord, setEditingRecord] = useState<FarmRecord | null>(null);
  const [quickAddType, setQuickAddType] = useState<RecordType | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataSource, setDataSource] = useState<"supabase" | "local">("local");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await loadFarmData();
      setProjects(data.projects);
      setRecords(data.records);
      setDataSource(data.source);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal membaca data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeProject = useMemo(
    () => projects.find((item) => item.id === activeProjectId) || projects[0],
    [projects, activeProjectId]
  );

  const activeProjectRecords = useMemo(
    () => records.filter((item) => item.project_id === activeProject?.id),
    [records, activeProject?.id]
  );

  function persistProjects(next: Project[]) {
    setProjects(next);
    saveProjects(next);
  }

  function persistRecords(next: FarmRecord[]) {
    setRecords(next);
    saveRecords(next);
  }

  function openHome() {
    setScreen("home");
  }

  function openNewProject() {
    setScreen("newProject");
  }

  function openReports() {
    setScreen("reports");
  }

  function openQuickAdd(projectId?: string, type?: RecordType) {
    if (projectId) setActiveProjectId(projectId);
    setQuickAddType(type);
    setEditingRecord(null);
    setScreen("quickAdd");
  }

  function openProject(projectId: string) {
    setActiveProjectId(projectId);
    setScreen("project");
  }

  function openEditProject() {
    setScreen("editProject");
  }

  function openEditRecord(record: FarmRecord) {
    setEditingRecord(record);
    setActiveProjectId(record.project_id);
    setScreen("editRecord");
  }

  async function upsertProject(project: ProjectDraft) {
    try {
      setSaving(true);
      setError("");
      const saved = await saveProject(project);
      const exists = projects.some((item) => item.id === saved.id);
      const next = exists
        ? projects.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...projects];

      let nextRecords = records;

      if (!project.id && project.start_mode === "ongoing") {
        const introRecord = await saveRecord({
          project_id: saved.id,
          type: "note",
          category: "Catatan",
          title: "Mulai menggunakan KAS PETANI",
          description: `Data dimulai saat tanaman sudah berjalan di HST ${project.current_hst || 1}.`,
          amount: 0,
          record_date: new Date().toISOString().slice(0, 10),
        });
        nextRecords = [introRecord, ...nextRecords];

        if (Number(project.opening_capital || 0) > 0) {
          const capitalRecord = await saveRecord({
            project_id: saved.id,
            type: "expense",
            category: "Modal Sebelumnya",
            title: "Modal sebelumnya",
            description: "Total modal sebelum mulai dicatat di aplikasi.",
            amount: Number(project.opening_capital || 0),
            record_date: new Date().toISOString().slice(0, 10),
          });
          nextRecords = [capitalRecord, ...nextRecords];
        }
      }

      persistProjects(next);
      if (nextRecords !== records) persistRecords(nextRecords);
      setActiveProjectId(saved.id);
      setScreen("project");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menyimpan proyek.");
      alert(err?.message || "Gagal menyimpan proyek.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(projectId: string) {
    if (!confirm("Hapus proyek ini beserta semua catatannya?")) return;

    try {
      setSaving(true);
      setError("");
      await removeProject(projectId);

      const nextProjects = projects.filter((item) => item.id !== projectId);
      const nextRecords = records.filter((item) => item.project_id !== projectId);

      persistProjects(nextProjects);
      persistRecords(nextRecords);
      setActiveProjectId("");
      setScreen("home");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menghapus proyek.");
      alert(err?.message || "Gagal menghapus proyek.");
    } finally {
      setSaving(false);
    }
  }

  async function updateProjectPhase(projectId: string, phase: string) {
    const current = projects.find((item) => item.id === projectId);
    if (!current) return;

    const nextProject = { ...current, phase };
    persistProjects(projects.map((item) => (item.id === projectId ? nextProject : item)));

    try {
      const saved = await changeProjectPhase(current, phase);
      persistProjects(projects.map((item) => (item.id === projectId ? saved : item)));
    } catch (err: any) {
      alert(err?.message || "Gagal update fase.");
      refresh();
    }
  }

  async function updateProjectStatus(projectId: string, status: ProjectStatus) {
    const current = projects.find((item) => item.id === projectId);
    if (!current) return;

    const nextProject = { ...current, status };
    persistProjects(projects.map((item) => (item.id === projectId ? nextProject : item)));

    try {
      const saved = await changeProjectStatus(current, status);
      persistProjects(projects.map((item) => (item.id === projectId ? saved : item)));
    } catch (err: any) {
      alert(err?.message || "Gagal update status.");
      refresh();
    }
  }

  async function addRecord(record: FarmRecordDraft) {
    try {
      setSaving(true);
      setError("");
      const saved = await saveRecord(record);
      let nextProjects = projects;

      if (isPlantingRecord(saved)) {
        const currentProject = projects.find((item) => item.id === saved.project_id);
        if (currentProject && !currentProject.planting_date) {
          const updatedProject = await saveProject({
            ...currentProject,
            planting_date: saved.record_date,
            phase: "Tanam",
          });
          nextProjects = projects.map((item) => (item.id === updatedProject.id ? updatedProject : item));
          persistProjects(nextProjects);
        }
      }

      persistRecords([saved, ...records]);
      setActiveProjectId(saved.project_id);
      setQuickAddType(undefined);
      setEditingRecord(null);
      setScreen("project");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menyimpan catatan.");
      alert(err?.message || "Gagal menyimpan catatan.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRecord(record: FarmRecordDraft) {
    try {
      setSaving(true);
      setError("");
      const saved = await saveRecord(record);

      if (isPlantingRecord(saved)) {
        const currentProject = projects.find((item) => item.id === saved.project_id);
        if (currentProject && !currentProject.planting_date) {
          const updatedProject = await saveProject({
            ...currentProject,
            planting_date: saved.record_date,
            phase: "Tanam",
          });
          persistProjects(projects.map((item) => (item.id === updatedProject.id ? updatedProject : item)));
        }
      }

      persistRecords(records.map((item) => (item.id === saved.id ? saved : item)));
      setActiveProjectId(saved.project_id);
      setEditingRecord(null);
      setScreen("project");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal update catatan.");
      alert(err?.message || "Gagal update catatan.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(recordId: string) {
    if (!confirm("Hapus catatan ini?")) return;

    try {
      setSaving(true);
      await removeRecord(recordId);
      persistRecords(records.filter((item) => item.id !== recordId));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal hapus catatan.");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateRecord(record: FarmRecord) {
    await addRecord(duplicateRecordDraft(record));
  }

  return {
    projects,
    records,
    screen,
    activeProject,
    activeProjectRecords,
    editingRecord,
    quickAddType,
    loading,
    saving,
    dataSource,
    error,
    refresh,
    openHome,
    openNewProject,
    openReports,
    openQuickAdd,
    openProject,
    openEditProject,
    openEditRecord,
    upsertProject,
    deleteProject,
    updateProjectPhase,
    updateProjectStatus,
    addRecord,
    updateRecord,
    deleteRecord,
    duplicateRecord,
  };
}
