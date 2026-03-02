export interface ProjectionConfig {
  horizon_days: number;
  late_multiplier: number;
  layer_weights: { 1: number; 2: number; 3: number };
  cluster_gap_days: number;
  include_paid: boolean;
}
