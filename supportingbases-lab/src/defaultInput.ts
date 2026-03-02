const today = new Date();
function isoOffset(days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const defaultInput = {
  metadata: {
    profile_type: "AUTONOMOUS",
    engine_version: "1.0.0",
    analysis_timestamp: today.toISOString(),
  },
  liquidity: { available_cash: 3200 },
  obligations: [
    { id: "rent", center_id: "HOME", due_date: isoOffset(5), amount: 1500, layer: 1, status: "PENDING" },
    { id: "food", center_id: "HOME", due_date: isoOffset(10), amount: 800, layer: 1, status: "PENDING" },
    { id: "car", center_id: "AUTO", due_date: isoOffset(7), amount: 1200, layer: 2, status: "PENDING" },
    { id: "streaming", center_id: "ENT", due_date: isoOffset(3), amount: 60, layer: 3, status: "PENDING" },
    { id: "cc", center_id: "FIN", due_date: isoOffset(-2), amount: 900, layer: 2, status: "LATE" },
  ],
};

export default defaultInput;
