import assert from 'assert';
import { runEngine } from '../src';
import { weightedAmount } from '../src/risk/weighted-pressure';

function buildInput(obligations: any[], available_cash = 10000) {
  return {
    metadata: {
      engine_version: '1.0.0',
      analysis_timestamp: new Date().toISOString(),
      profile_type: 'INDIVIDUAL',
    },
    liquidity: { available_cash },
    obligations,
  };
}

console.log('Running manual checks...');

// Multiple centers
try {
  const obligations = [
    { id: 'a1', center_id: 'C1', due_date: '2026-03-01', amount: 1000, layer: 1, status: 'PENDING' },
    { id: 'a2', center_id: 'C1', due_date: '2026-03-05', amount: 500, layer: 2, status: 'PENDING' },
    { id: 'b1', center_id: 'C2', due_date: '2026-03-02', amount: 200, layer: 3, status: 'PENDING' },
  ];
  const out = runEngine(buildInput(obligations), {});
  assert.strictEqual(out.structural.centers['C1'].total_weighted_pressure, weightedAmount(1000,1,false)+weightedAmount(500,2,false));
  assert.strictEqual(out.structural.centers['C2'].total_weighted_pressure, weightedAmount(200,3,false));
  assert.strictEqual(out.structural.centers['C1'].dominant_layer, 1);
  // basic risk object should exist
  assert(typeof out.risk.nominal_index === 'number');
  console.log('✔ multiple centers check');
} catch(e) { console.error('✖ multiple centers check failed', e); process.exit(1); }

// Liquidity zero
try {
  const obligations = [{ id:'l1', center_id:'C', due_date:'2026-03-01', amount:1000, layer:1, status:'PENDING'}];
  const out = runEngine(buildInput(obligations,0), {});
  assert.strictEqual(out.risk.consolidated_index, 100);
  assert(out.risk.structural_index === 100);
  console.log('✔ liquidity zero check');
} catch(e){ console.error('✖ liquidity zero',e); process.exit(1); }

// Only layer1 weight
try {
  const obligations = [{id:'p1',center_id:'L',due_date:'2026-03-01',amount:1000,layer:1,status:'PENDING'}];
  const out = runEngine(buildInput(obligations),{});
  assert.strictEqual(out.total_weighted_pressure, weightedAmount(1000,1,false));
  console.log('✔ only layer1 weight check');
} catch(e){ console.error('✖ only layer1',e); process.exit(1); }

// Only layer3 ICS lower than layer1
try {
  const out1 = runEngine(buildInput([{id:'a',center_id:'S',due_date:'2026-03-01',amount:1000,layer:1,status:'PENDING'}]),{});
  const out3 = runEngine(buildInput([{id:'b',center_id:'S',due_date:'2026-03-01',amount:1000,layer:3,status:'PENDING'}]),{});
  assert(out1.total_weighted_pressure > out3.total_weighted_pressure);
  console.log('✔ layer1 > layer3 ICS check');
} catch(e){ console.error('✖ layer1 vs layer3',e); process.exit(1); }

console.log('Manual tests completed.');
