# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - Collapse model v1.1
- Introduce Nominal, Structural and Consolidated Collapse Indices
- Add `risk` and `temporal` sections to SBOutput with detailed metrics
  (nominal/structural indexes, collapse dates, late obligation count,
  zpf start date)
- Preserve legacy `collapse_index`, `total_weighted_pressure`, and `clusters`
  for backwards compatibility
- Update engine version constant to 1.1.0 and bump package version
- Update lab UI to display new collapse metrics and dates
- Expand unit tests for new calculations
 - Canonicalize Structural Collapse Index to Canon v1.1:
   - `structural_ratio = total_weighted_pressure / available_cash`
   - `structural_index = 100 * (ratio^2 / (1 + ratio^2))`
   - safe handling when `available_cash <= 0` (saturates to 100)
   - result clamped to `[0,100]` and displayed with one decimal when needed
 - Add `CANON_v1.1.md` documenting determinism, invariants and formulas
 - Improve lab `MetricBadge` to format fractional indexes (e.g. `93.4`)
 - All tests pass after change (22 passed)

## [1.0.0] - Initial release
- Validation layer using Zod for SBInput and ProjectionConfig
- Multi-center consolidation with center-level exposures
- Deterministic engine output and version governance
- Comprehensive unit tests (risk, structural, temporal, engine)
