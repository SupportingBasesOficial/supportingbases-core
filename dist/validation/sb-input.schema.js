import { z } from "zod";
// DO NOT MODIFY WITHOUT MAJOR VERSION INCREMENT
/**
 * SBInput Validation Schema v1.0.0
 * Strictly enforces contract for Supporting Bases Input data
 */
const MetadataSchema = z.object({
    engine_version: z.string().describe("Engine version string"),
    analysis_timestamp: z.string().describe("ISO 8601 datetime").refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid ISO datetime" }),
    profile_type: z.enum(["INDIVIDUAL", "AUTONOMOUS", "ORGANIZATION"]).describe("Analysis profile type"),
});
const LiquiditySchema = z.object({
    available_cash: z.number().min(0).describe("Available cash balance >= 0"),
});
const InflowSchema = z.object({
    expected_date: z.string().describe("Expected inflow date ISO 8601").refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid ISO datetime" }),
    amount: z.number().min(0).describe("Inflow amount >= 0"),
    reliability: z.number().min(0).max(1).describe("Reliability factor 0-1"),
});
const RecurringSchema = z.object({
    frequency: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).describe("Recurrence frequency"),
    interval: z.number().int().min(1).describe("Interval >= 1"),
});
const ObligationSchema = z.object({
    id: z.string().describe("Unique obligation identifier"),
    center_id: z.string().describe("Center identifier for consolidation"),
    due_date: z.string().describe("Due date ISO 8601").refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid ISO datetime" }),
    amount: z.number().min(0).describe("Obligation amount >= 0"),
    layer: z.union([z.literal(1), z.literal(2), z.literal(3)]).describe("Priority layer: 1 (critical) | 2 (important) | 3 (normal)"),
    status: z.enum(["PENDING", "PAID", "LATE"]).describe("Obligation status"),
    recurring: RecurringSchema.optional().describe("Optional recurrence pattern"),
});
export const SBInputSchema = z.object({
    metadata: MetadataSchema.describe("Engine metadata"),
    liquidity: LiquiditySchema.describe("Liquidity information"),
    inflows: z.array(InflowSchema).optional().describe("Optional expected inflows"),
    obligations: z.array(ObligationSchema).min(1).describe("Collection of obligations (min 1)"),
}).strict();
