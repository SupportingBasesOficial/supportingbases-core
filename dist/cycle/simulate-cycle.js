/**
 * Simula ciclos de liquidez e comprometimento
 */
export function simulateCycle(obligations, availableCash, cycleLength = 30) {
    let cycle = 1;
    let cash = availableCash;
    let paid = 0;
    let processed = 0;
    const sorted = [...obligations].sort((a, b) => new Date(a.due_date).getTime() -
        new Date(b.due_date).getTime());
    const cycleCutoff = new Date(sorted[0].due_date);
    cycleCutoff.setDate(cycleCutoff.getDate() + cycleLength);
    for (const obligation of sorted) {
        const dueDate = new Date(obligation.due_date);
        if (dueDate > cycleCutoff)
            break;
        if (cash >= obligation.amount) {
            cash -= obligation.amount;
            paid += obligation.amount;
        }
        processed++;
    }
    const remaining = obligations.length - processed;
    let status = "STABLE";
    if (cash < availableCash * 0.2)
        status = "STRESSED";
    if (cash < availableCash * 0.05)
        status = "CRITICAL";
    return {
        cycle_number: cycle,
        start_date: sorted[0].due_date,
        end_date: new Date(cycleCutoff).toISOString().split("T")[0],
        obligations_processed: processed,
        total_paid: paid,
        remaining_obligations: remaining,
        final_liquidity: cash,
        cycle_status: status,
    };
}
