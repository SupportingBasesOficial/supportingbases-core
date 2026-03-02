export interface NominalResult {
    nominal_index: number;
    nominal_collapse_date: string | null;
}
export interface StructuralResult {
    structural_index: number;
    structural_collapse_date: string | null;
}
export declare function calculateNominalIndex(obligations: Array<{
    due_date: string;
    amount: number;
}>, availableCash: number, horizonDays: number): NominalResult;
export declare function calculateStructuralIndex(obligations: Array<{
    due_date: string;
    amount: number;
    layer: 1 | 2 | 3;
    status: string;
}>, availableCash: number): StructuralResult;
export declare function calculateConsolidatedIndex(nominal_index: number, structural_index: number): number;
