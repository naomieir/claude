/** How several conditions in the same filter group are combined. */
export type FilterMatchMode = 'all' | 'any';

/**
 * Comparison applied to a page property.
 * - `is`       — KQL `:` (value equals the stored value or matches its terms)
 * - `equals`   — KQL `=` (exact equality)
 * - `isNot`    — negated `:`; always combined with AND, never OR
 */
export type PagePropertyOperator = 'is' | 'equals' | 'isNot';

/** A single page-property condition, persisted in web part properties. */
export interface IPagePropertyFilter {
  /** Stable key for list rendering */
  id: string;
  /** Column display name, kept for the property pane only */
  fieldTitle: string;
  /** Search managed property queried, e.g. `DepartmentOWSCHCS` or `RefinableString00` */
  managedProperty: string;
  operator: PagePropertyOperator;
  value: string;
}

/** Complete filter configuration, persisted in web part properties. */
export interface INewsFilter {
  /** Enterprise keyword labels to filter on */
  keywords: string[];
  keywordMatch: FilterMatchMode;
  /** Managed property holding enterprise keywords; `TaxKeyword` by default */
  keywordManagedProperty: string;
  pageProperties: IPagePropertyFilter[];
  propertyMatch: FilterMatchMode;
}

export const DEFAULT_KEYWORD_MANAGED_PROPERTY = 'TaxKeyword';

export const EMPTY_NEWS_FILTER: INewsFilter = {
  keywords: [],
  keywordMatch: 'any',
  keywordManagedProperty: DEFAULT_KEYWORD_MANAGED_PROPERTY,
  pageProperties: [],
  propertyMatch: 'all',
};

/** A Site Pages column the editor can filter on, with its search property. */
export interface IFilterableColumn {
  internalName: string;
  title: string;
  typeAsString: string;
  managedProperty: string;
}
