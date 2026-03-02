import { describe, it, expect } from "vitest";
import { runEngine } from "../src";
import { weightedAmount } from "../src/risk/weighted-pressure";

const baseMetadata = {
  engine_version: "1.0.0",
  analysis_timestamp: new Date().toISOString(),
  profile_type: "INDIVIDUAL",
};

function buildInput({ obligations, available_cash = 10000 }: any) {
  return {
    metadata: baseMetadata,
    liquidity: { available_cash },
    obligations,
  };
}

describe("Engine - Multi-center and edge scenarios", () => {
  it("Multiple centers consolidation", () => {
    const obligations = [
      { id: "a1", center_id: "C1", due_date: "2026-03-01", amount: 1000, layer: 1, status: "PENDING" },
      { id: "a2", center_id: "C1", due_date: "2026-03-05", amount: 500, layer: 2, status: "PENDING" },
      { id: "b1", center_id: "C2", due_date: "2026-03-02", amount: 200, layer: 3, status: "PENDING" },
    ];

    const out = runEngine(buildInput({ obligations }), {});

    expect(out.structural.centers["C1"].total_weighted_pressure).toBe(
      weightedAmount(1000, 1, false) + weightedAmount(500, 2, false)
    );

    expect(out.structural.centers["C2"].total_weighted_pressure).toBe(
      weightedAmount(200, 3, false)
    );

    expect(out.structural.centers["C1"].dominant_layer).toBe(1);
  });

  it("Single center consolidation", () => {
    const obligations = [
      { id: "x1", center_id: "ONLY", due_date: "2026-03-01", amount: 1000, layer: 2, status: "PENDING" },
    ];

    const out = runEngine(buildInput({ obligations }), {});
    expect(Object.keys(out.structural.centers)).toHaveLength(1);
    expect(out.structural.centers["ONLY"].dominant_layer).toBe(2);
  });

  it("Empty center (zero-amount obligation)", () => {
    const obligations = [
      { id: "z1", center_id: "Z", due_date: "2026-03-01", amount: 0, layer: 3, status: "PENDING" },
    ];

    const out = runEngine(buildInput({ obligations }), {});
    expect(out.structural.centers["Z"].total_weighted_pressure).toBe(0);
    expect(out.structural.centers["Z"].dominant_layer).toBe(1); // tie-breaker deterministic: layer1 by default when all zero
  });

  it("Liquidity zero => collapse_index == 100 (and structural index saturates)", () => {
    const obligations = [
      { id: "l1", center_id: "C", due_date: new Date().toISOString().split("T")[0], amount: 1000, layer: 1, status: "PENDING" },
    ];

    const out = runEngine(buildInput({ obligations, available_cash: 0 }), {});
    expect(out.risk.consolidated_index).toBe(100);
    // new fields
    expect(out.risk.structural_index).toBe(100);
    expect(out.risk.nominal_index).toBe(0);
    expect(out.risk.consolidated_index).toBe(100);
    expect(out.risk.late_obligation_count).toBe(0);
    // nominal collapse date still reported when available cash zero (first obligation)
    expect(out.temporal.nominal_collapse_date).toBe(obligations[0].due_date);
    // structural collapse date should be the same as first obligation as threshold triggers immediately
    expect(out.temporal.structural_collapse_date).toBe(obligations[0].due_date);
  });

  it("Only layer1 obligations weight hierarchy", () => {
    const obligations = [
      { id: "p1", center_id: "L", due_date: "2026-03-01", amount: 1000, layer: 1, status: "PENDING" },
    ];

    const out = runEngine(buildInput({ obligations }), {});
    expect(out.total_weighted_pressure).toBe(weightedAmount(1000, 1, false));
  });

  it("Only layer3 obligations produce lower ICS than layer1 (same amounts) and lower structural index", () => {
    const obligations1 = [
      { id: "a", center_id: "S", due_date: "2026-03-01", amount: 1000, layer: 1, status: "PENDING" },
    ];
    const obligations3 = [
      { id: "b", center_id: "S", due_date: "2026-03-01", amount: 1000, layer: 3, status: "PENDING" },
    ];

    const out1 = runEngine(buildInput({ obligations: obligations1 }), {});
    const out3 = runEngine(buildInput({ obligations: obligations3 }), {});

    expect(out3.total_weighted_pressure).toBeGreaterThan(0);
    expect(out1.total_weighted_pressure).toBeGreaterThan(out3.total_weighted_pressure);
    // structural index should also reflect hierarchy
    expect(out1.risk.structural_index).toBeGreaterThan(out3.risk.structural_index);
  });

  it("All obligations late apply penalty multiplier", () => {
    const obligations = [
      { id: "late1", center_id: "L", due_date: "2026-01-01", amount: 1000, layer: 2, status: "LATE" },
    ];

    const out = runEngine(buildInput({ obligations }), {});
    expect(out.total_weighted_pressure).toBe(weightedAmount(1000, 2, true));
  });

  it("Massive cluster within 3 days forms a cluster", () => {
    const obligations = [];
    const today = new Date("2026-03-01");
    for (let i = 0; i < 50; i++) {
      const d = new Date(today.getTime() + (i % 3) * 86400000);
      obligations.push({ id: `c${i}`, center_id: "CL", due_date: d.toISOString().split("T")[0], amount: 100, layer: 2, status: "PENDING" });
    }

    const out = runEngine(buildInput({ obligations }), {});
    expect(out.clusters.length).toBeGreaterThan(0);
    const totalObligations = out.clusters.reduce((s: number, c: any) => s + c.total_amount, 0);
    expect(totalObligations).toBeGreaterThanOrEqual(50 * 100);
  });

  it("Large liquidity vs small pressure => ICS < 20", () => {
    const obligations = [
      { id: "s1", center_id: "L", due_date: "2026-03-01", amount: 100, layer: 3, status: "PENDING" },
    ];

    const out = runEngine(buildInput({ obligations, available_cash: 1000000 }), {});
    expect(out.risk.consolidated_index).toBeLessThan(20);
  });

  describe("Nominal/structural/consolidated index behavior", () => {
    it("should compute nominal index based on horizon", () => {
      const obligations = [
        { id: "n1", center_id: "X", due_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], amount: 200, layer: 1, status: "PENDING" },
        { id: "n2", center_id: "X", due_date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0], amount: 10000, layer: 1, status: "PENDING" },
      ];
      // horizon of 30 days ensures collapse happens within
      const out = runEngine(buildInput({ obligations, available_cash: 100 }), { mode: "FIXED_HORIZON", horizon_days: 30 });
      expect(out.risk.nominal_index).toBeGreaterThan(0);
      expect(out.temporal.nominal_collapse_date).not.toBeNull();
    });

    it("structural index saturates and date appears when weighted > liquidity", () => {
      const obligations = [
        { id: "s1", center_id: "Y", due_date: "2026-03-01", amount: 1000, layer: 1, status: "PENDING" },
      ];
      const out = runEngine(buildInput({ obligations, available_cash: 500 }), {});
      expect(out.risk.structural_index).toBeGreaterThan(0);
      expect(out.temporal.structural_collapse_date).toBe("2026-03-01");
    });

    it("consolidated index chooses nominal when >=80", () => {
      const today = new Date().toISOString().split("T")[0];
      const obligations = [
        { id: "c1", center_id: "Z", due_date: today, amount: 1000, layer: 1, status: "PENDING" },
      ];
      // horizon of 1 day; collapse at zero days gives nominal index ~100
      const out = runEngine(buildInput({ obligations, available_cash: 0 }), { mode: "FIXED_HORIZON", horizon_days: 1 });
      expect(out.risk.nominal_index).toBeGreaterThanOrEqual(80);
      expect(out.risk.consolidated_index).toBe(out.risk.nominal_index);
    });
  });
});
