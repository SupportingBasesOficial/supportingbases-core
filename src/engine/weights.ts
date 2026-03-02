import { Obligation } from "../types/sb-contracts";
import { ProjectionConfig } from "../types/projection-config";

export function effectiveAmount(o: Obligation, config: ProjectionConfig): number {
  if (o.status === "LATE") return o.amount * config.late_multiplier;
  return o.amount;
}

export function weightedAmount(o: Obligation, config: ProjectionConfig): number {
  const base = effectiveAmount(o, config);
  const w = config.layer_weights[o.layer];
  return base * w;
}
