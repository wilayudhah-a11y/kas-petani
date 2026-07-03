import { phases } from "@/lib/defaults";

export function getPhaseIndex(phase: string) {
  const index = phases.findIndex((item) => item === phase);
  return index < 0 ? 0 : index;
}

export function getPhaseProgress(phase: string) {
  if (phases.length <= 1) return 0;
  return Math.round((getPhaseIndex(phase) / (phases.length - 1)) * 100);
}
