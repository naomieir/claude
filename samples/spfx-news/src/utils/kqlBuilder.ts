import {
  FilterMatchMode,
  IFilterableColumn,
  INewsFilter,
  IPagePropertyFilter,
} from '../models/INewsFilter';

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

function joinGroup(terms: string[], match: FilterMatchMode): string {
  if (terms.length === 0) return '';
  if (terms.length === 1) return terms[0];
  return `(${terms.join(match === 'any' ? ' OR ' : ' AND ')})`;
}

function isUsable(f: IPagePropertyFilter): boolean {
  return isValidManagedProperty(f.managedProperty) && !!f.value && f.value.trim().length > 0;
}

/**
 * Combines the base news query with the filter's conditions. Returns the base
 * query unchanged when no usable condition is set.
 *
 * Positive conditions are grouped and combined with AND. "Is not" conditions
 * are appended with NOT, which KQL requires to follow a valid expression (here,
 * the base query), so they always narrow the result set whatever the match mode.
 */
export function buildNewsQuery(baseQuery: string, filter: INewsFilter | undefined): string {
  const { positive, negative } = collectTerms(filter);
  if (positive.length === 0 && negative.length === 0) return baseQuery;

  let query = `(${baseQuery})`;
  positive.forEach((p) => {
    query = `${query} AND ${p}`;
  });
  if (positive.length > 0 && negative.length > 0) query = `(${query})`;
  negative.forEach((n) => {
    query = `${query} NOT ${n}`;
  });
  return query;
}

/** The filter conditions alone, for display in the property pane. */
export function describeNewsFilterKql(filter: INewsFilter | undefined): string {
  const { positive, negative } = collectTerms(filter);
  return [...positive, ...negative.map((n) => `NOT ${n}`)].join(' AND ');
}

function collectTerms(filter: INewsFilter | undefined): { positive: string[]; negative: string[] } {
  const positive: string[] = [];
  const negative: string[] = [];
  if (!filter) return { positive, negative };

  const keywordProperty = isValidManagedProperty(filter.keywordManagedProperty)
    ? filter.keywordManagedProperty.trim()
    : '';
  const keywords = (filter.keywords ?? []).map((k) => k.trim()).filter((k) => k.length > 0);
  if (keywordProperty && keywords.length > 0) {
    positive.push(
      joinGroup(
        keywords.map((k) => `${keywordProperty}:${quoteKqlValue(k)}`),
        filter.keywordMatch,
      ),
    );
  }

  const properties = (filter.pageProperties ?? []).filter(isUsable);
  const propertyTerms = properties
    .filter((f) => f.operator !== 'isNot')
    .map((f) => {
      const op = f.operator === 'equals' ? '=' : ':';
      return `${f.managedProperty.trim()}${op}${quoteKqlValue(f.value)}`;
    });
  if (propertyTerms.length > 0) {
    positive.push(joinGroup(propertyTerms, filter.propertyMatch));
  }
  properties
    .filter((f) => f.operator === 'isNot')
    .forEach((f) => negative.push(`${f.managedProperty.trim()}:${quoteKqlValue(f.value)}`));

  return { positive, negative };
}

/**
 * Site column types and the suffix SharePoint uses when it automatically
 * creates a queryable managed property for a site column of that type.
 * Managed metadata columns use the `owstaxId` prefix instead.
 */
const AUTO_MANAGED_PROPERTY_SUFFIX: Record<string, string> = {
  Text: 'OWSTEXT',
  Note: 'OWSMTXT',
  Choice: 'OWSCHCS',
  MultiChoice: 'OWSCHCM',
  Number: 'OWSNMBR',
  Currency: 'OWSCURR',
  DateTime: 'OWSDATE',
  Boolean: 'OWSBOOL',
  User: 'OWSUSER',
  UserMulti: 'OWSUSER',
};

/**
 * Returns the automatically created managed property for a column, or
 * `undefined` when the column type has none we can rely on.
 */
export function managedPropertyForColumn(internalName: string, typeAsString: string): string | undefined {
  if (!isValidManagedProperty(internalName)) return undefined;
  if (typeAsString === 'TaxonomyFieldType' || typeAsString === 'TaxonomyFieldTypeMulti') {
    return `owstaxId${internalName}`;
  }
  const suffix = AUTO_MANAGED_PROPERTY_SUFFIX[typeAsString];
  return suffix ? `${internalName}${suffix}` : undefined;
}

/** Maps raw REST field metadata to filterable columns, dropping unsupported types. */
export function toFilterableColumns(
  fields: { InternalName: string; Title: string; TypeAsString: string }[],
): IFilterableColumn[] {
  const result: IFilterableColumn[] = [];
  fields.forEach((f) => {
    // Enterprise keywords have their own dedicated filter section.
    if (f.InternalName === 'TaxKeyword') return;
    const managedProperty = managedPropertyForColumn(f.InternalName, f.TypeAsString);
    if (managedProperty) {
      result.push({
        internalName: f.InternalName,
        title: f.Title,
        typeAsString: f.TypeAsString,
        managedProperty,
      });
    }
  });
  return result.sort((a, b) => a.title.localeCompare(b.title));
}
