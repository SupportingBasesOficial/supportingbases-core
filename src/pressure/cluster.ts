export interface Cluster {
  obligations: any[];
  total_amount: number;
  cluster_start: string;
  cluster_end: string;
}

export function clusterPressures(
  obligations: any[],
  windowDays = 5
): Cluster[] {
  const clusters: Cluster[] = [];
  let current: any[] = [];

  const sorted = [...obligations].sort(
    (a, b) =>
      new Date(a.due_date).getTime() -
      new Date(b.due_date).getTime()
  );

  for (const o of sorted) {
    if (current.length === 0) {
      current.push(o);
      continue;
    }

    const last = current[current.length - 1];

    const diff =
      (new Date(o.due_date).getTime() -
        new Date(last.due_date).getTime()) / 86400000;

    if (diff <= windowDays) {
      current.push(o);
    } else {
      // finalize current cluster
      clusters.push({
        obligations: current,
        total_amount: current.reduce((s, i) => s + (i.amount || 0), 0),
        cluster_start: current[0].due_date,
        cluster_end: current[current.length - 1].due_date,
      });
      current = [o];
    }
  }

  if (current.length) {
    clusters.push({
      obligations: current,
      total_amount: current.reduce((s, i) => s + (i.amount || 0), 0),
      cluster_start: current[0].due_date,
      cluster_end: current[current.length - 1].due_date,
    });
  }

  return clusters;
}
