/**
 * Expande obrigações recorrentes em múltiplas instâncias
 */
import { Obligation } from "../types/sb-input.js";
export declare function expandRecurring(obligations: Obligation[], horizonDays: number): Obligation[];
