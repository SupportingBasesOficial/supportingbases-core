// DO NOT MODIFY WITHOUT MAJOR VERSION INCREMENT

import { SBInput } from "./types/sb-input.js";
import { ProjectionConfig } from "./types/projection-config.js";
import { weightedAmount } from "./risk/weighted-pressure.js";
import { clusterPressures } from "./pressure/cluster.js";
import { calculateICS } from "./risk/collapse-index.js";
import {
  calculateNominalIndex,
  calculateStructuralIndex,
  calculateConsolidatedIndex,
} from "./risk/collapse-v1.js";
import { calculateZPF } from "./pressure/zpf.js";
import { validateInput, validateConfig } from "./validation/validate.js";
import { groupByCenter } from "./structural/center-consolidation.js";

// Engine version constant
export const ENGINE_VERSION = "1.1.0";

export function runEngine(
  input: unknown,
  config: unknown
) {
  // Runtime validation - engine crashes deterministically on invalid input
  const validatedInput: SBInput = validateInput(input);
  const cfgToValidate = config && Object.keys((config as any) || {}).length ? config : { mode: "UNTIL_COLLAPSE" };
  const validatedConfig: ProjectionConfig = validateConfig(cfgToValidate);
  const weighted = validatedInput.obligations.map(o => ({
    ...o,
    weighted_amount: weightedAmount(
      o.amount,
      o.layer,
      o.status === "LATE"
    )
  }));

  const clusters = clusterPressures(weighted);

  const totalWeighted = weighted.reduce(
    (sum, o) => sum + o.weighted_amount,
    0
  );

  // preserve old ICS for compatibility
  const ics = calculateICS(
    totalWeighted,
    validatedInput.liquidity.available_cash,
    weighted.filter(o => o.status === "LATE").length,
    0.5
  );

  // ---- new risk calculations v1.1 ----
  // determine horizon days if fixed
  let horizonDays = Infinity;
  if (validatedConfig.mode === "FIXED_HORIZON") {
    horizonDays = validatedConfig.horizon_days;
  }

  const { nominal_index, nominal_collapse_date } =
    calculateNominalIndex(
      validatedInput.obligations.map(o => ({ due_date: o.due_date, amount: o.amount })),
      validatedInput.liquidity.available_cash,
      horizonDays
    );

  const { structural_index, structural_collapse_date } =
    calculateStructuralIndex(validatedInput.obligations, validatedInput.liquidity.available_cash);

  const consolidated_index = calculateConsolidatedIndex(
    nominal_index,
    structural_index
  );

  const lateCount = weighted.filter(o => o.status === "LATE").length;

  // temporal metrics
  // define ZPF as the dominant cluster (continuous window of largest pressure)
  const zpfStart = (() => {
    if (!clusters || clusters.length === 0) return null;
    let dominant = clusters[0];
    let dominantWeight = (dominant.obligations || []).reduce((s: number, o: any) => s + (o.weighted_amount || 0), 0);
    for (const c of clusters) {
      const w = (c.obligations || []).reduce((s: number, o: any) => s + (o.weighted_amount || 0), 0);
      if (w > dominantWeight) {
        dominant = c;
        dominantWeight = w;
      }
    }
    return dominant.cluster_start || null;
  })();

  const zpfEnd = (() => {
    if (!clusters || clusters.length === 0) return null;
    let dominant = clusters[0];
    let dominantWeight = (dominant.obligations || []).reduce((s: number, o: any) => s + (o.weighted_amount || 0), 0);
    for (const c of clusters) {
      const w = (c.obligations || []).reduce((s: number, o: any) => s + (o.weighted_amount || 0), 0);
      if (w > dominantWeight) {
        dominant = c;
        dominantWeight = w;
      }
    }
    return dominant.cluster_end || null;
  })();

  // Multi-center consolidation
  const centersAgg = groupByCenter(weighted as any);

  const centersOutput: Record<string, { total_weighted_pressure: number; dominant_layer: 1 | 2 | 3 }> = {};
  for (const [cid, agg] of Object.entries(centersAgg)) {
    // determine dominant layer by weighted exposure, deterministic tie-breaker: smaller layer wins
    const exposures = [agg.layer1_exposure, agg.layer2_exposure, agg.layer3_exposure];
    let maxIdx = 0;
    for (let i = 1; i < exposures.length; i++) {
      if (exposures[i] > exposures[maxIdx]) maxIdx = i;
    }
    centersOutput[cid] = {
      total_weighted_pressure: agg.total_weighted,
      dominant_layer: (maxIdx + 1) as 1 | 2 | 3,
    };
  }

  return {
    meta: {
      engine_version: ENGINE_VERSION,
      deterministic: true,
    },
    // legacy outputs for backwards compatibility
    clusters,
    total_weighted_pressure: totalWeighted,
    late_count: lateCount,
    timestamp: new Date().toISOString(),

    // structural details
    structural: {
      centers: centersOutput,
      total_weighted_pressure: totalWeighted,
      pressure_ratio:
        validatedInput.liquidity.available_cash > 0
          ? totalWeighted / validatedInput.liquidity.available_cash
          : 0,
      available_liquidity: validatedInput.liquidity.available_cash,
    },

    temporal: {
      zpf_start_date: zpfStart,
      zpf_end_date: zpfEnd,
      nominal_collapse_date,
      structural_collapse_date,
      day_base: zpfEnd ? new Date(new Date(zpfEnd).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] : null,
    },

    risk: {
      nominal_index,
      structural_index,
      consolidated_index,
      late_obligation_count: lateCount,
    },
  };
}

