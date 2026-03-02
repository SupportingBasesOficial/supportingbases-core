export declare const ENGINE_VERSION = "1.1.0";
export declare function runEngine(input: unknown, config: unknown): {
    meta: {
        engine_version: string;
        deterministic: boolean;
    };
    clusters: import("./pressure/cluster.js").Cluster[];
    collapse_index: number;
    total_weighted_pressure: number;
    late_count: number;
    timestamp: string;
    structural: {
        centers: Record<string, {
            total_weighted_pressure: number;
            dominant_layer: 1 | 2 | 3;
        }>;
        total_weighted_pressure: number;
        pressure_ratio: number;
        available_liquidity: number;
    };
    temporal: {
        zpf_start_date: any;
        nominal_collapse_date: string | null;
        structural_collapse_date: string | null;
        day_base: null;
    };
    risk: {
        nominal_index: number;
        structural_index: number;
        consolidated_index: number;
        late_obligation_count: number;
    };
};
