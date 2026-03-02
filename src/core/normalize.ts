/**
 * Normaliza e valida dados de entrada
 */

import { SBInput, Obligation } from "../types/sb-input.js";
import { ENGINE_VERSION } from "../engine.js";

export function normalize(input: any): SBInput {
  if (!input.obligations || !Array.isArray(input.obligations)) {
    throw new Error("obligations deve ser um array");
  }

  const metadata = input.metadata || {
    engine_version: ENGINE_VERSION,
    analysis_timestamp: new Date().toISOString(),
    profile_type: input.profile_type || "INDIVIDUAL",
  };

  const liquidity = {
    available_cash:
      typeof input.available_cash === "number" && input.available_cash >= 0
        ? input.available_cash
        : 0,
  };

  const normalized: SBInput = {
    metadata,
    liquidity,
    inflows: Array.isArray(input.inflows)
      ? input.inflows.map((f: any) => ({
          expected_date: f.expected_date,
          amount: Number(f.amount),
          reliability: Number(f.reliability),
        }))
      : undefined,
    obligations: input.obligations.map((o: any) => ({
      id: o.id || `obligation-${Date.now()}`,
      center_id: o.center_id || "default",
      amount: Number(o.amount),
      due_date: o.due_date,
      layer: o.layer || 3,
      status: o.status || "PENDING",
      recurring:
        o.recurring && typeof o.recurring === "object"
          ? { frequency: o.recurring.frequency, interval: o.recurring.interval }
          : undefined,
    })),
  };

  return normalized;
}
