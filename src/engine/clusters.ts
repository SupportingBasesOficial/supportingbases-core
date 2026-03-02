import { Obligation } from "../types/sb-contracts";
import { ProjectionConfig } from "../types/projection-config";
import { fromISODate, diffDays } from "./date-utils";
import { effectiveAmount, weightedAmount } from "./weights";

export interface PressureCluster {
  obligations: Array<Obligation & { weighted_amount: number; effective_amount: number }>;
  total_amount: number;
  total_weighted: number;
  cluster_start: string;
  cluster_end: string;
}

export function buildClusters(obligations: Obligation[], config: ProjectionConfig): PressureCluster[] {
  const sorted = [...obligations].sort(
    (a, b) => fromISODate(a.due_date).getTime() - fromISODate(b.due_date).getTime()
  );

  const clusters: PressureCluster[] = [];
  let current: PressureCluster | null = null;

  for (const o of sorted) {
    const eff = effectiveAmount(o, config);
    const w = weightedAmount(o, config);

    if (!current) {
      current = {
        obligations: [{ ...o, effective_amount: eff, weighted_amount: w }],
        total_amount: eff,
        total_weighted: w,
        cluster_start: o.due_date,
        cluster_end: o.due_date,
      };
      continue;
    }

    const lastDate = fromISODate(current.cluster_end);
    const thisDate = fromISODate(o.due_date);
    const gap = diffDays(lastDate, thisDate);

    if (gap <= config.cluster_gap_days) {
      current.obligations.push({ ...o, effective_amount: eff, weighted_amount: w });
      current.total_amount += eff;
      current.total_weighted += w;
      current.cluster_end = o.due_date;
    } else {
      clusters.push(current);
      current = {
        obligations: [{ ...o, effective_amount: eff, weighted_amount: w }],
        total_amount: eff,
        total_weighted: w,
        cluster_start: o.due_date,
        cluster_end: o.due_date,
      };
    }
  }

  if (current) clusters.push(current);
  return clusters;
}
