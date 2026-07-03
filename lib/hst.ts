export function hstFromDate(plantingDate?: string | null, targetDate?: string) {
  if (!plantingDate) return null;

  const start = new Date(`${plantingDate}T00:00:00`);
  const target = targetDate ? new Date(`${targetDate}T00:00:00`) : new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) return null;

  const diff = target.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

export function startDateFromHst(hst: number, today = new Date()) {
  const safeHst = Math.max(1, Math.floor(Number(hst || 1)));
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - safeHst + 1);
  return start.toISOString().slice(0, 10);
}

export function hstLabel(hst: number | null | undefined) {
  if (!hst) return "Belum HST";
  return `HST ${Math.max(1, Math.floor(Number(hst || 1)))}`;
}

export function hasStartedHst(plantingDate?: string | null) {
  return Boolean(plantingDate);
}
