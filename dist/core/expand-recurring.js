/**
 * Expande obrigações recorrentes em múltiplas instâncias
 */
export function expandRecurring(obligations, horizonDays) {
    const expanded = [];
    const baseDate = new Date();
    for (const obligation of obligations) {
        if (!obligation.recurring) {
            expanded.push(obligation);
            continue;
        }
        const frequencyDays = {
            WEEKLY: 7,
            MONTHLY: 30,
            YEARLY: 365,
        };
        const interval = frequencyDays[obligation.recurring.frequency] || 30;
        let currentDate = new Date(obligation.due_date);
        while ((currentDate.getTime() - baseDate.getTime()) / 86400000 <= horizonDays) {
            expanded.push({
                ...obligation,
                id: `${obligation.id}-${currentDate.toISOString().split("T")[0]}`,
                due_date: currentDate.toISOString().split("T")[0],
                recurring: undefined,
            });
            currentDate = new Date(currentDate.getTime() + interval * 86400000);
        }
    }
    return expanded;
}
