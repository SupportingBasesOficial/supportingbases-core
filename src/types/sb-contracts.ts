export type ProfileType = "INDIVIDUAL" | "AUTONOMOUS" | "ORGANIZATION";

export interface Recurrence {
  frequency: "MONTHLY" | "WEEKLY" | "YEARLY";
  interval: number;
}

export interface Obligation {
  id: string;
  center_id: string;
  due_date: string;
  amount: number;
  layer: 1 | 2 | 3;
  status: "PENDING" | "PAID" | "LATE";
  recurring?: Recurrence;
}

export interface Inflow {
  expected_date: string;
  amount: number;
  reliability: number;
}

export interface SBInput {
  metadata: {
    engine_version: string;
    analysis_timestamp: string;
    profile_type: ProfileType;
  };
  liquidity: {
    available_cash: number;
  };
  inflows?: Inflow[];
  obligations: Obligation[];
}

export interface StructuralOutput {
  total_weighted_pressure: number;
  available_liquidity: number;
  pressure_ratio: number;
  centers: Record<
    string,
    {
      total_weighted_pressure: number;
      dominant_layer: 1 | 2 | 3;
    }
  >;
}

export interface TemporalDay {
  date: string;
  total_obligation: number;
  total_weighted: number;
  liquidity_nominal: number;
  liquidity_structural: number;
  pressure_index: number;
}

export interface SBOutput {
  structural: StructuralOutput;
  temporal: {
    zpf_start_date: string | null;
    nominal_collapse_date: string | null;
    structural_collapse_date: string | null;
    day_base: TemporalDay[];
  };
  risk: {
    nominal_index: number;
    structural_index: number;
    consolidated_index: number;
    late_obligation_count: number;
  };
  clusters: Array<{
    obligations: Array<Obligation & { weighted_amount: number; effective_amount: number }>;
    total_amount: number;
    total_weighted: number;
    cluster_start: string;
    cluster_end: string;
  }>;
  meta: {
    engine_version: string;
    deterministic: true;
    timestamp: string;
  };
}
