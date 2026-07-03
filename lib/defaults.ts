import type { Category } from "@/types";

export const phases = [
  "Persiapan Lahan",
  "Tanam",
  "Vegetatif",
  "Berbunga",
  "Berbuah",
  "Panen",
];

export const defaultCategories: Category[] = [
  { id: "cat-bibit", type: "expense", name: "Bibit", is_default: true },
  { id: "cat-pupuk", type: "expense", name: "Pupuk", is_default: true },
  { id: "cat-pestisida", type: "expense", name: "Pestisida", is_default: true },
  { id: "cat-mulsa", type: "expense", name: "Mulsa", is_default: true },
  { id: "cat-tenaga", type: "expense", name: "Tenaga Kerja", is_default: true },
  { id: "cat-transport", type: "expense", name: "Transport", is_default: true },
  { id: "cat-sewa", type: "expense", name: "Sewa", is_default: true },
  { id: "cat-lain-expense", type: "expense", name: "Lainnya", is_default: true },
  { id: "cat-jual-panen", type: "income", name: "Jual Panen", is_default: true },
  { id: "cat-lain-income", type: "income", name: "Lainnya", is_default: true },
  { id: "cat-tanam", type: "activity", name: "Tanam", is_default: true },
  { id: "cat-pemupukan", type: "activity", name: "Pemupukan", is_default: true },
  { id: "cat-semprot", type: "activity", name: "Penyemprotan", is_default: true },
  { id: "cat-siram", type: "activity", name: "Penyiraman", is_default: true },
  { id: "cat-lain-activity", type: "activity", name: "Lainnya", is_default: true },
  { id: "cat-panen", type: "harvest", name: "Panen", is_default: true },
  { id: "cat-note", type: "note", name: "Catatan", is_default: true },
];
