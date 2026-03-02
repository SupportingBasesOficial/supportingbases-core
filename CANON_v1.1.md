# SupportingBases Core Engine

## Canon v1.1 — Structural Logistic Model

**Status**

Frozen – Stable

### 1. Determinism

The engine is:

- 100% deterministic
- Stateless
- Side-effect free
- Pure input → output

### 2. Nominal Collapse Index

Sequential liquidity simulation ordered by `due_date`.

Nominal collapse occurs when liquidity < 0.

Index formula:

```
nominal_index = proximity to collapse within horizon (0–100)
```

### 3. Structural Collapse Index (Logistic Model)

```
structural_ratio = total_weighted_pressure / available_cash
```

```
structural_index = 100 * (ratio² / (1 + ratio²))
```

Rules:

- `available_cash <= 0` → `structural_index = 100`
- result clamped 0–100

### 4. Consolidated Collapse Index

Priority logic:

```
if nominal_index >= 80:
    consolidated = nominal_index
else if structural_index >= 90:
    consolidated = structural_index
else:
    consolidated = nominal_index * 0.6 + structural_index * 0.4
```

### 5. Invariants

- Layer 1 weight > Layer 2 > Layer 3
- Late never reduces weight
- Engine never executes decisions
- Engine never depends on calendar cycles
- Engine never stores history

### 6. Output Contract

SBOutput v1.1 is stable.

Breaking changes require major version bump.
