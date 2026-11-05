import { INewsFeedItem } from '@spteck/react-controls-v2';
import { INewsPost } from '@spteck/m365-hooks';

export interface IMapNewsOptions {
  /** Include the source site's name (rendered as the card's category label) */
  showSiteName: boolean;
  /** Include the page description (rendered as the card's body text) */
  showDescription: boolean;
}

const DEFAULT_MAP_OPTIONS: IMapNewsOptions = { showSiteName: true, showDescription: true };

/**
 * Maps a raw news post from the Graph Search hook to the INewsFeedItem
 * shape expected by the NewsFeed control. The card templates render the
 * category and body text only when present, so omitting them hides them.
 */
export function mapNewsPostToFeedItem(
  post: INewsPost,
  likes?: number,
  comments?: number,
  options: IMapNewsOptions = DEFAULT_MAP_OPTIONS
): INewsFeedItem {
  return {
    id: post.id,
    headline: post.title,
    bodyText: options.showDescription ? post.description : undefined,
    imageUrl: post.bannerImageUrlOWSURLH,
    author: post.createdByuser?.user?.displayName,
    date: post.firstPublishedDate,
    views: post.viewsLifeTime,
    likes,
    comments,
    linkUrl: post.path,
    category: options.showSiteName ? post.siteTitle : undefined,
  };
}
