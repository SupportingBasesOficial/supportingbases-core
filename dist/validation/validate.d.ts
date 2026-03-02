import { z } from "zod";
import { type SBInputSchemaType } from "./sb-input.schema.js";
import { type ProjectionConfigSchemaType } from "./projection-config.schema.js";
/**
 * Structured validation error for clear debugging
 */
export declare class ValidationError extends Error {
    readonly issues: z.ZodIssue[];
    constructor(message: string, issues: z.ZodIssue[]);
    toJSON(): {
        error: string;
        message: string;
        issues: {
            path: string;
            message: string;
            code: "custom" | "invalid_type" | "unrecognized_keys" | "invalid_union" | "too_big" | "too_small" | "invalid_key" | "invalid_element" | "invalid_value" | "invalid_format" | "not_multiple_of";
        }[];
    };
}
/**
 * Validates SBInput at runtime
 * Throws ValidationError if invalid
 * @param input unknown data to validate
 * @returns typed SBInput if valid
 * @throws ValidationError with structured issues if invalid
 */
export declare function validateInput(input: unknown): SBInputSchemaType;
/**
 * Validates ProjectionConfig at runtime
 * Throws ValidationError if invalid
 * @param config unknown data to validate
 * @returns typed ProjectionConfig if valid
 * @throws ValidationError with structured issues if invalid
 */
export declare function validateConfig(config: unknown): ProjectionConfigSchemaType;
