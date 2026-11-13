// A whole booking, start to finish, built from the page objects.
import { confirmation, discount, eventDetails, eventList, payment, seatSelection, type Seat } from './screens.ts';
import { toCents, type PricedSeat, type Tier } from './pricing.ts';

export type BookingRequest = { eventId: string; seats: Partial<Record<Tier, number>>; code?: string };

export type BookingResult = {
  seats: PricedSeat[];
  /** What the payment screen showed, in cents. */
  shown: { subtotal: number; discount: number; total: number };
  /** What the confirmation screen says was paid, in cents. */
  paid: number;
  confirmationNumber: string;
};

export async function book({ eventId, seats, code }: BookingRequest): Promise<BookingResult> {
  await eventList.open(eventId);
  await eventDetails.selectSeats();

  const picked: Seat[] = [];
  for (const [tier, count] of Object.entries(seats) as [Tier, number][]) {
    picked.push(...(await seatSelection.pick(tier, count)));
  }
  await seatSelection.continue();

  if (code) await discount.apply(code);
  await discount.continue();

  const priced: PricedSeat[] = [];
  for (const seat of picked) priced.push({ tier: seat.tier, priceCents: toCents(await payment.linePrice(seat)) });
  const shown = {
    subtotal: toCents(await payment.subtotal()),
    discount: toCents(await payment.discountAmount()),
    total: toCents(await payment.total()),
  };

  await payment.pay();
  const result = { seats: priced, shown, paid: toCents(await confirmation.price()), confirmationNumber: await confirmation.number() };
  await confirmation.done();
  return result;
}
