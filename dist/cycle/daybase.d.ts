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
export declare function buildDaybase(obligations: any[], availableCash: number, startDate: string, horizonDays: number): DaybaseEntry[];
