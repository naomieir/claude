import { BaseComponentContext } from '@microsoft/sp-component-base';
import { SPHttpClient } from '@microsoft/sp-http';
import { INewsPost } from '@spteck/m365-hooks';
import { INewsFilter } from '../models/INewsFilter';
import { DataSourceMode } from '../models/INewsFeedWebPartProps';
import { buildNewsQuery } from '../utils/kqlBuilder';

/*
 * Filtered counterpart of `useSharePointNews` from @spteck/m365-hooks 1.3.6.
 *
 * The library's Graph Search query is a fixed string, so it cannot take extra
 * conditions. This module reproduces its query, field list, sorting and result
 * mapping, and adds the filter's KQL to the query itself. Filtering on the
 * server matters: the search returns at most `maxNews` hits, so filtering
 * afterwards in the browser would silently return fewer items than requested.
 */

const NEWS_FIELDS: string[] = (
  'ListItemID.id.name.contentclass.title.FirstPublishedDate.description.siteId.webId.path.listId.' +
  'parentReference.CreatedBy.ViewsLifeTime.SiteTitle.LikesCount.BannerImageUrlOWSURLH.ShareCountLifetime.' +
  'BoostExpiryDate.PromotedState.ViewsLifeTimeUniqueUsersCount.ViewsRecent.ViewsRecentUniqueUsersCount.' +
  'LikesCountRecent.LikesCountLifetime.LikesCountRecentUniqueUsersCount.LikesCountLifetimeUniqueUsersCount.' +
  'ShareCountRecent.sharePointIds.ParentReference.LastModifiedBy.LastModifiedTime.DriveId.DriveItem.UniqueId.' +
  'PictureThumbnailURL.SPSiteUrl'
).split('.');

function baseNewsQuery(): string {
  return (
    '(PromotedState:1 OR PromotedState:2) AND contentclass:STS_ListItem_WebPageLibrary AND ' +
    `(FirstPublishedDate > 1970-01-01 AND FirstPublishedDate < ${new Date().toISOString()})`
  );
}

interface ISearchHit {
  resource: {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>;
    parentReference?: { siteId?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdBy?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastModifiedBy?: any;
  };
}

interface IOrgNewsSite {
  SiteId: string;
}

async function fetchOrgNewsSites(context: BaseComponentContext): Promise<IOrgNewsSite[]> {
  const response = await context.spHttpClient.get(
    `${context.pageContext.web.absoluteUrl}/_api/OrgNews/SitesReference`,
    SPHttpClient.configurations.v1,
  );
  const json = await response.json();
  return (json.value as IOrgNewsSite[]) || [];
}

async function executeSearch(
  context: BaseComponentContext,
  queryString: string,
  maxItems: number,
): Promise<ISearchHit[]> {
  const client = await context.msGraphClientFactory.getClient('3');
  const result = await client
    .api('/search/query')
    .header('x-ms-throttle-priority', 'High')
    .post({
      requests: [
        {
          entityTypes: ['listItem'],
          query: { queryString },
          from: 0,
          size: maxItems,
          fields: NEWS_FIELDS,
          sortProperties: [{ name: 'lastModifiedDateTime', isDescending: 'true' }],
        },
      ],
    });
  return (result.value?.[0]?.hitsContainers?.[0]?.hits as ISearchHit[]) ?? [];
}

function hitSiteId(hit: ISearchHit): string | undefined {
  return hit.resource.parentReference?.siteId ?? hit.resource.fields?.siteId;
}

function mapHits(hits: ISearchHit[], orgSites: IOrgNewsSite[]): INewsPost[] {
  const orgSiteIds = new Set(orgSites.map((s) => s.SiteId.toLowerCase()));
  return hits.map((hit) => {
    const resource = hit.resource;
    const fields = resource.fields;
    let siteUrl: string = fields.SPSiteUrl ?? '';
    if (!siteUrl && fields.path) {
      const index = String(fields.path).toLowerCase().indexOf('/sitepages/');
      if (index > -1) siteUrl = String(fields.path).substring(0, index);
    }
    return {
      ...fields,
      SPSiteUrl: siteUrl,
      bannerImageUrlOWSURLH: fields.bannerImageUrlOWSURLH?.split(',')[0] ?? undefined,
      isOrganizationalNewsSite: !!fields.siteId && orgSiteIds.has(String(fields.siteId).toLowerCase()),
      createdByuser: resource.createdBy,
      lastModifiedByUser: resource.lastModifiedBy,
      id: resource.id,
    } as INewsPost;
  });
}

/** Fetches news for the given data source, narrowed by the filter. */
export async function getFilteredNews(
  context: BaseComponentContext,
  mode: DataSourceMode,
  selectedSiteIds: string[],
  maxItems: number,
  filter: INewsFilter,
): Promise<INewsPost[]> {
  const queryString = buildNewsQuery(baseNewsQuery(), filter);

  if (mode === 'selected') {
    if (selectedSiteIds.length === 0) return [];
    const wanted = new Set(selectedSiteIds.map((id) => id.toLowerCase()));
    const hits = await executeSearch(context, queryString, maxItems);
    return mapHits(
      hits.filter((h) => {
        const id = hitSiteId(h);
        return !!id && wanted.has(id.toLowerCase());
      }),
      [],
    );
  }

  const [hits, orgSites] = await Promise.all([
    executeSearch(context, queryString, maxItems),
    fetchOrgNewsSites(context),
  ]);

  if (mode === 'org') {
    if (orgSites.length === 0) return [];
    const orgIds = new Set(orgSites.map((s) => s.SiteId.toLowerCase()));
    return mapHits(
      hits.filter((h) => {
        const id = hitSiteId(h);
        return !!id && orgIds.has(id.toLowerCase());
      }),
      orgSites,
    );
  }

  return mapHits(hits, orgSites);
}

interface IRestField {
  InternalName: string;
  Title: string;
  TypeAsString: string;
}

/**
 * Lists the visible, non-base columns of the current site's Site Pages
 * library (base template 119), which is where page properties live.
 */
export async function getSitePagesColumns(context: BaseComponentContext): Promise<IRestField[]> {
  const web = context.pageContext.web.absoluteUrl;
  const listsResponse = await context.spHttpClient.get(
    `${web}/_api/web/lists?$filter=BaseTemplate eq 119&$select=Id&$top=1`,
    SPHttpClient.configurations.v1,
  );
  const lists = await listsResponse.json();
  const listId: string | undefined = lists.value?.[0]?.Id;
  if (!listId) return [];
  const fieldsResponse = await context.spHttpClient.get(
    `${web}/_api/web/lists(guid'${listId}')/fields` +
      '?$filter=Hidden eq false and FromBaseType eq false' +
      '&$select=InternalName,Title,TypeAsString',
    SPHttpClient.configurations.v1,
  );
  const fields = await fieldsResponse.json();
  return (fields.value as IRestField[]) ?? [];
}
