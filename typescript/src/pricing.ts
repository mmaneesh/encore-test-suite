// The PRD's pricing rules as code, so tests check the app against the PRD,
// not against numbers copied from the app.
export type Tier = 'standard' | 'vip';
export type PricedSeat = { tier: Tier; priceCents: number };
/** Where the guest is in their session when they enter the code. */
export type Session = { bookingNumber: number; welcome15Used: boolean };
export type Totals = { subtotal: number; discount: number; total: number; codeAccepted: boolean };

type Rule = { percent: number; appliesTo: (tier: Tier) => boolean; validIn: (session: Session) => boolean };

const ANY_TIER = () => true;
const ALWAYS = () => true;

// PRD footnotes 1-3.
const RULES: Record<string, Rule> = {
  SAVE10: { percent: 10, appliesTo: (tier) => tier === 'standard', validIn: ALWAYS },
  FIRST20: { percent: 20, appliesTo: ANY_TIER, validIn: (s) => s.bookingNumber === 1 },
  WELCOME15: { percent: 15, appliesTo: ANY_TIER, validIn: (s) => s.bookingNumber >= 2 && !s.welcome15Used },
};

export function expectedTotals(seats: PricedSeat[], code: string | undefined, session: Session): Totals {
  const rule = code ? RULES[code.trim().toUpperCase()] : undefined; // codes match case-insensitively
  const codeAccepted = rule !== undefined && rule.validIn(session);
  const subtotal = seats.reduce((sum, seat) => sum + seat.priceCents, 0);
  // ponytail: rounds each seat's discount to the cent; the PRD doesn't say how the app rounds.
  const discount = codeAccepted
    ? seats.filter((seat) => rule.appliesTo(seat.tier)).reduce((sum, seat) => sum + Math.round((seat.priceCents * rule.percent) / 100), 0)
    : 0;
  return { subtotal, discount, total: subtotal - discount, codeAccepted };
}

/** "$1,234.50" → 123450 */
// ponytail: assumes "." decimals (en-US). A device in de_DE showing "45,00 $" would parse wrong; add locale-aware parsing if we run non-US locales.
export const toCents = (money: string): number => Math.round(Number(money.replace(/[^0-9.]/g, '')) * 100);
