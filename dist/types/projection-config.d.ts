export type ProjectionConfig = {
    mode: "UNTIL_COLLAPSE";
} | {
    mode: "FIXED_HORIZON";
    horizon_days: number;
} | {
    mode: "CYCLES";
    cycle_count: number;
};
