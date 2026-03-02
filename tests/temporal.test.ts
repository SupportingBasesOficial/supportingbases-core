import { describe, it, expect } from "vitest";
import { buildDaybase } from "../src/cycle/daybase";

describe("Temporal Analysis", () => {
  it("should build daybase correctly", () => {
    const obligations = [
      {
        id: "1",
        amount: 1000,
        due_date: "2026-03-01",
        layer: 1,
        status: "ACTIVE",
        weighted_amount: 3000,
      },
    ];

    const daybase = buildDaybase(
      obligations,
      10000,
      "2026-03-01",
      5
    );

    expect(daybase).toHaveLength(5);
    expect(daybase[0].date).toBe("2026-03-01");
    expect(daybase[0].total_obligation).toBe(1000);
  });
});
