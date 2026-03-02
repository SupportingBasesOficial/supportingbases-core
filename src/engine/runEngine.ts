import { SBInput, SBOutput } from "../types/sb-contracts";
import { ProjectionConfig } from "../types/projection-config";
import { parseSBInput } from "../validators/sb-input";
import { expandRecurrences } from "./recurrence";
import { buildClusters } from "./clusters";
import { computeStructural } from "./structural";
import { structuralIndexFromRatio, calculateConsolidatedIndex } from "./indexes";
import { simulateDays, nominalIndexFromSimulation } from "./simulate";
import { toISODate } from "./date-utils";

export function runEngine(rawInput: unknown, config: ProjectionConfig): SBOutput {
  const input: SBInput = parseSBInput(rawInput);
  const timestamp = new Date().toISOString();

  const analysisDateISO = input.metadata.analysis_timestamp.slice(0, 10);

  const expanded = expandRecurrences(input.obligations, analysisDateISO, config);
  const clusters = buildClusters(expanded, config);

  const structural = computeStructural(expanded, input.liquidity.available_cash, config);
  const structural_index = structuralIndexFromRatio(structural.pressure_ratio);

  const sim = simulateDays({
    startISO: analysisDateISO,
    available_cash: input.liquidity.available_cash,
    obligations: expanded,
    inflows: input.inflows,
    config,
  });

  const nominal_index = nominalIndexFromSimulation(sim.rows, input.liquidity.available_cash);
  const consolidated_index = calculateConsolidatedIndex(nominal_index, structural_index);
  const late_count = expanded.filter((o) => o.status === "LATE").length;

  let zpf_start_date: string | null = null;
  if (clusters.length > 0) {
    const withLayer1 = clusters.find((c) => c.obligations.some((o) => o.layer === 1));
    zpf_start_date = (withLayer1 ?? clusters[0]).cluster_start;
  }

  return {
    meta: {
      engine_version: input.metadata.engine_version,
      deterministic: true,
      timestamp,
    },
    clusters: clusters.map((c) => ({
      obligations: c.obligations,
      total_amount: c.total_amount,
      total_weighted: c.total_weighted,
      cluster_start: c.cluster_start,
      cluster_end: c.cluster_end,
    })),
    structural: {
      centers: structural.centers,
      total_weighted_pressure: structural.total_weighted_pressure,
      pressure_ratio: structural.pressure_ratio,
      available_liquidity: structural.available_liquidity,
    },
    temporal: {
      zpf_start_date,
      nominal_collapse_date: sim.nominal_collapse_date,
      structural_collapse_date: sim.structural_collapse_date,
      day_base: sim.rows.map((r) => ({
        date: toISODate(new Date(`${r.date}T00:00:00.000Z`)),
        total_obligation: r.total_obligation,
        total_weighted: r.total_weighted,
        liquidity_nominal: r.liquidity_nominal,
        liquidity_structural: r.liquidity_structural,
        pressure_index: r.pressure_index,
      })),
    },
    risk: {
      nominal_index,
      structural_index,
      consolidated_index,
      late_obligation_count: late_count,
    },
  };
}
