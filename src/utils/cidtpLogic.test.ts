import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSixStateDistribution,
  evaluateEROVerdict,
  calculateAttributionMetrics,
  evaluateGateChecks,
  formatSha256,
} from './cidtpLogic';
import { AttackStep, GateCheckStatus } from '../types/cidtp';

const mockSteps: Partial<AttackStep>[] = [
  { id: 'S-127', verdict: 'S' },
  { id: 'S-126', verdict: 'D3' },
  { id: 'S-125', verdict: 'I' },
  { id: 'S-124', verdict: 'P1' },
  { id: 'S-123', verdict: 'D2' },
  { id: 'S-122', verdict: 'D1' },
  { id: 'S-121', verdict: 'S' },
  { id: 'S-120', verdict: 'D1' },
];

test('calculateSixStateDistribution counts correctly', () => {
  const dist = calculateSixStateDistribution(mockSteps as AttackStep[]);
  assert.equal(dist.S, 2);
  assert.equal(dist.D1, 2);
  assert.equal(dist.D2, 1);
  assert.equal(dist.D3, 1);
  assert.equal(dist.P1, 1);
  assert.equal(dist.I, 1);
  assert.equal(dist.P2, 0);
});

test('evaluateEROVerdict implements 3-layer arbitrament logic', () => {
  // E=true, R=true, O=true => 'S' (Escape succeeded)
  assert.equal(evaluateEROVerdict(true, true, true), 'S');

  // E=true, R=false, O=false => 'P2' (Unreached)
  assert.equal(evaluateEROVerdict(true, false, false), 'P2');

  // E=true, R=true, O=false => 'P1' (Reached but objective failed)
  assert.equal(evaluateEROVerdict(true, true, false), 'P1');

  // E=false, R=true, O=true, detectedTerminated=true => 'D2'
  assert.equal(evaluateEROVerdict(false, true, true, true), 'D2');

  // E=false, R=true, O=true, detectedTerminated=false => 'D1'
  assert.equal(evaluateEROVerdict(false, true, true, false), 'D1');
});

test('evaluateGateChecks identifies positive probe and PTP issues', () => {
  const gate: GateCheckStatus = {
    positiveProbePassed: 9,
    positiveProbeTotal: 10,
    egressGuardEnforced: true,
    ptpSkewMs: 3,
    ptpLimitMs: 10,
    resetHealthPassed: true,
    failedProbeId: 'DS-09',
  };

  const evalResult = evaluateGateChecks(gate);
  assert.equal(evalResult.hasProbeFailure, true);
  assert.ok(evalResult.totalPassed >= 7);
  assert.equal(evalResult.isAllPassed, false);
});

test('formatSha256 produces truncated hash', () => {
  const hash = 'sha256:71ab48589c382910fed34a839840283049281938fa0';
  const formatted = formatSha256(hash);
  assert.ok(formatted.includes('...'));
  assert.equal(formatted.startsWith('sha256:71a'), true);
});
