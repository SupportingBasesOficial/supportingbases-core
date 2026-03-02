export const LAYER_WEIGHT = {
    1: 3.0,
    2: 2.0,
    3: 1.0,
};
export const LATE_MULTIPLIER = {
    1: 2.0,
    2: 1.5,
    3: 1.2,
};
export function weightedAmount(amount, layer, isLate) {
    const base = amount * LAYER_WEIGHT[layer];
    if (!isLate)
        return base;
    return base * LATE_MULTIPLIER[layer];
}
