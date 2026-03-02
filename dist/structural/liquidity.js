/**
 * Análise de liquidez estrutural
 */
export function analyzeLiquidity(availableCash, totalWeightedPressure, dailyAveragePressure) {
    const committed = totalWeightedPressure;
    const free = Math.max(0, availableCash - committed);
    const ratio = availableCash > 0 ? free / availableCash : 0;
    const depletion = dailyAveragePressure > 0
        ? Math.floor(availableCash / dailyAveragePressure)
        : Infinity;
    return {
        available_cash: availableCash,
        committed,
        free_liquidity: free,
        liquidity_ratio: ratio,
        days_to_depletion: depletion === Infinity ? 999 : depletion,
    };
}
