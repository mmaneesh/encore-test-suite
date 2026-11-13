// One page object per Encore screen. Locators are the app's resource IDs only:
// no coordinates, no sleeps.
import { $, $$ } from '@wdio/globals';
import type { Tier } from './pricing.ts';

const WAIT_MS = 20_000;
const PAYMENT_WAIT_MS = 60_000;

const byId = (id: string) => `android=new UiSelector().resourceId("${id}")`;
const scrollTo = (id: string) =>
  `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceId("${id}"))`;

async function tap(id: string): Promise<void> {
  const element = $(byId(id));
  await element.waitForDisplayed({ timeout: WAIT_MS });
  await element.click();
}

async function readText(id: string): Promise<string> {
  const element = $(byId(id));
  await element.waitForDisplayed({ timeout: WAIT_MS });
  return element.getText();
}

export type Seat = { id: string; tier: Tier };

export const guestEntry = {
  continue: () => tap('continue-as-guest-button'),
};

export const eventList = {
  async open(eventId: string): Promise<void> {
    await $(byId('event-list-screen')).waitForExist({ timeout: WAIT_MS });
    const card = $(scrollTo(`event-card-${eventId}`));
    await card.waitForExist({ timeout: WAIT_MS });
    await card.click();
  },
};

export const eventDetails = {
  title: () => readText('event-details-title'),
  date: () => readText('event-details-date'),
  availableCount: () => readText('event-details-available-count'),
  selectSeats: () => tap('select-seat-button'),
};

export const seatSelection = {
  /** Selects the first `count` seats whose accessibility label names the tier. */
  // ponytail: assumes the label reads like "A1, vip, …" (the starter test checks ", standard,"); confirm on the first run.
  async pick(tier: Tier, count: number): Promise<Seat[]> {
    await $(byId('seat-selection-screen')).waitForDisplayed({ timeout: WAIT_MS });
    const seats = await $$(`android=new UiSelector().resourceIdMatches("seat-[A-Z]+[0-9]+").descriptionContains(", ${tier},")`).getElements();
    if (seats.length < count) throw new Error(`Wanted ${count} ${tier} seats, found ${seats.length}`);
    const picked: Seat[] = [];
    for (const seat of seats.slice(0, count)) {
      picked.push({ id: (await seat.getAttribute('resource-id')) ?? '', tier });
      await seat.click();
    }
    return picked;
  },
  continue: () => tap('seat-selection-continue-button'),
};

export const discount = {
  async apply(code: string): Promise<void> {
    const input = $(byId('discount-input'));
    await input.waitForDisplayed({ timeout: WAIT_MS });
    await input.setValue(code);
    await tap('discount-apply-button');
  },
  continue: () => tap('discount-continue-button'),
};

export const payment = {
  // ponytail: assumes each line's ID ends in the seat label ("payment-line-price-A1"); confirm on the first run.
  linePrice: (seat: Seat) => readText(`payment-line-price-${seat.id.replace(/^seat-/, '')}`),
  subtotal: () => readText('payment-subtotal'),
  total: () => readText('payment-total'),
  async discountAmount(): Promise<string> {
    const row = $(byId('payment-discount-amount'));
    return (await row.isExisting()) ? row.getText() : '$0.00';
  },
  async pay(): Promise<void> {
    await tap('payment-pay-button');
    // Wait for the outcome, not for the spinner: a fast payment may never show it.
    await $(byId('confirmation-screen')).waitForDisplayed({ timeout: PAYMENT_WAIT_MS });
  },
};

export const confirmation = {
  number: () => readText('confirmation-number'),
  price: () => readText('confirmation-price'),
  done: () => tap('confirmation-done-button'),
};
