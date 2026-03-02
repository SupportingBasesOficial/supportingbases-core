import { z } from "zod";
import { SBInput } from "../types/sb-contracts";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoTimestamp = z.string().datetime();

const RecurrenceSchema = z.object({
  frequency: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]),
  interval: z.number().int().min(1),
});

const ObligationSchema = z.object({
  id: z.string().min(1),
  center_id: z.string().min(1),
  due_date: isoDate,
  amount: z.number().min(0),
  layer: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(["PENDING", "PAID", "LATE"]),
  recurring: RecurrenceSchema.optional(),
});

const InflowSchema = z.object({
  expected_date: isoDate,
  amount: z.number().min(0),
  reliability: z.number().min(0).max(1),
});

export const SBInputSchema = z.object({
  metadata: z.object({
    engine_version: z.string().min(1),
    analysis_timestamp: isoTimestamp,
    profile_type: z.enum(["INDIVIDUAL", "AUTONOMOUS", "ORGANIZATION"]),
  }),
  liquidity: z.object({
    available_cash: z.number().min(0),
  }),
  inflows: z.array(InflowSchema).optional(),
  obligations: z.array(ObligationSchema).min(1),
});

export function parseSBInput(input: unknown): SBInput {
  const result = SBInputSchema.safeParse(input);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`)
      .join("; ");
    throw new Error(`SBInput validation failed: ${msg}`);
  }
  return result.data as SBInput;
}
