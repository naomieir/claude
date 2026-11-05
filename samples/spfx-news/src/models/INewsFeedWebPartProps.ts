import { NewsFeedLayout } from '@spteck/react-controls-v2';
import { ISelectedSite } from './ISelectedSite';
import { INewsFilter } from './INewsFilter';

export type DataSourceMode = 'all' | 'org' | 'selected';

export interface INewsFeedWebPartProps {
  layout: NewsFeedLayout;
  height: string;
  marqueeDirection: 'vertical' | 'horizontal';
  dataSourceMode: DataSourceMode;
  selectedSites: ISelectedSite[];
  maxNews: number;
  refreshIntervalMinutes: number;
  headlineLines: number;
  bodyLines: number;
  allowDrag: boolean;
  showAuthorDate: boolean;
  showViewsLikes: boolean;
  showComments: boolean;
  showShare: boolean;
  /** Show the source site's name above each headline */
  showSiteName: boolean;
  /** Show the page description under each headline */
  showDescription: boolean;
  /** Enterprise keyword and page property filter */
  newsFilter: INewsFilter;
  /** Carousel layout: advance slides automatically */
  carouselAutoplay: boolean;
  /** Carousel layout: seconds each slide stays before advancing */
  carouselIntervalSeconds: number;
}
