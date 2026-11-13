// Device sets per ticket. Pick one with DEVICES=<name> (default: phone).
// ponytail: names are from memory; confirm them against
// https://api-cloud.browserstack.com/app-automate/devices.json before the first run.
export type Device = { deviceName: string; osVersion: string };

export const DEVICE_SETS: Record<string, Device[]> = {
  phone: [{ deviceName: 'Google Pixel 8', osVersion: '14.0' }],
  // T3: Android 11, Android 14+, a tablet, a phone from another maker.
  t3: [
    { deviceName: 'Samsung Galaxy S21', osVersion: '11.0' },
    { deviceName: 'Google Pixel 8', osVersion: '14.0' },
    { deviceName: 'Samsung Galaxy Tab S9', osVersion: '13.0' },
    { deviceName: 'Motorola Moto G71 5G', osVersion: '11.0' },
  ],
  // T9: same booking seen on a phone and a tablet.
  t9: [
    { deviceName: 'Google Pixel 8', osVersion: '14.0' },
    { deviceName: 'Samsung Galaxy Tab S9', osVersion: '13.0' },
  ],
};
