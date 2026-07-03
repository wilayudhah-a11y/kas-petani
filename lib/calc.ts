import type { FarmRecord, RecordType } from "@/types";

export function makeTotals(records: FarmRecord[]) {
  const expense = records
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const income = records
    .filter((item) => item.type === "income" || item.type === "harvest")
    .reduce((sum, item) => sum + item.amount, 0);

  return { expense, income };
}

export function makeCategoryTotals(records: FarmRecord[]) {
  const map = new Map<string, { key: string; type: RecordType; category: string; amount: number }>();

  for (const record of records) {
    if (record.type !== "expense" && record.type !== "income" && record.type !== "harvest") continue;
    const key = `${record.type}-${record.category}`;
    const current = map.get(key) || { key, type: record.type, category: record.category, amount: 0 };
    current.amount += record.amount;
    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}
