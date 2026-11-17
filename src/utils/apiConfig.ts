const DEFAULT_URL = 'https://mohegansun.com/bin/mohegan/servlet/eventsearch';

export const EVENTS_API_URL: string = process.env.EXPO_PUBLIC_EVENTS_API_URL ?? DEFAULT_URL;
export const EVENTS_API_BRAND = 'mohegansun';
export const SITE_ORIGIN = 'https://mohegansun.com';

const SECOND_MS = 1000;

export const REQUEST_TIMEOUT_MS = 12 * SECOND_MS;
