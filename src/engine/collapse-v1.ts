import { SBInput, Obligation } from "../types/sb-contracts";
import { structuralIndexFromRatio, calculateConsolidatedIndex } from "./indexes";
import { nominalIndexFromSimulation, simulateDays } from "./simulate";
import { ProjectionConfig } from "../types/projection-config";

const LAYER_WEIGHT: Record<1 | 2 | 3, number> = { 1: 3, 2: 2, 3: 1 };

export function clamp0to100(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function structuralRatio(totalWeighted: number, availableCash: number) {
  if (availableCash <= 0) return Number.POSITIVE_INFINITY;
  return totalWeighted / availableCash;
}

export function structuralIndexFromTotals(totalWeighted: number, availableCash: number) {
  return structuralIndexFromRatio(structuralRatio(totalWeighted, availableCash));
}

export function weightedAmount(ob: Obligation) {
  const w = LAYER_WEIGHT[ob.layer] ?? 1;
  return ob.amount * w;
}

export function calculateNominalIndex(
  input: SBInput,
  config: ProjectionConfig
): { index: number; collapseDate: string | null; dayBase: any[] } {
  const sim = simulateDays({
    startISO: input.metadata.analysis_timestamp.slice(0, 10),
    available_cash: input.liquidity.available_cash,
    obligations: input.obligations,
    inflows: input.inflows,
    config,
  });

  const index = nominalIndexFromSimulation(sim.rows, input.liquidity.available_cash);
  return { index, collapseDate: sim.nominal_collapse_date, dayBase: sim.rows };
}

export { calculateConsolidatedIndex };
