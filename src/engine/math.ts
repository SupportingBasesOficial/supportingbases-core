export function clamp0to100(v: number): number {
  return Math.max(0, Math.min(100, v));
}
