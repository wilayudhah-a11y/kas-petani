export type ProjectStatus = "berjalan" | "panen" | "selesai" | "arsip";
export type RecordType = "expense" | "income" | "activity" | "harvest" | "note";
export type ProjectStartMode = "preparation" | "new" | "ongoing";
export type FarmerStatus = "aktif" | "nonaktif";
export type ProfileRole = "admin" | "farmer";

export type FarmerProfile = {
  id: string;
  name: string;
  phone: string;
  pin_hash?: string;
  role: ProfileRole;
  status: FarmerStatus;
  note?: string;
  created_at: string;
  updated_at?: string;
};

export type FarmerDraft = {
  id?: string;
  name: string;
  phone: string;
  pin?: string;
  status?: FarmerStatus;
  note?: string;
};

export type FarmerSession = {
  id: string;
  name: string;
  phone: string;
  role: ProfileRole;
};

export type Project = {
  id: string;
  farmer_id?: string;
  name: string;
  crop: string;
  variety?: string;
  location?: string;
  land_size?: string;
  land_unit?: string;
  start_date: string;
  planting_date?: string;
  harvest_estimate_days: number;
  target_harvest_date?: string;
  phase: string;
  status: ProjectStatus;
  created_at: string;
  updated_at?: string;
};

export type ProjectDraft = {
  id?: string;
  farmer_id?: string;
  name: string;
  crop: string;
  variety?: string;
  location?: string;
  land_size?: string;
  land_unit?: string;
  start_date: string;
  planting_date?: string;
  harvest_estimate_days: number;
  target_harvest_date?: string;
  phase?: string;
  status?: ProjectStatus;
  created_at?: string;
  updated_at?: string;

  // Hanya dipakai di form saat buat proyek baru.
  // Tidak dikirim ke tabel projects.
  start_mode?: ProjectStartMode;
  current_hst?: number;
  opening_capital?: number;
};

export type Category = {
  id: string;
  type: RecordType;
  name: string;
  is_default: boolean;
};

export type FarmRecord = {
  id: string;
  project_id: string;
  type: RecordType;
  category: string;
  title: string;
  description?: string;
  amount: number;
  quantity?: number;
  unit?: string;
  price_per_unit?: number;
  record_date: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
};

export type FarmRecordDraft = {
  id?: string;
  project_id: string;
  type: RecordType;
  category: string;
  title: string;
  description?: string;
  amount: number;
  quantity?: number;
  unit?: string;
  price_per_unit?: number;
  record_date: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
};
