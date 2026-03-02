// DO NOT MODIFY WITHOUT MAJOR VERSION INCREMENT
export function groupByCenter(obligations) {
    const map = {};
    for (const o of obligations) {
        const id = o.center_id || "default";
        if (!map[id]) {
            map[id] = {
                total_amount: 0,
                total_weighted: 0,
                layer1_exposure: 0,
                layer2_exposure: 0,
                layer3_exposure: 0,
            };
        }
        map[id].total_amount += o.amount;
        map[id].total_weighted += o.weighted_amount;
        if (o.layer === 1)
            map[id].layer1_exposure += o.weighted_amount;
        if (o.layer === 2)
            map[id].layer2_exposure += o.weighted_amount;
        if (o.layer === 3)
            map[id].layer3_exposure += o.weighted_amount;
    }
    return map;
}
