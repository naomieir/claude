import * as React from 'react';
import { css } from '@emotion/css';
import { tokens } from '@fluentui/react-components';
import { INewsFeedItem, INewsItem, NewsCard } from '@spteck/react-controls-v2';
import * as strings from 'NewsFeedWebPartStrings';

/*
 * Grid and filmstrip layouts in which every post uses the same card.
 *
 * The NewsFeed control of @spteck/react-controls-v2 2.7.7 renders every
 * fourth card in these layouts as an "overlay" (featured) card, with no option
 * to turn that off. The variant changes the card's structure, so it cannot be
 * undone with CSS. These layouts use the library's own NewsCard with the
 * default variant for every post, and reproduce the control's spacing, column
 * sizing, scroll snapping and outer scroll region.
 */

export interface IUniformNewsLayoutProps {
  layout: 'grid' | 'filmstrip';
  items: INewsFeedItem[];
  height?: string;
  headlineLines?: number;
  bodyLines?: number;
  showBodyText: boolean;
  showAuthorDate: boolean;
  showStats: boolean;
  showComments: boolean;
  showShare: boolean;
  onShare?: (item: INewsItem) => void;
}

const regionClass = css({
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
});

const gridClass = css({
  display: 'grid',
  // Same column rule as the library grid: as many 280px columns as fit.
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
  gap: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
  paddingBottom: tokens.spacingHorizontalM,
  // Every row takes the height of the tallest row, so all cards match,
  // including across rows where one title wraps onto a second line.
  gridAutoRows: '1fr',
  alignItems: 'stretch',
  '& > *': { minWidth: 0, display: 'flex', flexDirection: 'column' },
  '& > * > *': { flexGrow: 1 },
});

const filmstripClass = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: tokens.spacingHorizontalM,
  overflowX: 'auto',
  width: '100%',
  paddingBottom: tokens.spacingVerticalS,
  scrollSnapType: 'x mandatory',
  '&::-webkit-scrollbar': { height: '4px' },
  '&::-webkit-scrollbar-track': { background: 'transparent', borderRadius: '2px' },
  '&::-webkit-scrollbar-thumb': { background: tokens.colorNeutralStroke1, borderRadius: '2px' },
});

const filmstripItemClass = css({
  flex: '0 0 auto',
  scrollSnapAlign: 'start',
  width: '280px',
  display: 'flex',
  flexDirection: 'column',
  '@media (max-width: 575px)': { width: '85vw' },
  '& > *': { flexGrow: 1 },
});

export const UniformNewsLayout: React.FC<IUniformNewsLayoutProps> = ({
  layout,
  items,
  height,
  headlineLines,
  bodyLines,
  showBodyText,
  showAuthorDate,
  showStats,
  showComments,
  showShare,
  onShare,
}) => {
  if (items.length === 0) return null;

  const isFilmstrip = layout === 'filmstrip';
  const cards = items.map((item) => (
    <div key={item.id} className={isFilmstrip ? filmstripItemClass : undefined}>
      <NewsCard
        item={item}
        linkUrl={item.linkUrl}
        variant="default"
        maxWidth="100%"
        headlineLines={headlineLines}
        bodyLines={bodyLines}
        showBodyText={showBodyText}
        showAuthorDate={showAuthorDate}
        showStats={showStats}
        showComments={showComments}
        showShare={showShare}
        onShare={onShare}
      />
    </div>
  ));

  return (
    <div
      role="region"
      aria-label={strings.NewsRegionLabel}
      className={regionClass}
      style={{ height: height === undefined ? 'auto' : height }}
    >
      <div className={isFilmstrip ? filmstripClass : gridClass}>{cards}</div>
    </div>
  );
};

export default UniformNewsLayout;
