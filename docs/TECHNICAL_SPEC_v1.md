SupportingBases Core - Technical Specification v1

1. Engine Purpose

The engine computes a deterministic Collapse Index (ICS), clusters of obligations,
and structural summaries from a collection of financial obligations and liquidity
state.

2. Deterministic Philosophy

All operations are pure and deterministic. No external I/O or randomness is used
in core computations. Tie-breakers are deterministic (lower layer number wins).

3. Layer Weight Hierarchy

Layer weights (v1):
- Layer 1: weight 3.0
- Layer 2: weight 2.0
- Layer 3: weight 1.0

Late multipliers (v1):
- Layer 1: 2.0
- Layer 2: 1.5
- Layer 3: 1.2

Weighted amount = amount * layer_weight * (late ? late_multiplier : 1.0)

4. Temporal Projection Model

Obligations are considered by due_date ordering. Recurring obligations are
expanded into instances per configured horizon.

5. ZPF Definition

Zero-Pressure Frontier (ZPF) identifies obligations payable using available
liquidity when ordered by earliest due date. ZPF is global and not split per
center.

6. Collapse Index Definition (v1.0)

ICS is a normalized score (0..100) computed from total weighted pressure,
available liquidity, and late counts. Formula is stable in v1.0.0 and must not
be changed without MAJOR version bump.

---

### v1.1 Enhancements

Starting with engine version **1.1.0** the collapse model is extended with three
separate indices:

1. **Nominal Collapse Index** – based purely on nominal cashflow simulation
   against a projection horizon.
2. **Structural Collapse Index** – derived from weighted pressure ratio and a
   simple linear normalization up to a saturation threshold.
3. **Consolidated Collapse Index** – the official prioritized metric which
   combines nominal and structural using a progressive dominance logic (see
   `risk/collapse-v1.ts`).

Outputs now include detailed `risk` and `temporal` sections and the previous
`collapse_index` field is preserved for backwards compatibility (it mirrors the
legacy ICS value).

Refer to the in-code comments or the repository `CHANGELOG.md` for formal
release notes.

7. Multi-Center Logic

Centers are consolidated by `center_id` present on obligations. For each center
we expose:
- `total_amount` (sum of amounts)
- `total_weighted` (sum of weighted_amount)
- `layer1_exposure`, `layer2_exposure`, `layer3_exposure`

The engine exposes `structural.centers` mapping center_id to
`{ total_weighted_pressure, dominant_layer }`. Dominant layer is the layer with
highest weighted exposure; ties resolved deterministically (smaller layer).

8. Invariants

- SBInput and SBOutput are contractually frozen under v1.0.0.
- `ENGINE_VERSION` inserted in output meta.
- Validation enforces types and ISO date parseability.

9. Extension Rules

- Additive metrics and non-breaking outputs → MINOR release.
- Any change to SBInput/SBOutput shape or formula → MAJOR release.

10. Fail-safe behavior

- Runtime validation is strict: invalid input throws a structured `ValidationError`.
- Engine will not attempt to continue with invalid inputs.

