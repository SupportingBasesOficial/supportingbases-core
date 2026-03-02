export interface Recurring {
    frequency: "MONTHLY" | "WEEKLY" | "YEARLY";
    interval: number;
}
export interface Obligation {
    id: string;
    center_id: string;
    amount: number;
    due_date: string;
    layer: 1 | 2 | 3;
    status: "PENDING" | "PAID" | "LATE";
    recurring?: Recurring;
}
export interface Metadata {
    engine_version: string;
    analysis_timestamp: string;
    profile_type: "INDIVIDUAL" | "AUTONOMOUS" | "ORGANIZATION";
}
export interface Inflow {
    expected_date: string;
    amount: number;
    reliability: number;
}
export interface Liquidity {
    available_cash: number;
}
export interface SBInput {
    metadata: Metadata;
    liquidity: Liquidity;
    inflows?: Inflow[];
    obligations: Obligation[];
}
