export interface IImageGalleryProps {
  listName: string;
  context: any;
  siteUrl:string;
  pageSize:number;
  /** Scroll the thumbnails automatically instead of showing a static grid. */
  autoScroll?: boolean;
  scrollDirection?: 'horizontal' | 'vertical';
  /** Pixels per second. */
  scrollSpeed?: number;
  pauseOnHover?: boolean;
  /** Height of the scrolling area in vertical mode, in pixels. */
  scrollAreaHeight?: number;
  /** Tile width (horizontal) or minimum column width (vertical), in pixels. */
  thumbnailWidth?: number;
}
