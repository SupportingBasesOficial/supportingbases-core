// DO NOT MODIFY WITHOUT MAJOR VERSION INCREMENT
import { weightedAmount } from "./risk/weighted-pressure.js";
import { clusterPressures } from "./pressure/cluster.js";
import { calculateICS } from "./risk/collapse-index.js";
import { calculateNominalIndex, calculateStructuralIndex, calculateConsolidatedIndex, } from "./risk/collapse-v1.js";
import { calculateZPF } from "./pressure/zpf.js";
import { validateInput, validateConfig } from "./validation/validate.js";
import { groupByCenter } from "./structural/center-consolidation.js";
// Engine version constant
export const ENGINE_VERSION = "1.1.0";
export function runEngine(input, config) {
    // Runtime validation - engine crashes deterministically on invalid input
    const validatedInput = validateInput(input);
    const cfgToValidate = config && Object.keys(config || {}).length ? config : { mode: "UNTIL_COLLAPSE" };
    const validatedConfig = validateConfig(cfgToValidate);
    const weighted = validatedInput.obligations.map(o => ({
        ...o,
        weighted_amount: weightedAmount(o.amount, o.layer, o.status === "LATE")
    }));
    const clusters = clusterPressures(weighted);
    const totalWeighted = weighted.reduce((sum, o) => sum + o.weighted_amount, 0);
    // preserve old ICS for compatibility
    const ics = calculateICS(totalWeighted, validatedInput.liquidity.available_cash, weighted.filter(o => o.status === "LATE").length, 0.5);
    // ---- new risk calculations v1.1 ----
    // determine horizon days if fixed
    let horizonDays = Infinity;
    if (validatedConfig.mode === "FIXED_HORIZON") {
        horizonDays = validatedConfig.horizon_days;
    }
    const { nominal_index, nominal_collapse_date } = calculateNominalIndex(validatedInput.obligations.map(o => ({ due_date: o.due_date, amount: o.amount })), validatedInput.liquidity.available_cash, horizonDays);
    const { structural_index, structural_collapse_date } = calculateStructuralIndex(validatedInput.obligations, validatedInput.liquidity.available_cash);
    const consolidated_index = calculateConsolidatedIndex(nominal_index, structural_index);
    const lateCount = weighted.filter(o => o.status === "LATE").length;
    // temporal metrics
    const zpfStart = (() => {
        const zpf = calculateZPF(weighted, validatedInput.liquidity.available_cash);
        return zpf.affordable.length > 0 ? zpf.affordable[0].due_date : null;
    })();
    // Multi-center consolidation
    const centersAgg = groupByCenter(weighted);
    const centersOutput = {};
    for (const [cid, agg] of Object.entries(centersAgg)) {
        // determine dominant layer by weighted exposure, deterministic tie-breaker: smaller layer wins
        const exposures = [agg.layer1_exposure, agg.layer2_exposure, agg.layer3_exposure];
        let maxIdx = 0;
        for (let i = 1; i < exposures.length; i++) {
            if (exposures[i] > exposures[maxIdx])
                maxIdx = i;
        }
        centersOutput[cid] = {
            total_weighted_pressure: agg.total_weighted,
            dominant_layer: (maxIdx + 1),
        };
    }
    return {
        meta: {
            engine_version: ENGINE_VERSION,
            deterministic: true,
        },
        // legacy outputs for backwards compatibility
        clusters,
        collapse_index: ics,
        total_weighted_pressure: totalWeighted,
        late_count: lateCount,
        timestamp: new Date().toISOString(),
        // structural details
        structural: {
            centers: centersOutput,
            total_weighted_pressure: totalWeighted,
            pressure_ratio: validatedInput.liquidity.available_cash > 0
                ? totalWeighted / validatedInput.liquidity.available_cash
                : 0,
            available_liquidity: validatedInput.liquidity.available_cash,
        },
        temporal: {
            zpf_start_date: zpfStart,
            nominal_collapse_date,
            structural_collapse_date,
            day_base: null, // lab computes when needed
        },
        risk: {
            nominal_index,
            structural_index,
            consolidated_index,
            late_obligation_count: lateCount,
        },
    };
}
