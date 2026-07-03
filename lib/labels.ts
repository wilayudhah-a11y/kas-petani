import type { ProjectStatus, RecordType } from "@/types";

export const typeLabel: Record<RecordType, string> = {
  expense: "Modal",
  income: "Masuk",
  harvest: "Panen",
  activity: "Kerja",
  note: "Catatan",
};

export const typeIcon: Record<RecordType, string> = {
  expense: "💸",
  income: "💰",
  harvest: "🌾",
  activity: "🌱",
  note: "📝",
};

export function statusLabel(status: ProjectStatus) {
  if (status === "selesai") return "Selesai";
  if (status === "arsip") return "Arsip";
  if (status === "panen") return "Panen";
  return "Berjalan";
}

export function cropEmoji(crop: string) {
  const text = crop.toLowerCase();
  if (text.includes("cabai") || text.includes("cabe")) return "🌶️";
  if (text.includes("timun") || text.includes("mentimun")) return "🥒";
  if (text.includes("terong")) return "🍆";
  if (text.includes("jagung")) return "🌽";
  if (text.includes("tomat")) return "🍅";
  if (text.includes("bawang")) return "🧅";
  if (text.includes("sawi") || text.includes("kangkung") || text.includes("bayam")) return "🥬";
  return "🌱";
}
