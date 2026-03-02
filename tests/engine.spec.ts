import { structuralIndexFromRatio, calculateConsolidatedIndex } from "../src/engine/indexes";
import { nominalIndexFromSimulation, DayRow } from "../src/engine/simulate";

describe("structuralIndexFromRatio", () => {
  test("ratio 0 => 0", () => {
    expect(structuralIndexFromRatio(0)).toBe(0);
  });

  test("large ratio => near 100", () => {
    expect(structuralIndexFromRatio(10)).toBe(99);
  });
});

describe("calculateConsolidatedIndex", () => {
  test("nominal >= 80 wins", () => {
    expect(calculateConsolidatedIndex(85, 95)).toBe(85);
  });

  test("structural >= 90 wins when nominal < 80", () => {
    expect(calculateConsolidatedIndex(77, 93.4)).toBe(93);
  });

  test("weighted mix when both low", () => {
    expect(calculateConsolidatedIndex(50, 60)).toBe(54);
  });
});

describe("nominalIndexFromSimulation", () => {
  test("detects collapse and returns 100", () => {
    const rows: DayRow[] = [
      {
        date: "2026-03-01",
        total_obligation: 100,
        total_weighted: 300,
        inflow_effective: 0,
        liquidity_nominal: 50,
        liquidity_structural: -250,
        pressure_index: 0.3,
      },
      {
        date: "2026-03-02",
        total_obligation: 100,
        total_weighted: 300,
        inflow_effective: 0,
        liquidity_nominal: -50,
        liquidity_structural: -550,
        pressure_index: 0.3,
      },
    ];

    expect(nominalIndexFromSimulation(rows, 100)).toBe(100);
  });
});
