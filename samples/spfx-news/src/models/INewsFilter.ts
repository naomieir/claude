/** How several keywords are combined. */
export type FilterMatchMode = 'all' | 'any';

/**
 * Which news the web part shows.
 * - `auto`     — newest news from the data source, optionally narrowed by keywords
 * - `selected` — exactly the posts the editor picked, in the editor's order
 */
export type NewsSelectionMode = 'auto' | 'selected';

/** A news post picked by the editor, persisted in web part properties. */
export interface ISelectedNewsPost {
  /** Absolute page URL; the stable key used to find the post again */
  url: string;
  title: string;
  /** Source site name, shown in the property pane only */
  siteTitle: string;
}

/** What to show, persisted in web part properties as `newsFilter`. */
export interface INewsFilter {
  mode: NewsSelectionMode;
  /** Enterprise keyword labels to filter on (auto mode) */
  keywords: string[];
  keywordMatch: FilterMatchMode;
  /** Managed property holding enterprise keywords; `TaxKeyword` by default */
  keywordManagedProperty: string;
  /** Posts to show, in display order (selected mode) */
  selectedPosts: ISelectedNewsPost[];
}

export const DEFAULT_KEYWORD_MANAGED_PROPERTY = 'TaxKeyword';

/** Upper bound on picked posts, which also bounds the length of the query. */
export const MAX_SELECTED_POSTS = 30;

/**
 * Normalises a stored value, including one saved by version 1.1, whose
 * page-property fields are dropped.
 */
export function normaliseNewsFilter(value: Partial<INewsFilter> | undefined): INewsFilter {
  const v = value ?? {};
  return {
    mode: v.mode === 'selected' ? 'selected' : 'auto',
    keywords: Array.isArray(v.keywords) ? v.keywords.filter((k) => typeof k === 'string') : [],
    keywordMatch: v.keywordMatch === 'all' ? 'all' : 'any',
    keywordManagedProperty: v.keywordManagedProperty || DEFAULT_KEYWORD_MANAGED_PROPERTY,
    selectedPosts: Array.isArray(v.selectedPosts)
      ? v.selectedPosts.filter((p) => p && typeof p.url === 'string').slice(0, MAX_SELECTED_POSTS)
      : [],
  };
}
