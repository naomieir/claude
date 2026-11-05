import { RefObject, useEffect, useRef, useState } from 'react';

/*
 * Autoplay for the NewsFeed "carousel" layout of @spteck/react-controls-v2.
 *
 * The control creates its Embla carousel internally and exposes neither an
 * autoplay option nor the Embla API, so this hook drives the control's own
 * navigation buttons. The selectors below match @spteck/react-controls-v2
 * 2.7.7 (pinned in package-lock.json). If a later version renames them, the
 * hook finds no buttons and does nothing; the carousel itself keeps working.
 */
const CAROUSEL_SELECTOR = '[aria-roledescription="carousel"]';
const NEXT_SELECTOR = 'button[aria-label="Next slide"]';
const PREVIOUS_SELECTOR = 'button[aria-label="Previous slide"]';

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export interface ICarouselAutoplay {
  /** True while the timer is running (not paused by the user, hover or focus) */
  isPlaying: boolean;
  /** True when the user has paused autoplay with the pause button */
  isUserPaused: boolean;
  toggleUserPaused: () => void;
}

/**
 * Advances the carousel inside `containerRef` every `intervalSeconds`.
 * At the last slide it rewinds to the first. Autoplay pauses while the
 * pointer is over the carousel, while it has keyboard focus, while the tab is
 * hidden, and when the user presses pause; it does not start at all when the
 * user's system asks for reduced motion.
 */
export function useCarouselAutoplay(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean,
  intervalSeconds: number,
  slideCount: number,
): ICarouselAutoplay {
  const [isUserPaused, setIsUserPaused] = useState<boolean>(() => prefersReducedMotion());
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isHidden, setIsHidden] = useState<boolean>(() => typeof document !== 'undefined' && document.hidden);
  const slideCountRef = useRef(slideCount);
  slideCountRef.current = slideCount;

  // Hover and focus tracking on the container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return undefined;
    const enter = (): void => setIsHovered(true);
    const leave = (): void => setIsHovered(false);
    const focusIn = (): void => setHasFocus(true);
    const focusOut = (e: FocusEvent): void => {
      if (!el.contains(e.relatedTarget as Node | null)) setHasFocus(false);
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', focusIn);
    el.addEventListener('focusout', focusOut);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', focusIn);
      el.removeEventListener('focusout', focusOut);
    };
  }, [containerRef, enabled]);

  useEffect(() => {
    const onVisibility = (): void => setIsHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const isPlaying = enabled && slideCount > 1 && !isUserPaused && !isHovered && !hasFocus && !isHidden;

  useEffect(() => {
    if (!isPlaying) return undefined;
    const ms = Math.max(1, intervalSeconds) * 1000;
    const timer = window.setInterval(() => {
      const carousel = containerRef.current?.querySelector(CAROUSEL_SELECTOR);
      if (!carousel) return;
      const next = carousel.querySelector<HTMLButtonElement>(NEXT_SELECTOR);
      const previous = carousel.querySelector<HTMLButtonElement>(PREVIOUS_SELECTOR);
      if (next && !next.disabled) {
        next.click();
      } else if (previous && !previous.disabled) {
        // Rewind: each call moves Embla's target back one step, so calling it
        // once per slide in the same tick produces a single smooth scroll to
        // the start. Embla stops at the first slide.
        for (let i = 0; i < slideCountRef.current; i++) previous.click();
      }
    }, ms);
    return () => window.clearInterval(timer);
  }, [isPlaying, intervalSeconds, containerRef]);

  return {
    isPlaying,
    isUserPaused,
    toggleUserPaused: () => setIsUserPaused((p) => !p),
  };
}
