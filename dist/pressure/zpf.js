/**
 * Zero-Pressure Frontier (ZPF) - Calcula a fronteira de pressão zero
 * Determina quais obrigações podem ser pagas com liquidez disponível
 */
export function calculateZPF(obligations, availableCash) {
    let accumulator = 0;
    const affordable = [];
    // Ordena por data de vencimento
    const sorted = [...obligations].sort((a, b) => new Date(a.due_date).getTime() -
        new Date(b.due_date).getTime());
    for (const obligation of sorted) {
        if (accumulator + obligation.weighted_amount <= availableCash) {
            accumulator += obligation.weighted_amount;
            affordable.push(obligation);
        }
        else {
            break;
        }
    }
    return {
        affordable,
        frontier: accumulator,
        shortfall: Math.max(0, obligations.reduce((sum, o) => sum + o.weighted_amount, 0) - accumulator),
    };
}
