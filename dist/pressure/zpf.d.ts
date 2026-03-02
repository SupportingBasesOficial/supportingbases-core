/**
 * Zero-Pressure Frontier (ZPF) - Calcula a fronteira de pressão zero
 * Determina quais obrigações podem ser pagas com liquidez disponível
 */
export declare function calculateZPF(obligations: any[], availableCash: number): {
    affordable: any[];
    frontier: number;
    shortfall: number;
};
