// T2: SAVE10 must take 10% off Standard seats only (PRD footnote 1).
// A mixed VIP + Standard booking breaks if the app discounts the VIP seat too.
import { expect } from '@wdio/globals';
import { book } from '../src/booking-flow.ts';
import { guestEntry } from '../src/screens.ts';
import { expectedTotals } from '../src/pricing.ts';

const NEON_SKYLINE = 'evt-01'; // has a VIP row (the starter tests use it)

describe('Discount codes follow the PRD', () => {
  before(() => guestEntry.continue());

  it('SAVE10 discounts the Standard seat and not the VIP seat', async () => {
    const booking = await book({ eventId: NEON_SKYLINE, seats: { vip: 1, standard: 1 }, code: 'SAVE10' });
    const expected = expectedTotals(booking.seats, 'SAVE10', { bookingNumber: 1, welcome15Used: false });

    console.log('[T2]', JSON.stringify({ seats: booking.seats, shown: booking.shown, paid: booking.paid, expected }));
    expect(booking.shown.subtotal).toBe(expected.subtotal);
    expect(booking.shown.discount).toBe(expected.discount);
    expect(booking.shown.total).toBe(expected.total);
    expect(booking.paid).toBe(expected.total);
  });
});
