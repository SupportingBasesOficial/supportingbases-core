import { describe, it, expect } from "vitest";
import { calculateICS } from "../src/risk/collapse-index";
import { weightedAmount } from "../src/risk/weighted-pressure";
import {
  calculateNominalIndex,
  calculateStructuralIndex,
  calculateConsolidatedIndex,
} from "../src/risk/collapse-v1";

describe("Risk Analysis", () => {
  it("should calculate weighted amount correctly", () => {
    const amount = 1000;

    const layer1 = weightedAmount(amount, 1, false);
    expect(layer1).toBe(3000);

    const layer2 = weightedAmount(amount, 2, false);
    expect(layer2).toBe(2000);

    const layer3 = weightedAmount(amount, 3, false);
    expect(layer3).toBe(1000);
  });

  it("should apply late multiplier", () => {
    const amount = 1000;

    const late1 = weightedAmount(amount, 1, true);
    expect(late1).toBe(6000); // 3000 * 2.0

    const late2 = weightedAmount(amount, 2, true);
    expect(late2).toBe(3000); // 2000 * 1.5
  });

  it("should calculate ICS (Collapse Index Score)", () => {
    const ics = calculateICS(5000, 10000, 5, 0.5);
    expect(ics).toBeGreaterThan(0);
    expect(ics).toBeLessThanOrEqual(100);
  });

  it("should return 100 when liquidity is zero", () => {
    const ics = calculateICS(5000, 0, 0, 0);
    expect(ics).toBe(100);
  });

  // new helpers
  it("nominal index returns 0 when no collapse or horizon infinite", () => {
    const { nominal_index, nominal_collapse_date } =
      calculateNominalIndex([], 100, Infinity);
    expect(nominal_index).toBe(0);
    expect(nominal_collapse_date).toBeNull();
  });
  it("structural index saturates and reports date", () => {
    const { structural_index, structural_collapse_date } =
      calculateStructuralIndex(
        [{ due_date: "2026-03-01", amount: 100, layer: 1, status: "PENDING" }],
        50
      );
    expect(structural_index).toBeGreaterThan(0);
    expect(structural_collapse_date).toBe("2026-03-01");
  });
  it("consolidated index chooses higher index when thresholds", () => {
    expect(calculateConsolidatedIndex(85, 20)).toBe(85);
    expect(calculateConsolidatedIndex(50, 95)).toBe(95);
    expect(calculateConsolidatedIndex(50, 50)).toBe(Math.round(50 * 0.6 + 50 * 0.4));
  });
});
