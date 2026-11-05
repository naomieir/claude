import * as React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Provider as JotaiProvider } from "jotai";
import {
  FluentUIProvider,
  UniversalProvider,
  LocalizationProvider,
  NewsFeed,
  INewsFeedItem,
  INewsItem,
} from "@spteck/react-controls-v2";
import {
  useSharePointNews,
  usePageLikes,
  usePageComments,
  usePolling,
  INewsPost,
} from "@spteck/m365-hooks";
import { ShareDialog } from "./ShareDialog";

import { INewsFeedWebPartRootProps } from "../models/INewsFeedWebPartRootProps";
import PlaceHolder from "./PlaceHolder/PlaceHolder";
import { EmptyState } from "./EmptyState/EmptyState";
import { ErrorBoundary } from "./ErrorBoundary/ErrorBoundary";
import { mapNewsPostToFeedItem } from "../utils/mappers";
import { newsFilterKey } from "../utils/kqlBuilder";
import { getFilteredNews, getSelectedNews } from "../services/filteredNewsSearch";
import * as strings from "NewsFeedWebPartStrings";
import { NewsFeedListSkeleton } from "./NewsFeedListSkeleton/NewsFeedListSkeleton";
import { NewsFeedGridSkeleton } from "./NewsFeedGridSkeleton/NewsFeedGridSkeleton";
import { NewsFeedMasonrySkeleton } from "./NewsFeedMasonrySkeleton/NewsFeedMasonrySkeleton";
import { NewsFeedFilmstripSkeleton } from "./NewsFeedFilmstripSkeleton/NewsFeedFilmstripSkeleton";
import { NewsFeedFeatureSkeleton } from "./NewsFeedFeatureSkeleton/NewsFeedFeatureSkeleton";
import { NewsFeedMarqueeSkeleton } from "./NewsFeedMarqueeSkeleton/NewsFeedMarqueeSkeleton";

interface INewsFeedContentProps extends INewsFeedWebPartRootProps {}

const NewsFeedContent: React.FC<INewsFeedContentProps> = ({
  spfxContext,
  layout,
  height,
  marqueeDirection,
  headlineLines,
  bodyLines,
  allowDrag,
  showAuthorDate,
  showViewsLikes,
  showComments,
  showShare,
  showSiteName,
  showDescription,
  newsFilter,
  dataSourceMode,
  selectedSites,
  maxNews,
  refreshIntervalMinutes,
  displayMode,
  onConfigure,
  theme,
}) => {
  const selectedSiteIdsKey = selectedSites.map((s) => s.id).join(",");
  const selectedSiteIds = selectedSites.map((s) => s.id);
  // Changes exactly when the content to show changes (mode, keywords or picked posts).
  const filterKey = newsFilterKey(newsFilter);
  const isSelectedPostsMode = newsFilter?.mode === "selected";

  const { getAllNews, getNewsForSelectedSites, getOrganizationSitesNews } =
    useSharePointNews(spfxContext);

  const getAllNewsRef = useRef(getAllNews);
  getAllNewsRef.current = getAllNews;
  const getNewsForSelectedSitesRef = useRef(getNewsForSelectedSites);
  getNewsForSelectedSitesRef.current = getNewsForSelectedSites;
  const getOrganizationSitesNewsRef = useRef(getOrganizationSitesNews);
  getOrganizationSitesNewsRef.current = getOrganizationSitesNews;

  const [newsPosts, setNewsPosts] = React.useState<INewsPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [shareTarget, setShareTarget] = React.useState<{
    siteUrl: string;
    listId: string;
    itemId: string | number;
    name: string;
  } | null>(null);

  const handleShare = useCallback(
    (item: INewsItem) => {
      const post = newsPosts.find((p) => p.id === item.id);
      if (!post) return;
      setShareTarget({
        siteUrl: post.SPSiteUrl ?? "",
        listId: post.listId,
        itemId: post.listItemID,
        name: post.title,
      });
    },
    [newsPosts],
  );

  // Always-current fetch function — updated every render so polling never captures stale deps
  const doFetchRef = useRef<() => Promise<INewsPost[]>>();
  doFetchRef.current = async (): Promise<INewsPost[]> => {
    if (isSelectedPostsMode) {
      return getSelectedNews(spfxContext, newsFilter.selectedPosts);
    }
    if (filterKey) {
      return getFilteredNews(
        spfxContext,
        dataSourceMode,
        selectedSiteIds,
        maxNews,
        newsFilter,
      );
    }
    if (dataSourceMode === "org") {
      return getOrganizationSitesNewsRef.current(maxNews);
    } else if (dataSourceMode === "selected") {
      return selectedSiteIds.length > 0
        ? getNewsForSelectedSitesRef.current(selectedSiteIds, maxNews)
        : [];
    }
    return getAllNewsRef.current(maxNews);
  };

  // Initial load — shows skeleton; re-runs when data source config changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    doFetchRef.current!()
      .then((posts) => {
        if (!cancelled) setNewsPosts(posts);
      })
      .catch(() => {
        if (!cancelled) setNewsPosts([]);
      })
      .then(
        () => {
          if (!cancelled) setIsLoading(false);
        },
        () => {
          if (!cancelled) setIsLoading(false);
        },
      );
    return () => {
      cancelled = true;
    };
  }, [dataSourceMode, selectedSiteIdsKey, maxNews, filterKey]);

  // Background refresh — silent (no skeleton), pauses when tab is hidden
  const backgroundRefresh = useCallback((): void => {
    doFetchRef.current!()
      .then((posts) => setNewsPosts(posts))
      .catch(() => {});
  }, []);

  usePolling(backgroundRefresh, (refreshIntervalMinutes ?? 5) * 60 * 1000, {
    immediate: false,
    pauseWhenHidden: true,
  });

  const { getLikes } = usePageLikes(spfxContext);
  const getLikesRef = useRef(getLikes);
  getLikesRef.current = getLikes;

  const { getComments } = usePageComments(spfxContext);
  const getCommentsRef = useRef(getComments);
  getCommentsRef.current = getComments;

  const [counts, setCounts] = React.useState<{
    posts: INewsPost[];
    likes: (number | undefined)[];
    comments: (number | undefined)[];
  }>({ posts: [], likes: [], comments: [] });
  const [isLoadingLikes, setIsLoadingLikes] = React.useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (newsPosts.length === 0) {
      setCounts({ posts: [], likes: [], comments: [] });
      return;
    }

    let cancelled = false;
    setIsLoadingLikes(true);

    const fetchLikes = async (): Promise<void> => {
      const [likesResults, commentsResults] = await Promise.all([
        Promise.all(
          newsPosts.map(
            (post: {
              SPSiteUrl?: string;
              listId: string;
              listItemID: string;
            }) =>
              getLikesRef
                .current(
                  post.SPSiteUrl ?? "",
                  post.listId,
                  Number(post.listItemID),
                )
                .catch(() => undefined),
          ),
        ),
        Promise.all(
          newsPosts.map(
            (post: {
              SPSiteUrl?: string;
              listId: string;
              listItemID: string;
            }) =>
              getCommentsRef
                .current(
                  post.SPSiteUrl ?? "",
                  post.listId,
                  Number(post.listItemID),
                )
                .catch(() => undefined),
          ),
        ),
      ]);

      if (cancelled) return;

      setCounts({
        posts: newsPosts,
        likes: likesResults.map((r) => r?.likesCount),
        comments: commentsResults.map((r) => r?.length),
      });
    };

    fetchLikes()
      .then((): void => {
        if (!cancelled) setIsLoadingLikes(false);
      })
      .catch((): void => {
        if (!cancelled) setIsLoadingLikes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoading, newsPosts]);

  // Display toggles only re-map existing data; they never trigger a fetch.
  const items: INewsFeedItem[] = useMemo(
    () =>
      counts.posts.map((post: INewsPost, i: number) =>
        mapNewsPostToFeedItem(post, counts.likes[i], counts.comments[i], {
          showSiteName,
          showDescription,
        }),
      ),
    [counts, showSiteName, showDescription],
  );

  if (isSelectedPostsMode && newsFilter.selectedPosts.length === 0) {
    return (
      <PlaceHolder
        title={strings.SelectedPostsEmptyTitleLabel}
        description={strings.SelectedPostsEmptyDescriptionLabel}
        buttonLabel={strings.EmptyStateConfigureLabel}
        onConfigure={onConfigure}
        height={height}
      />
    );
  }

  if (!isSelectedPostsMode && dataSourceMode === "selected" && selectedSites.length === 0) {
    return (
      <PlaceHolder
        title={strings.EmptyStateTitleLabel}
        description={strings.EmptyStateDescriptionLabel}
        buttonLabel={strings.EmptyStateConfigureLabel}
        onConfigure={onConfigure}
        height={height}
      />
    );
  }

  if (!isLoading && !isLoadingLikes && newsPosts.length === 0) {
    return <EmptyState height={height} />;
  }

  if (isLoading || isLoadingLikes) {
    switch (layout) {
      case "list":
      case "trending":
        return <NewsFeedListSkeleton height={height} />;
      case "filmstrip":
      case "carousel":
        return <NewsFeedFilmstripSkeleton height={height} />;
      case "feature":
        return <NewsFeedFeatureSkeleton height={height} />;
      case "marquee":
        return <NewsFeedMarqueeSkeleton height={height} />;
      case "masonry":
        return <NewsFeedMasonrySkeleton height={height} />;
      case "grid":
      case "mosaic":
      default:
        return <NewsFeedGridSkeleton height={height} />;
    }
  }

  return (
    <>
      <NewsFeed
        layout={layout}
        items={items}
        height={height}
        marqueeDirection={marqueeDirection}
        headlineLines={headlineLines}
        bodyLines={bodyLines}
        draggable={allowDrag}
        showAuthorDate={showAuthorDate}
        showStats={showViewsLikes}
        showComments={showComments}
        showShare={showShare}
        showBodyText={showDescription}
        onShare={handleShare}
      />
      {shareTarget && (
        <ShareDialog
          isOpen
          options={shareTarget}
          onClose={() => setShareTarget(null)}
          theme={theme}
        />
      )}
    </>
  );
};

export const NewsFeedWebPartRoot: React.FC<INewsFeedWebPartRootProps> = (
  props,
) => (
  <JotaiProvider>
    <FluentUIProvider
      theme={props.theme}
      applicationName="news-feed-webpart"
      targetDocument={document}
      styles={{ backgroundColor: "transparent", padding: 10 }}
      applyStylesToPortals
    >
      <UniversalProvider context={props.context}>
        <LocalizationProvider
          locale={props.context?.pageContext?.cultureInfo?.currentUICultureName}
        >
          <ErrorBoundary>
            <NewsFeedContent {...props} />
          </ErrorBoundary>
        </LocalizationProvider>
      </UniversalProvider>
    </FluentUIProvider>
  </JotaiProvider>
);

NewsFeedWebPartRoot.displayName = "NewsFeedWebPartRoot";

export default NewsFeedWebPartRoot;
