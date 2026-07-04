import type { FarmerSession } from "@/types";

const FARMER_SESSION_KEY = "kas_petani_farmer_session";

export function getFarmerSession(): FarmerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FARMER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as FarmerSession) : null;
  } catch {
    return null;
  }
}

export function saveFarmerSession(session: FarmerSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(session));
}

export function clearFarmerSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FARMER_SESSION_KEY);
}

export function isAdminSession() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("kas_petani_admin_auth") === "yes";
}
