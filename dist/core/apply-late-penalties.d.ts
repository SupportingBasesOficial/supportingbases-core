/**
 * Aplica penalidades às obrigações vencidas
 */
import { Obligation } from "../types/sb-input.js";
export declare function applyLatePenalties(obligations: Obligation[], referenceDate: string): Obligation[];
