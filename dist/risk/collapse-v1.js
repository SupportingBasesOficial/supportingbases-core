// New collapse model helpers for engine v1.1
import { weightedAmount } from "./weighted-pressure.js";
// helper to clamp number
function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}
export function calculateNominalIndex(obligations, availableCash, horizonDays) {
    // sequential nominal simulation
    let balance = availableCash;
    const sorted = [...obligations].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    let collapseDate = null;
    for (const ob of sorted) {
        balance -= ob.amount;
        if (balance < 0) {
            collapseDate = ob.due_date;
            break;
        }
    }
    if (!collapseDate || horizonDays <= 0 || !isFinite(horizonDays)) {
        // no collapse or no meaningful horizon -> index 0
        return { nominal_index: 0, nominal_collapse_date: collapseDate };
    }
    const start = new Date();
    const D = (new Date(collapseDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    // if collapse occurs after horizon treat as no collapse in horizon
    if (D >= horizonDays) {
        return { nominal_index: 0, nominal_collapse_date: collapseDate };
    }
    const proximityFactor = 1 - D / horizonDays;
    const idx = clamp(Math.round(proximityFactor * 100), 0, 100);
    return { nominal_index: idx, nominal_collapse_date: collapseDate };
}
export function calculateStructuralIndex(obligations, availableCash) {
    // total weighted pressure already calculated outside if needed
    // compute accumulation per date for collapse date
    const sorted = [...obligations].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    let accumulator = 0;
    let collapseDate = null;
    for (const ob of sorted) {
        const weighted = weightedAmount(ob.amount, ob.layer, ob.status === "LATE");
        accumulator += weighted;
        if (collapseDate === null && accumulator > availableCash) {
            collapseDate = ob.due_date;
            break;
        }
    }
    // compute ratio and index
    let structuralRatio = availableCash > 0 ? accumulator / availableCash : Infinity;
    let index;
    if (availableCash <= 0) {
        index = 100;
    }
    else if (structuralRatio >= 3) {
        index = 100;
    }
    else {
        index = Math.round((structuralRatio / 3) * 100);
    }
    index = clamp(index, 0, 100);
    return { structural_index: index, structural_collapse_date: collapseDate };
}
export function calculateConsolidatedIndex(nominal_index, structural_index) {
    if (nominal_index >= 80) {
        return nominal_index;
    }
    else if (structural_index >= 90) {
        return structural_index;
    }
    else {
        return Math.round(nominal_index * 0.6 + structural_index * 0.4);
    }
}
