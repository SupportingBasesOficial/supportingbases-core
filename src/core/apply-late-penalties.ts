/**
 * Aplica penalidades às obrigações vencidas
 */

import { Obligation } from "../types/sb-input.js";

export function applyLatePenalties(
  obligations: Obligation[],
  referenceDate: string
): Obligation[] {
  const reference = new Date(referenceDate);

  return obligations.map((o) => {
    const dueDate = new Date(o.due_date);
    const daysLate = Math.floor(
      (reference.getTime() - dueDate.getTime()) / 86400000
    );

    if (daysLate > 0 && o.status === "PENDING") {
      return {
        ...o,
        status: "LATE",
      };
    }

    return o;
  });
}
