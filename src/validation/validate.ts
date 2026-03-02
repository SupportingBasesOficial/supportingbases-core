import { z } from "zod";
import { SBInputSchema, type SBInputSchemaType } from "./sb-input.schema.js";
import { ProjectionConfigSchema, type ProjectionConfigSchemaType } from "./projection-config.schema.js";

// DO NOT MODIFY WITHOUT MAJOR VERSION INCREMENT

/**
 * Structured validation error for clear debugging
 */
export class ValidationError extends Error {
  public readonly issues: z.ZodIssue[];

  constructor(message: string, issues: z.ZodIssue[]) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }

  toJSON() {
    return {
      error: "ValidationError",
      message: this.message,
      issues: this.issues.map((issue: z.ZodIssue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    };
  }
}

/**
 * Validates SBInput at runtime
 * Throws ValidationError if invalid
 * @param input unknown data to validate
 * @returns typed SBInput if valid
 * @throws ValidationError with structured issues if invalid
 */
export function validateInput(input: unknown): SBInputSchemaType {
  const result = SBInputSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues;
    const details = issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new ValidationError(`SBInput validation failed:\n${details}`, issues);
  }

  return result.data;
}

/**
 * Validates ProjectionConfig at runtime
 * Throws ValidationError if invalid
 * @param config unknown data to validate
 * @returns typed ProjectionConfig if valid
 * @throws ValidationError with structured issues if invalid
 */
export function validateConfig(config: unknown): ProjectionConfigSchemaType {
  const result = ProjectionConfigSchema.safeParse(config);

  if (!result.success) {
    const issues = result.error.issues;
    const details = issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new ValidationError(
      `ProjectionConfig validation failed:\n${details}`,
      issues
    );
  }

  return result.data;
}
