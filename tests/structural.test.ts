import { describe, it, expect } from "vitest";
import { analyzeLiquidity } from "../src/structural/liquidity";

describe("Structural Analysis", () => {
  it("should analyze liquidity correctly", () => {
    const analysis = analyzeLiquidity(10000, 3000, 100);

    expect(analysis.available_cash).toBe(10000);
    expect(analysis.committed).toBe(3000);
    expect(analysis.free_liquidity).toBe(7000);
    expect(analysis.liquidity_ratio).toBe(0.7);
    expect(analysis.days_to_depletion).toBe(100);
  });

  it("should handle zero cash scenario", () => {
    const analysis = analyzeLiquidity(0, 0, 0);

    expect(analysis.available_cash).toBe(0);
    expect(analysis.liquidity_ratio).toBe(0);
  });
});
