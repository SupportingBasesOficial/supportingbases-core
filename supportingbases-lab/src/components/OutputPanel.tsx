import React from "react";
import { SBOutput, SBInput, ProjectionConfig } from "supportingbases-core";
import { calculateZPF } from "supportingbases-core/dist/pressure/zpf.js";
import { buildDaybase } from "supportingbases-core/dist/cycle/daybase.js";
import { weightedAmount } from "supportingbases-core/dist/risk/weighted-pressure.js";
import MetricBadge from "./MetricBadge";

interface Props {
  output: SBOutput | null;
  input: SBInput | null;
  config: ProjectionConfig | null;
  showRaw: boolean;
  toggleRaw: () => void;
}

const OutputPanel: React.FC<Props> = ({
  output,
  input,
  config,
  showRaw,
  toggleRaw,
}) => {
  if (!output || !input) {
    return <div>Run the engine to see results</div>;
  }

  const availableLiquidity = input.liquidity.available_cash;
  const pressureRatio =
    availableLiquidity > 0
      ? output.total_weighted_pressure / availableLiquidity
      : 0;

  // prepare data for temporal metrics
  let zpfStart = "N/A";
  let projectedCollapse = "N/A";
  let dayBase: any[] = [];

  const weighted = input.obligations.map((o: any) => ({
    ...o,
    weighted_amount: weightedAmount(
      o.amount,
      o.layer,
      o.status === "LATE"
    ),
  }));

  const zpf = calculateZPF(weighted, availableLiquidity);
  if (zpf.affordable.length > 0) {
    zpfStart = zpf.affordable[0].due_date;
  }

  if (config && (config as any).horizon_days != null) {
    dayBase = buildDaybase(
      weighted,
      availableLiquidity,
      new Date().toISOString().split("T")[0],
      (config as any).horizon_days
    );
    const collapseEntry = dayBase.find((d) => d.pressure_index >= 1);
    if (collapseEntry) {
      projectedCollapse = collapseEntry.date;
    }
  }

  return (
    <div>
      <h2>STRUCTURAL</h2>
      <div>Total weighted pressure: {output.total_weighted_pressure}</div>
      <div>Pressure ratio: {pressureRatio.toFixed(2)}</div>
      <div>Available liquidity: {availableLiquidity}</div>

      <h2>TEMPORAL</h2>
      <div>ZPF start date: {zpfStart}</div>
      <div>Projected collapse date: {projectedCollapse}</div>
      <div>
        Day base:{" "}
        <pre style={{ maxHeight: 200, overflow: "auto" }}>
          {JSON.stringify(dayBase, null, 2)}
        </pre>
      </div>

      <h2>RISK</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <MetricBadge label="Consolidated" value={output.risk.consolidated_index} className="primary" />
        <MetricBadge label="Nominal" value={output.risk.nominal_index} />
        <MetricBadge label="Structural" value={output.risk.structural_index} />
        <span>Late obligations: {output.risk.late_obligation_count}</span>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <strong>Collapse dates:</strong>
        <div>Nominal: {output.temporal.nominal_collapse_date || 'N/A'}</div>
        <div>Structural: {output.temporal.structural_collapse_date || 'N/A'}</div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={toggleRaw}>
          {showRaw ? "Hide" : "Show"} Raw Output JSON
        </button>
      </div>
      {showRaw && (
        <pre style={{ maxHeight: 400, overflow: "auto" }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default OutputPanel;
