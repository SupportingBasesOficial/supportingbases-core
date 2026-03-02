export interface Cluster {
    obligations: any[];
    total_amount: number;
    cluster_start: string;
    cluster_end: string;
}
export interface CenterOutput {
    total_weighted_pressure: number;
    dominant_layer: 1 | 2 | 3;
}
export interface SBOutput {
    meta: {
        engine_version: string;
        deterministic: true;
    };
    clusters: Cluster[];
    collapse_index: number;
    total_weighted_pressure: number;
    late_count: number;
    timestamp: string;
    structural: {
        centers: Record<string, CenterOutput>;
        total_weighted_pressure: number;
        pressure_ratio: number;
        available_liquidity: number;
    };
    temporal: {
        zpf_start_date: string | null;
        nominal_collapse_date: string | null;
        structural_collapse_date: string | null;
        day_base: any | null;
    };
    risk: {
        nominal_index: number;
        structural_index: number;
        consolidated_index: number;
        late_obligation_count: number;
    };
}
