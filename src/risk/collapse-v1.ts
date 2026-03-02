// New collapse model helpers for engine v1.1

import { weightedAmount } from "./weighted-pressure.js";

// helper to clamp number
function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

export interface NominalResult {
  nominal_index: number;
  nominal_collapse_date: string | null;
}

export interface StructuralResult {
  structural_index: number;
  structural_collapse_date: string | null;
}

export function calculateNominalIndex(
  obligations: Array<{ due_date: string; amount: number }>,
  availableCash: number,
  horizonDays: number
): NominalResult {
  // sequential nominal simulation
  let balance = availableCash;
  const sorted = [...obligations].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  let collapseDate: string | null = null;
  for (const ob of sorted) {
    balance -= ob.amount;
    if (balance < 0) {
      collapseDate = ob.due_date;
      break;
    }
  }

  if (!collapseDate || horizonDays <= 0 || !isFinite(horizonDays)) {
    // no collapse or no meaningful horizon -> index 0
    return { nominal_index: 0, nominal_collapse_date: collapseDate };
  }

  const start = new Date();
  const D =
    (new Date(collapseDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  // if collapse occurs after horizon treat as no collapse in horizon
  if (D >= horizonDays) {
    return { nominal_index: 0, nominal_collapse_date: collapseDate };
  }

  const proximityFactor = 1 - D / horizonDays;
  const idx = clamp(Math.round(proximityFactor * 100), 0, 100);
  return { nominal_index: idx, nominal_collapse_date: collapseDate };
}

export function calculateStructuralIndex(
  obligations: Array<{ due_date: string; amount: number; layer: 1 | 2 | 3; status: string }>,
  availableCash: number
): StructuralResult {
  // total weighted pressure already calculated outside if needed
  // compute accumulation per date for collapse date
  const sorted = [...obligations].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  let accumulator = 0;
  let collapseDate: string | null = null;

  for (const ob of sorted) {
    const weighted = weightedAmount(ob.amount, ob.layer, ob.status === "LATE");
    accumulator += weighted;
    if (collapseDate === null && accumulator > availableCash) {
      collapseDate = ob.due_date;
      break;
    }
  }

  // compute ratio and index
  let structuralRatio = availableCash > 0 ? accumulator / availableCash : Infinity;
  let index: number;
  // Use canonical logistic-style transform (canon v1.1):
  // structural_index = 100 * (ratio^2 / (1 + ratio^2))
  // Ensure deterministic behavior and avoid division by zero.
  let transformed: number;
  if (!isFinite(structuralRatio) || availableCash <= 0) {
    transformed = 1; // treat as saturated
  } else {
    const r2 = structuralRatio * structuralRatio;
    transformed = r2 / (1 + r2);
  }
  let computed = 100 * transformed;
  // clamp and return (keep as number, allow fractional values)
  computed = clamp(computed, 0, 100);
  // keep as a rounded value to reasonable precision (one decimal)
  index = Math.round(computed * 10) / 10;
  return { structural_index: index, structural_collapse_date: collapseDate };
}

export function calculateConsolidatedIndex(
  nominal_index: number,
  structural_index: number
): number {
  if (nominal_index >= 80) {
    return nominal_index;
  } else if (structural_index >= 90) {
    return structural_index;
  } else {
    return Math.round(nominal_index * 0.6 + structural_index * 0.4);
  }
}
