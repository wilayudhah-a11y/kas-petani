import type { FarmerDraft, FarmerProfile, FarmerSession, FarmerStatus } from "@/types";
import { hasSupabase, supabase } from "@/lib/supabase";

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

function normalizePhone(phone: string) {
  return String(phone || "").replace(/[^0-9]/g, "");
}

function normalizeFarmer(row: any): FarmerProfile {
  return {
    id: String(row.id),
    name: row.name || "Petani",
    phone: row.phone || "",
    pin_hash: row.pin_hash || undefined,
    role: row.role || "farmer",
    status: row.status || "aktif",
    note: row.note || undefined,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

function assertSupabase() {
  if (!hasSupabase || !supabase) throw new Error("Supabase belum aktif. Isi ENV Supabase dulu.");
  return supabase;
}

export async function listFarmers(): Promise<FarmerProfile[]> {
  const client = assertSupabase();
  const { data, error } = await client.from("profiles").select("*").eq("role", "farmer").order("created_at", { ascending: false });
  if (error) throw new Error(messageFromError(error));
  return (data || []).map(normalizeFarmer);
}

export async function createFarmer(draft: FarmerDraft): Promise<FarmerProfile> {
  const client = assertSupabase();
  const pin = draft.pin && draft.pin.length >= 4 ? draft.pin : String(Math.floor(100000 + Math.random() * 900000));
  const payload = {
    name: draft.name.trim(),
    phone: normalizePhone(draft.phone),
    pin_hash: pin,
    role: "farmer",
    status: draft.status || "aktif",
    note: draft.note || null,
  };

  const { data, error } = await client.from("profiles").insert(payload).select("*").single();
  if (error) throw new Error(messageFromError(error));
  return normalizeFarmer(data);
}

export async function updateFarmer(farmerId: string, draft: FarmerDraft): Promise<FarmerProfile> {
  const client = assertSupabase();
  const payload: Record<string, unknown> = {
    name: draft.name.trim(),
    phone: normalizePhone(draft.phone),
    status: draft.status || "aktif",
    note: draft.note || null,
    updated_at: new Date().toISOString(),
  };
  if (draft.pin && draft.pin.length >= 4) payload.pin_hash = draft.pin;

  const { data, error } = await client.from("profiles").update(payload).eq("id", farmerId).select("*").single();
  if (error) throw new Error(messageFromError(error));
  return normalizeFarmer(data);
}

export async function resetFarmerPin(farmerId: string, pin?: string): Promise<string> {
  const client = assertSupabase();
  const nextPin = pin && pin.length >= 4 ? pin : String(Math.floor(100000 + Math.random() * 900000));
  const { error } = await client.from("profiles").update({ pin_hash: nextPin, updated_at: new Date().toISOString() }).eq("id", farmerId);
  if (error) throw new Error(messageFromError(error));
  return nextPin;
}

export async function changeFarmerStatus(farmerId: string, status: FarmerStatus) {
  const client = assertSupabase();
  const { error } = await client.from("profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", farmerId);
  if (error) throw new Error(messageFromError(error));
}

export async function deleteFarmer(farmerId: string) {
  const client = assertSupabase();
  const detach = await client.from("projects").update({ farmer_id: null }).eq("farmer_id", farmerId);
  if (detach.error) throw new Error(messageFromError(detach.error));

  const { error } = await client.from("profiles").delete().eq("id", farmerId);
  if (error) throw new Error(messageFromError(error));
}

export async function loginFarmer(phone: string, pin: string): Promise<FarmerSession> {
  const client = assertSupabase();
  const cleanPhone = normalizePhone(phone);
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("phone", cleanPhone)
    .eq("role", "farmer")
    .maybeSingle();

  if (error) throw new Error(messageFromError(error));
  if (!data) throw new Error("Nomor HP belum terdaftar.");
  const farmer = normalizeFarmer(data);
  if (farmer.status !== "aktif") throw new Error("Akun petani sedang nonaktif. Hubungi admin.");
  if ((farmer.pin_hash || "") !== pin) throw new Error("PIN salah.");

  return {
    id: farmer.id,
    name: farmer.name,
    phone: farmer.phone,
    role: "farmer",
  };
}
