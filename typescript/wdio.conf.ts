import { DEVICE_SETS } from './src/devices.ts';

try {
  process.loadEnvFile();
} catch {
  // no .env: rely on real environment variables
}

const setName = process.env.DEVICES ?? 'phone';
const devices = DEVICE_SETS[setName];
if (!devices) throw new Error(`Unknown DEVICES="${setName}". Use one of: ${Object.keys(DEVICE_SETS).join(', ')}`);

const locale = process.env.LOCALE;
if (locale && !/^[a-z]{2}_[A-Z]{2}$/.test(locale)) throw new Error(`LOCALE must look like de_DE, got "${locale}"`);

export const config: WebdriverIO.Config = {
  runner: 'local',
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  specs: ['./test/**/*.spec.ts'],
  maxInstances: devices.length,
  capabilities: devices.map((device) => ({
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    // LOCALE=de_DE → device language and region, to test date and price formats.
    ...(locale && { 'appium:language': locale.split('_')[0], 'appium:locale': locale.split('_')[1] }),
    'bstack:options': {
      // TIMEZONE=Kiritimati (BrowserStack city name) → the device's time zone, to test event dates.
      ...(process.env.TIMEZONE && { timezone: process.env.TIMEZONE }),
      ...device,
      projectName: 'Encore',
      buildName: process.env.BUILD_NAME ?? 'Encore',
      deviceLogs: true, // logcat: JS errors, crashes, ANRs (oracle O10)
      networkLogs: true, // HAR: the PRD says the app makes no network calls (oracle O10)
    },
  })),
  services: [['browserstack', { app: process.env.BROWSERSTACK_APP || '../app/encore-release.apk' }]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 300_000 },
};
