"use client";

import { useEffect, useState } from "react";
import type { FarmRecord, FarmRecordDraft, Project, RecordType } from "@/types";
import { defaultCategories } from "@/lib/defaults";
import { formatRupiah, todayISO } from "@/lib/format";
import { typeIcon, typeLabel } from "@/lib/labels";
import { Field, Input } from "@/components/ui/FormField";

export function QuickAddForm({
  projects,
  defaultProjectId,
  onSave,
  onCancel,
  onNeedProject,
  initialRecord,
  initialType,
}: {
  projects: Project[];
  defaultProjectId: string;
  onSave: (record: FarmRecordDraft) => void;
  onCancel: () => void;
  onNeedProject: () => void;
  initialRecord?: FarmRecord;
  initialType?: RecordType;
}) {
  const [projectId, setProjectId] = useState(initialRecord?.project_id || defaultProjectId);
  const [type, setType] = useState<RecordType>(initialRecord?.type || initialType || "expense");
  const [category, setCategory] = useState(initialRecord?.category || "Pupuk");
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState(initialRecord?.title || "");
  const [amount, setAmount] = useState(initialRecord && initialRecord.type !== "harvest" ? String(initialRecord.amount || "") : "");
  const [quantity, setQuantity] = useState(initialRecord?.quantity ? String(initialRecord.quantity) : "");
  const [price, setPrice] = useState(initialRecord?.price_per_unit ? String(initialRecord.price_per_unit) : "");
  const [description, setDescription] = useState(initialRecord?.description || "");
  const [date, setDate] = useState(initialRecord?.record_date || todayISO());

  useEffect(() => {
    const typeCategories = defaultCategories.filter((item) => item.type === type);
    const first = typeCategories[0]?.name || "Lainnya";
    const categoryExists = typeCategories.some((item) => item.name === category);
    if (!categoryExists) setCategory(first);
  }, [type, category]);

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-green-900/10 bg-white p-6 text-center shadow-sm">
        <div className="text-5xl">🌱</div>
        <h2 className="mt-3 text-lg font-black">Buat proyek dulu</h2>
        <p className="mt-1 text-sm text-zinc-600">Catatan harus masuk ke salah satu proyek.</p>
        <button onClick={onNeedProject} className="mt-5 w-full rounded-2xl bg-green-600 py-4 font-black text-white">BUAT PROYEK</button>
      </div>
    );
  }

  const categories = defaultCategories.filter((item) => item.type === type);
  const computedAmount = type === "harvest" ? Number(quantity || 0) * Number(price || 0) : Number(amount || 0);

  function submit() {
    const finalCategory = customCategory.trim() || category;
    if (!projectId) return alert("Pilih proyek dulu.");
    if (!title.trim()) return alert("Judul catatan wajib diisi.");

    onSave({
      id: initialRecord?.id,
      project_id: projectId,
      type,
      category: finalCategory,
      title: title.trim(),
      description,
      amount: computedAmount,
      quantity: quantity ? Number(quantity) : undefined,
      unit: type === "harvest" ? "kg" : undefined,
      price_per_unit: price ? Number(price) : undefined,
      record_date: date,
      created_at: initialRecord?.created_at,
    });
  }

  return (
    <div className="space-y-4">
      <button onClick={onCancel} className="font-bold text-green-800">← Kembali</button>
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-green-950">{initialRecord ? "Edit Catatan" : `${typeIcon[type]} Catat ${typeLabel[type]}`}</h2>
        <div className="mt-5 space-y-4">
          <Field label="Pilih proyek">
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-4 font-bold outline-none">
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-5 gap-2 rounded-3xl bg-green-50 p-2">
            {(["expense", "income", "harvest", "activity", "note"] as RecordType[]).map((item) => (
              <button
                key={item}
                onClick={() => setType(item)}
                className={`rounded-2xl px-2 py-3 text-center font-black active:scale-[0.98] ${type === item ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "text-green-900"}`}
              >
                <span className="block text-2xl leading-none">{typeIcon[item]}</span>
                <span className="mt-1 block text-[11px]">{typeLabel[item]}</span>
              </button>
            ))}
          </div>

          <Field label="Kategori">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-4 font-bold outline-none">
              {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </Field>
          <Input label="Kategori custom opsional" value={customCategory} onChange={setCustomCategory} placeholder="Contoh: Dolomit" />
          <Input label="Judul" value={title} onChange={setTitle} placeholder={type === "expense" ? "Beli NPK" : type === "harvest" ? "Panen pertama" : "Catatan singkat"} />
          <Input label="Tanggal" type="date" value={date} onChange={setDate} />

          {type === "harvest" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Berat kg" type="number" value={quantity} onChange={setQuantity} />
              <Input label="Harga/kg" type="number" value={price} onChange={setPrice} />
            </div>
          ) : (type === "expense" || type === "income") ? (
            <div className="space-y-2">
              <Input label="Nominal" type="number" value={amount} onChange={setAmount} placeholder="150000" />
              {amount ? (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-black text-green-900">
                  Terbaca: {formatRupiah(Number(amount || 0))}
                </div>
              ) : null}
            </div>
          ) : null}

          <Field label="Catatan opsional">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-4 outline-none" placeholder="Tulis detail kalau perlu..." />
          </Field>

          <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">
            Total: {formatRupiah(computedAmount)}
          </div>
          <button onClick={submit} className="w-full rounded-2xl bg-green-600 py-5 text-lg font-black text-white shadow-lg shadow-green-900/20 active:scale-[0.99]">{initialRecord ? "✓ UPDATE CATATAN" : "✓ SIMPAN CATATAN"}</button>
        </div>
      </div>
    </div>
  );
}
