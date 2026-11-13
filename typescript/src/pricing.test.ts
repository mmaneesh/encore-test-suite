import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expectedTotals, toCents } from './pricing.ts';

const vip = { tier: 'vip', priceCents: 10_000 } as const;
const standard = { tier: 'standard', priceCents: 5_000 } as const;
const first = { bookingNumber: 1, welcome15Used: false };
const second = { bookingNumber: 2, welcome15Used: false };

test('SAVE10 discounts Standard seats only, any case', () => {
  assert.deepEqual(expectedTotals([vip, standard], 'save10', first), { subtotal: 15_000, discount: 500, total: 14_500, codeAccepted: true });
});

test('FIRST20 works on the first booking only', () => {
  assert.equal(expectedTotals([vip, standard], 'FIRST20', first).discount, 3_000);
  assert.equal(expectedTotals([vip], 'FIRST20', second).codeAccepted, false);
});

test('WELCOME15 works from the second booking, once', () => {
  assert.equal(expectedTotals([vip], 'WELCOME15', first).codeAccepted, false);
  assert.equal(expectedTotals([vip], 'WELCOME15', second).discount, 1_500);
  assert.equal(expectedTotals([vip], 'WELCOME15', { bookingNumber: 3, welcome15Used: true }).codeAccepted, false);
});

test('unknown code discounts nothing', () => {
  assert.deepEqual(expectedTotals([standard], 'NOPE', first), { subtotal: 5_000, discount: 0, total: 5_000, codeAccepted: false });
});

test('toCents reads formatted money', () => {
  assert.equal(toCents('$1,234.50'), 123_450);
});
