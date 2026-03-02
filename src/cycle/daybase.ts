/**
 * Daybase - Calcula bases diárias para simulações de ciclo
 */

export interface DaybaseEntry {
  date: string;
  total_obligation: number;
  total_weighted: number;
  liquidity: number;
  pressure_index: number;
}

export function buildDaybase(
  obligations: any[],
  availableCash: number,
  startDate: string,
  horizonDays: number
): DaybaseEntry[] {
  const daybase: DaybaseEntry[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < horizonDays; i++) {
    const dateStr = current.toISOString().split("T")[0];

    const dayObligations = obligations.filter(
      (o) => o.due_date === dateStr
    );

    const totalObligation = dayObligations.reduce(
      (sum, o) => sum + o.amount,
      0
    );
    const totalWeighted = dayObligations.reduce(
      (sum, o) => sum + (o.weighted_amount || 0),
      0
    );

    daybase.push({
      date: dateStr,
      total_obligation: totalObligation,
      total_weighted: totalWeighted,
      liquidity: availableCash,
      pressure_index: totalWeighted > 0 ? totalWeighted / availableCash : 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return daybase;
}
