/**
 * Simula ciclos de liquidez e comprometimento
 */
import { Obligation } from "../types/sb-input.js";
export interface CycleResult {
    cycle_number: number;
    start_date: string;
    end_date: string;
    obligations_processed: number;
    total_paid: number;
    remaining_obligations: number;
    final_liquidity: number;
    cycle_status: "STABLE" | "STRESSED" | "CRITICAL";
}
export declare function simulateCycle(obligations: Obligation[], availableCash: number, cycleLength?: number): CycleResult;
