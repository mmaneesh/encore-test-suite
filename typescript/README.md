# typescript

WebdriverIO 9 + TypeScript tests for Encore on BrowserStack App Automate.

## Design

- **The PRD is the oracle.** `src/pricing.ts` turns the discount rules (PRD footnotes 1–3) into code, so tests check the app against the spec, not against numbers copied from the app. `npm run check` tests those rules without a device.
- **Page objects.** `src/screens.ts` has one object per screen. Elements are found only by the app's resource IDs: no screen coordinates, no fixed list positions, no sleeps.
- **Wait for outcomes, not spinners.** Payment waits for the confirmation screen; a fast mocked payment may never show its spinner.
- **One booking helper.** `src/booking-flow.ts` → `book({ eventId, seats: { vip: 1, standard: 1 }, code })` returns what the payment and confirmation screens showed, in cents.
- **Device sets per question.** `src/devices.ts`: one phone; Android 11 vs 14 vs tablet vs another maker; phone vs tablet.
- **Logs on.** Every session records device logs (logcat) and network logs (HAR). The PRD says the app makes no network calls, so any request is a finding.

## Run

```bash
npm install
cp .env.example .env   # add your BrowserStack username and access key
npm run check          # pricing rules + type check, no device
```

| Command | What it runs |
|---|---|
| `npm run t2` | `test/discount-pricing.spec.ts`: SAVE10 on a VIP + Standard booking |
| `npm run t3` | the starter `event-date-display` test on 4 devices |
| `npm run t4` | the starter `vip-booking-payment` test, unchanged |
| `npm run t7` | the starter `event-list-locator` test, unchanged |

Each run is a build named after what it tests. Options:

- `DEVICES=t9 …`: pick a device set from `src/devices.ts`.
- `TIMEZONE=Kiritimati npm run t3`: run in another time zone (BrowserStack city name).
- `LOCALE=de_DE npm run t3`: run with another device language and region.
- `BROWSERSTACK_APP=bs://… npm run t4`: reuse an uploaded app instead of uploading the APK.
