"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectDraft, ProjectStartMode } from "@/types";
import { todayISO } from "@/lib/format";
import { startDateFromHst } from "@/lib/hst";
import { Field, Input } from "@/components/ui/FormField";

export function ProjectForm({
  onSave,
  onCancel,
  initialProject,
}: {
  onSave: (project: ProjectDraft) => void;
  onCancel: () => void;
  initialProject?: Project;
}) {
  const isEdit = Boolean(initialProject);
  const [name, setName] = useState(initialProject?.name || "");
  const [crop, setCrop] = useState(initialProject?.crop || "Cabai");
  const [variety, setVariety] = useState(initialProject?.variety || "");
  const [location, setLocation] = useState(initialProject?.location || "");
  const [landSize, setLandSize] = useState(initialProject?.land_size || "");
  const [startMode, setStartMode] = useState<ProjectStartMode>("preparation");
  const [startDate, setStartDate] = useState(initialProject?.start_date || todayISO());
  const [plantingDate, setPlantingDate] = useState(initialProject?.planting_date || todayISO());
  const [currentHst, setCurrentHst] = useState(30);
  const [estimate, setEstimate] = useState(initialProject?.harvest_estimate_days || 90);
  const [openingCapital, setOpeningCapital] = useState("");

  const calculatedPlantingDate = useMemo(() => {
    if (startMode === "ongoing") return startDateFromHst(currentHst);
    if (startMode === "new") return plantingDate;
    return undefined;
  }, [startMode, currentHst, plantingDate]);

  function submit() {
    if (!name.trim()) return alert("Nama lahan/tanaman wajib diisi.");

    onSave({
      id: initialProject?.id,
      name: name.trim(),
      crop: crop.trim() || name.trim(),
      variety: variety.trim() || undefined,
      location: location.trim() || undefined,
      land_size: landSize.trim() || undefined,
      land_unit: initialProject?.land_unit || "m²",
      start_date: startDate,
      planting_date: isEdit ? (plantingDate || undefined) : calculatedPlantingDate,
      harvest_estimate_days: Number(estimate || 90),
      phase: initialProject?.phase || (calculatedPlantingDate ? "Tanam" : "Persiapan Lahan"),
      status: initialProject?.status || "berjalan",
      created_at: initialProject?.created_at,
      updated_at: initialProject?.updated_at,
      start_mode: startMode,
      current_hst: startMode === "ongoing" ? Number(currentHst || 1) : undefined,
      opening_capital: Number(openingCapital || 0),
    });
  }

  return (
    <div className="space-y-4">
      <button onClick={onCancel} className="font-bold text-green-800">← Kembali</button>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-green-950">{isEdit ? "Edit Lahan Tanam" : "Buat Lahan Tanam"}</h2>
        <p className="mt-1 text-sm font-bold text-zinc-500">
          {isEdit
            ? "Tanggal mulai lahan dan tanggal tanam boleh berbeda. HST dihitung dari tanggal tanam."
            : "Kalau masih olah lahan, HST belum dimulai. HST baru mulai saat tanaman ditanam."}
        </p>

        <div className="mt-5 space-y-4">
          {!isEdit ? (
            <Field label="Kondisi lahan sekarang">
              <div className="grid grid-cols-1 gap-2 rounded-3xl bg-green-50 p-2">
                <button
                  type="button"
                  onClick={() => setStartMode("preparation")}
                  className={`rounded-2xl px-4 py-4 text-left active:scale-[0.98] ${startMode === "preparation" ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-white text-green-950"}`}
                >
                  <span className="block text-2xl">🚜</span>
                  <span className="mt-2 block text-sm font-black">Masih Persiapan Lahan</span>
                  <span className="mt-1 block text-xs font-bold opacity-80">Olah tanah, bedengan, mulsa, beli bibit. HST belum mulai.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStartMode("new")}
                  className={`rounded-2xl px-4 py-4 text-left active:scale-[0.98] ${startMode === "new" ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-white text-green-950"}`}
                >
                  <span className="block text-2xl">🌱</span>
                  <span className="mt-2 block text-sm font-black">Sudah Tanam dari Awal</span>
                  <span className="mt-1 block text-xs font-bold opacity-80">Isi tanggal tanam. HST mulai dari tanggal ini.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStartMode("ongoing")}
                  className={`rounded-2xl px-4 py-4 text-left active:scale-[0.98] ${startMode === "ongoing" ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-white text-green-950"}`}
                >
                  <span className="block text-2xl">🌾</span>
                  <span className="mt-2 block text-sm font-black">Tanaman Sudah Berjalan</span>
                  <span className="mt-1 block text-xs font-bold opacity-80">Isi HST sekarang, tanggal tanam dihitung otomatis.</span>
                </button>
              </div>
            </Field>
          ) : null}

          <Input label="Nama lahan/tanaman" value={name} onChange={setName} placeholder="Cabai Rawit Belakang" />
          <Input label="Tanaman" value={crop} onChange={setCrop} placeholder="Cabai" />
          <Input label="Varietas opsional" value={variety} onChange={setVariety} placeholder="Rawit merah" />
          <Input label="Lokasi" value={location} onChange={setLocation} placeholder="Lahan belakang" />
          <Input label="Luas lahan opsional" type="number" value={landSize} onChange={setLandSize} placeholder="500" />

          <Input label="Tanggal mulai lahan/proyek" type="date" value={startDate} onChange={setStartDate} />

          {isEdit ? (
            <Input label="Tanggal tanam / mulai HST" type="date" value={plantingDate} onChange={setPlantingDate} />
          ) : startMode === "preparation" ? (
            <div className="rounded-3xl bg-green-50 p-4 text-sm font-bold text-green-900">
              HST belum dimulai. Nanti saat mencatat kegiatan <b>Tanam</b>, tanggal tanam akan otomatis disimpan.
            </div>
          ) : startMode === "ongoing" ? (
            <div className="space-y-3 rounded-3xl bg-green-50 p-4">
              <Input label="Sekarang HST berapa?" type="number" value={String(currentHst)} onChange={(v) => setCurrentHst(Number(v || 1))} />
              <div className="rounded-2xl bg-white p-4 text-sm font-bold text-green-900">
                Perkiraan tanggal tanam: <span className="font-black">{calculatedPlantingDate}</span>
              </div>
              <Input label="Modal sebelumnya opsional" type="number" value={openingCapital} onChange={setOpeningCapital} placeholder="Contoh: 2500000" />
            </div>
          ) : (
            <Input label="Tanggal tanam / mulai HST" type="date" value={plantingDate} onChange={setPlantingDate} />
          )}

          <Input label="Estimasi panen/masa tanam (hari)" type="number" value={String(estimate)} onChange={(v) => setEstimate(Number(v || 0))} />

          <button onClick={submit} className="w-full rounded-2xl bg-green-600 py-4 font-black text-white">
            {isEdit ? "UPDATE LAHAN" : "SIMPAN LAHAN"}
          </button>
        </div>
      </div>
    </div>
  );
}
