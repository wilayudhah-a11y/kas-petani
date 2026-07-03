import type { FarmRecord, Project } from "@/types";
import { hstFromDate } from "@/lib/hst";
import { makeTotals } from "@/lib/calc";

export function getProjectRecords(projectId: string, records: FarmRecord[]) {
  return records.filter((item) => item.project_id === projectId);
}

export function getProjectStats(project: Project, records: FarmRecord[]) {
  const projectRecords = getProjectRecords(project.id, records);
  const totals = makeTotals(projectRecords);
  const age = hstFromDate(project.planting_date);
  const estimateDays = Math.max(1, project.harvest_estimate_days || 1);
  const progress = age ? Math.min(100, Math.round((age / estimateDays) * 100)) : 0;
  const harvestRecords = projectRecords.filter((item) => item.type === "harvest");
  const totalKg = harvestRecords.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const avgPrice = totalKg > 0 ? Math.round(totals.income / totalKg) : 0;

  return {
    records: projectRecords,
    totals,
    age,
    estimateDays,
    progress,
    totalKg,
    avgPrice,
    profit: totals.income - totals.expense,
    isPlanted: Boolean(project.planting_date),
    remainingDays: age ? Math.max(0, estimateDays - age) : estimateDays,
  };
}

export function getDashboardStats(projects: Project[], records: FarmRecord[]) {
  const totals = makeTotals(records);
  const activeProjects = projects.filter((item) => item.status !== "arsip").length;
  const archivedProjects = projects.filter((item) => item.status === "arsip").length;

  return {
    totals,
    activeProjects,
    archivedProjects,
    profit: totals.income - totals.expense,
  };
}
