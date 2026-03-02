import { z } from "zod";

// DO NOT MODIFY WITHOUT MAJOR VERSION INCREMENT

/**
 * ProjectionConfig Validation Schema v1.0.0
 * Strictly enforces contract for projection configuration
 */

export const ProjectionConfigSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("UNTIL_COLLAPSE").describe("Project until system collapse"),
  }),
  z.object({
    mode: z.literal("FIXED_HORIZON").describe("Project for fixed days"),
    horizon_days: z.number().int().min(1).describe("Projection horizon in days >= 1"),
  }),
  z.object({
    mode: z.literal("CYCLES").describe("Project for fixed cycles"),
    cycle_count: z.number().int().min(1).describe("Number of cycles >= 1"),
  }),
]);

export type ProjectionConfigSchemaType = z.infer<typeof ProjectionConfigSchema>;
