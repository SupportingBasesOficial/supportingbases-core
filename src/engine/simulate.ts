import { Inflow, Obligation } from "../types/sb-contracts";
import { ProjectionConfig } from "../types/projection-config";
import { addDays, fromISODate, toISODate } from "./date-utils";
import { effectiveAmount, weightedAmount } from "./weights";

export interface DayRow {
  date: string;
  total_obligation: number;
  total_weighted: number;
  inflow_effective: number;
  liquidity_nominal: number;
  liquidity_structural: number;
  pressure_index: number;
}

export function simulateDays(params: {
  startISO: string;
  available_cash: number;
  obligations: Obligation[];
  inflows?: Inflow[];
  config: ProjectionConfig;
}): { rows: DayRow[]; nominal_collapse_date: string | null; structural_collapse_date: string | null } {
  const { startISO, available_cash, obligations, inflows, config } = params;
  const start = fromISODate(startISO);

  const obMap = new Map<string, Obligation[]>();
  for (const o of obligations) {
    if (!obMap.has(o.due_date)) obMap.set(o.due_date, []);
    obMap.get(o.due_date)!.push(o);
  }

  const inMap = new Map<string, number>();
  for (const inf of inflows ?? []) {
    const eff = inf.amount * inf.reliability;
    inMap.set(inf.expected_date, (inMap.get(inf.expected_date) ?? 0) + eff);
  }

  let liqNominal = available_cash;
  let liqStructural = available_cash;
  let nominalCollapse: string | null = null;
  let structuralCollapse: string | null = null;
  const rows: DayRow[] = [];

  for (let i = 0; i < config.horizon_days; i++) {
    const cur = addDays(start, i);
    const iso = toISODate(cur);

    const dayObs = obMap.get(iso) ?? [];
    const dayIn = inMap.get(iso) ?? 0;

    const totalNominalOut = dayObs.reduce((s, o) => s + effectiveAmount(o, config), 0);
    const totalWeightedOut = dayObs.reduce((s, o) => s + weightedAmount(o, config), 0);

    liqNominal = liqNominal + dayIn - totalNominalOut;
    liqStructural = liqStructural + dayIn - totalWeightedOut;

    if (liqNominal < 0 && !nominalCollapse) nominalCollapse = iso;
    if (liqStructural < 0 && !structuralCollapse) structuralCollapse = iso;

    rows.push({
      date: iso,
      total_obligation: totalNominalOut,
      total_weighted: totalWeightedOut,
      inflow_effective: dayIn,
      liquidity_nominal: liqNominal,
      liquidity_structural: liqStructural,
      pressure_index: available_cash > 0 ? totalWeightedOut / available_cash : 100,
    });
  }

  return { rows, nominal_collapse_date: nominalCollapse, structural_collapse_date: structuralCollapse };
}

export function nominalIndexFromSimulation(rows: DayRow[], available_cash: number): number {
  const collapse = rows.find((r) => r.liquidity_nominal < 0);
  if (collapse) return 100;

  if (available_cash <= 0) return 100;

  const maxOut = rows.reduce((m, r) => Math.max(m, r.total_obligation), 0);
  const stress = maxOut / available_cash;
  const scaled = Math.min(99, Math.round(stress * 70));
  return Math.max(0, scaled);
}
