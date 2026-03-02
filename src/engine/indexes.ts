import { clamp0to100 } from "./math";

export function structuralIndexFromRatio(ratio: number): number {
  if (!isFinite(ratio) || ratio < 0) return 100;
  const r2 = ratio * ratio;
  const idx = 100 * (r2 / (1 + r2));
  const oneDecimal = Math.round(idx * 10) / 10;
  return clamp0to100(oneDecimal);
}

export function calculateConsolidatedIndex(nominal: number, structural: number): number {
  if (nominal >= 80) return clamp0to100(Math.round(nominal));
  if (structural >= 90) return clamp0to100(Math.round(structural));
  return clamp0to100(Math.round(nominal * 0.6 + structural * 0.4));
}
