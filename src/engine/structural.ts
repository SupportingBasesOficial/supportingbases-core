import { Obligation } from "../types/sb-contracts";
import { ProjectionConfig } from "../types/projection-config";
import { weightedAmount } from "./weights";

export function computeStructural(
  obligations: Obligation[],
  available_cash: number,
  config: ProjectionConfig
) {
  const centers: Record<string, { total_weighted_pressure: number; dominant_layer: 1 | 2 | 3 }> = {};

  for (const o of obligations) {
    const w = weightedAmount(o, config);
    const c = centers[o.center_id] ?? { total_weighted_pressure: 0, dominant_layer: o.layer };
    c.total_weighted_pressure += w;
    c.dominant_layer = Math.min(c.dominant_layer, o.layer) as 1 | 2 | 3;
    centers[o.center_id] = c;
  }

  const total_weighted_pressure = Object.values(centers).reduce(
    (s, c) => s + c.total_weighted_pressure,
    0
  );
  const pressure_ratio = available_cash > 0 ? total_weighted_pressure / available_cash : Infinity;

  return {
    centers,
    total_weighted_pressure,
    pressure_ratio,
    available_liquidity: available_cash,
  };
}
