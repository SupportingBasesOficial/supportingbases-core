export function calculateICS(totalWeightedPressure, liquidity, lateCount, dependencyRatio) {
    if (liquidity <= 0)
        return 100;
    const pressureRatio = totalWeightedPressure / liquidity;
    const raw = pressureRatio * 50 +
        lateCount * 5 +
        dependencyRatio * 20;
    return Math.min(100, Math.round(raw));
}
