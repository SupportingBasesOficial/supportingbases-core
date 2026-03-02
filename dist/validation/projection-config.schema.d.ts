import { z } from "zod";
/**
 * ProjectionConfig Validation Schema v1.0.0
 * Strictly enforces contract for projection configuration
 */
export declare const ProjectionConfigSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"UNTIL_COLLAPSE">;
}, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"FIXED_HORIZON">;
    horizon_days: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"CYCLES">;
    cycle_count: z.ZodNumber;
}, z.core.$strip>], "mode">;
export type ProjectionConfigSchemaType = z.infer<typeof ProjectionConfigSchema>;
