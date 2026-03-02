import { z } from "zod";
export declare const SBInputSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        engine_version: z.ZodString;
        analysis_timestamp: z.ZodString;
        profile_type: z.ZodEnum<{
            INDIVIDUAL: "INDIVIDUAL";
            AUTONOMOUS: "AUTONOMOUS";
            ORGANIZATION: "ORGANIZATION";
        }>;
    }, z.core.$strip>;
    liquidity: z.ZodObject<{
        available_cash: z.ZodNumber;
    }, z.core.$strip>;
    inflows: z.ZodOptional<z.ZodArray<z.ZodObject<{
        expected_date: z.ZodString;
        amount: z.ZodNumber;
        reliability: z.ZodNumber;
    }, z.core.$strip>>>;
    obligations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        center_id: z.ZodString;
        due_date: z.ZodString;
        amount: z.ZodNumber;
        layer: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            PAID: "PAID";
            LATE: "LATE";
        }>;
        recurring: z.ZodOptional<z.ZodObject<{
            frequency: z.ZodEnum<{
                MONTHLY: "MONTHLY";
                WEEKLY: "WEEKLY";
                YEARLY: "YEARLY";
            }>;
            interval: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
export type SBInputSchemaType = z.infer<typeof SBInputSchema>;
