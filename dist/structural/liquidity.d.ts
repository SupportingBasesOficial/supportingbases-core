/**
 * Análise de liquidez estrutural
 */
export interface LiquidityAnalysis {
    available_cash: number;
    committed: number;
    free_liquidity: number;
    liquidity_ratio: number;
    days_to_depletion: number;
}
export declare function analyzeLiquidity(availableCash: number, totalWeightedPressure: number, dailyAveragePressure: number): LiquidityAnalysis;
