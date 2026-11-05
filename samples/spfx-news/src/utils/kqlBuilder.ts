import { INewsFilter, MAX_SELECTED_POSTS } from '../models/INewsFilter';

/** Managed property names are alphanumeric; anything else is rejected. */
const MANAGED_PROPERTY_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

export function isValidManagedProperty(name: string | undefined): boolean {
  return !!name && MANAGED_PROPERTY_PATTERN.test(name.trim());
}

/**
 * Quotes a value as a KQL phrase. KQL has no escape for a double quote inside
 * a phrase, so quotes are removed and whitespace collapsed; this also prevents
 * an editor-supplied value from breaking out of its property restriction.
 */
export function quoteKqlValue(value: string): string {
  const cleaned = value.replace(/"/g, ' ').replace(/\s+/g, ' ').trim();
  return `"${cleaned}"`;
}

/** The enterprise keyword condition alone, or '' when none applies. */
export function describeKeywordKql(filter: INewsFilter | undefined): string {
  if (!filter || filter.mode === 'selected') return '';
  if (!isValidManagedProperty(filter.keywordManagedProperty)) return '';
  const property = filter.keywordManagedProperty.trim();
  const terms = (filter.keywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .map((k) => `${property}:${quoteKqlValue(k)}`);
  if (terms.length === 0) return '';
  if (terms.length === 1) return terms[0];
  return `(${terms.join(filter.keywordMatch === 'all' ? ' AND ' : ' OR ')})`;
}

/** Adds the keyword condition to the base news query (automatic mode). */
export function buildKeywordQuery(baseQuery: string, filter: INewsFilter | undefined): string {
  const condition = describeKeywordKql(filter);
  return condition ? `(${baseQuery}) AND ${condition}` : baseQuery;
}

/** Restricts the base news query to the given page URLs (selected mode). */
export function buildSelectedPostsQuery(baseQuery: string, urls: string[]): string {
  const terms = urls
    .map((u) => u.trim())
    .filter((u) => /^https:\/\//i.test(u))
    .slice(0, MAX_SELECTED_POSTS)
    .map((u) => `Path:${quoteKqlValue(u)}`);
  if (terms.length === 0) return '';
  return `(${baseQuery}) AND (${terms.join(' OR ')})`;
}

/**
 * Restricts the base news query to titles whose words start with the typed
 * words. Words are split on white space and KQL's special characters, because
 * KQL prefix matching (`Title:word*`) only works on unquoted single terms.
 */
export function buildTitleSearchQuery(baseQuery: string, text: string): string {
  const words = text
    .split(/[\s"'*():=<>\\{}[\]^~,;!?+\-.&|/]+/)
    .filter((w) => w.length > 0)
    .slice(0, 6);
  if (words.length === 0) return baseQuery;
  return `(${baseQuery}) AND ${words.map((w) => `Title:${w}*`).join(' AND ')}`;
}

/**
 * A key that changes exactly when the content to show changes, used as a
 * React dependency so the feed re-fetches only when it must.
 */
export function newsFilterKey(filter: INewsFilter | undefined): string {
  if (!filter) return '';
  if (filter.mode === 'selected') {
    return `selected|${filter.selectedPosts.map((p) => p.url).join('|')}`;
  }
  return describeKeywordKql(filter);
}
