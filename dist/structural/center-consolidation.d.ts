export interface CenterAggregation {
    total_amount: number;
    total_weighted: number;
    layer1_exposure: number;
    layer2_exposure: number;
    layer3_exposure: number;
}
export declare function groupByCenter(obligations: Array<{
    center_id: string;
    amount: number;
    layer: 1 | 2 | 3;
    weighted_amount: number;
}>): Record<string, CenterAggregation>;
