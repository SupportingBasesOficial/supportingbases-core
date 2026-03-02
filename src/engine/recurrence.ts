import { Obligation } from "../types/sb-contracts";
import { ProjectionConfig } from "../types/projection-config";
import { addDays, fromISODate, toISODate } from "./date-utils";

function addMonthsUTC(date: Date, months: number): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function addYearsUTC(date: Date, years: number): Date {
  const d = new Date(date);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
}

export function expandRecurrences(
  obligations: Obligation[],
  startISO: string,
  config: ProjectionConfig
): Obligation[] {
  const start = fromISODate(startISO);
  const end = addDays(start, config.horizon_days - 1);
  const out: Obligation[] = [];

  for (const o of obligations) {
    if (!config.include_paid && o.status === "PAID") continue;

    out.push(o);
    if (!o.recurring) continue;

    let cur = fromISODate(o.due_date);

    while (true) {
      const { frequency, interval } = o.recurring;
      if (frequency === "WEEKLY") cur = addDays(cur, 7 * interval);
      if (frequency === "MONTHLY") cur = addMonthsUTC(cur, interval);
      if (frequency === "YEARLY") cur = addYearsUTC(cur, interval);

      if (cur > end) break;

      const clone: Obligation = {
        ...o,
        due_date: toISODate(cur),
        status: "PENDING",
      };
      out.push(clone);
    }
  }

  return out;
}
