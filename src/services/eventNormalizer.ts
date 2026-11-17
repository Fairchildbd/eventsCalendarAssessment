import { SITE_ORIGIN } from '@/utils/apiConfig';
import type { CatalogEvent, ContentType, Facet } from '@/types/catalog';
import type { DateString } from '@/types';

export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}

interface NormalizeResult {
  events: CatalogEvent[];
  dropped: number;
}

const SOURCE_TIME_ZONE = 'America/New_York';
const TAG_PREFIX = 'mohegansun:';
const ISO_LOCAL = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const str = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' && value.trim() !== 'None' ? value.trim() : null;

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tags(raw: unknown): { key: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { key: string; value: string }[] = [];
  for (const tag of raw) {
    if (isRecord(tag) && typeof tag.key === 'string' && typeof tag.value === 'string') {
      out.push({ key: tag.key, value: tag.value });
    }
  }
  return out;
}

function facets(all: { key: string; value: string }[], group: string): Facet[] {
  const prefix = `${TAG_PREFIX}${group}/`;
  const seen = new Set<string>();
  const out: Facet[] = [];
  for (const tag of all) {
    if (!tag.key.startsWith(prefix)) continue;
    const id = tag.key.slice(prefix.length).split('/').pop() ?? '';
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push({ id, label: tag.value });
    }
  }
  return out;
}

export function encodeOnce(url: string): string {
  return url
    .split(/(%[0-9A-Fa-f]{2})/)
    .map((part, index) => (index % 2 === 1 ? part : encodeURI(part)))
    .join('');
}

const SITE_HOST = SITE_ORIGIN.replace(/^https:\/\//, '');

export function isTrustedLinkHost(url: string): boolean {
  const match = /^https:\/\/([^/?#:@]+)(?::\d+)?(?:[/?#]|$)/i.exec(url);
  if (!match) return false;
  const host = match[1].toLowerCase();
  return host === SITE_HOST || host.endsWith(`.${SITE_HOST}`);
}

function absoluteUrl(path: unknown): string | undefined {
  const cleanPath = str(path);
  if (!cleanPath) return undefined;
  try {
    if (/^https:\/\//i.test(cleanPath)) return encodeOnce(cleanPath);
    if (/^[a-z][a-z0-9+.-]*:/i.test(cleanPath) || cleanPath.startsWith('//')) return undefined;
    return cleanPath.startsWith('/') ? encodeOnce(`${SITE_ORIGIN}${cleanPath}`) : undefined;
  } catch {
    return undefined;
  }
}

function contentType(displayType: unknown): ContentType {
  return displayType === 'Promo' ? 'promotion' : 'event';
}

export function normalizeEventSearch(raw: unknown, today: DateString): NormalizeResult {
  if (!isRecord(raw)) throw new InvalidResponseError('Response is not an object');
  if (raw.success === false) throw new InvalidResponseError('Response reported failure');
  if (!Array.isArray(raw.events) || !Array.isArray(raw.eventInstances)) {
    throw new InvalidResponseError('Response is missing events or eventInstances');
  }

  let dropped = 0;
  const byId = new Map<string, Record<string, unknown>>();
  for (const rawEvent of raw.events) {
    if (isRecord(rawEvent) && typeof rawEvent.id === 'string' && str(rawEvent.title)) byId.set(rawEvent.id, rawEvent);
    else dropped += 1;
  }

  const seen = new Set<string>();
  const events: CatalogEvent[] = [];

  for (const inst of raw.eventInstances) {
    if (!isRecord(inst) || typeof inst.eventRef !== 'string' || typeof inst.start !== 'string') {
      dropped += 1;
      continue;
    }
    const source = byId.get(inst.eventRef);
    const start = ISO_LOCAL.exec(inst.start);
    if (!source || !start) {
      dropped += 1;
      continue;
    }
    if (source.ongoing === true) continue;

    const allDay = inst.allDay === true;
    const date = start[1];
    const end = typeof inst.end === 'string' ? ISO_LOCAL.exec(inst.end) : null;
    const endDate = end && end[1] >= date ? end[1] : date;
    if (endDate < today) continue;

    const id = `${inst.eventRef}-${inst.start.replace(/\D/g, '').slice(0, 12)}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const eventTags = tags(source.cqTags);
    const venueTag = facets(eventTags, 'venue')[0];
    const location = str(source.location);
    const category = str(source.category);
    const bannerUrl = absoluteUrl(source.carousel);
    const thumbnailUrl = absoluteUrl(source.imageLink);
    const rawSourceUrl = absoluteUrl(source.url);
    const sourceUrl = rawSourceUrl && isTrustedLinkHost(rawSourceUrl) ? rawSourceUrl : undefined;
    events.push({
      id,
      sourceId: inst.eventRef,
      title: String(source.title).trim(),
      contentType: contentType(source.displayType),
      category: category ? { id: slug(category), label: category } : null,
      eventTypes: facets(eventTags, 'event'),
      promoCategories: facets(eventTags, 'promotions'),
      venue: venueTag ?? (location ? { id: slug(location), label: location } : null),
      date,
      endDate,
      startTime: allDay ? null : start[2],
      allDay,
      timeZone: SOURCE_TIME_ZONE,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
      ...(bannerUrl ? { bannerUrl } : {}),
      description: typeof source.description === 'string' ? source.description.trim() : '',
      ...(sourceUrl ? { sourceUrl } : {}),
      featured: eventTags.some((tag) => tag.key === `${TAG_PREFIX}displayarea/carousal`),
    });
  }

  if (events.length === 0 && dropped > 0 && raw.events.length + raw.eventInstances.length > 0) {
    const anyUsable = raw.eventInstances.some(
      (instance) => isRecord(instance) && typeof instance.eventRef === 'string' && byId.has(instance.eventRef),
    );
    if (!anyUsable) throw new InvalidResponseError('No usable event records');
  }

  events.sort(
    (firstEvent, secondEvent) =>
      firstEvent.date.localeCompare(secondEvent.date) ||
      (firstEvent.startTime ?? '').localeCompare(secondEvent.startTime ?? '') ||
      firstEvent.title.localeCompare(secondEvent.title) ||
      firstEvent.id.localeCompare(secondEvent.id),
  );

  return {
    events,
    dropped,
  };
}
