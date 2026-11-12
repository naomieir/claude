import * as React from 'react';
import { css } from '@uifabric/utilities/lib';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import styles from './AutoScroller.module.scss';

export type ScrollDirection = 'horizontal' | 'vertical';

export interface IAutoScrollerProps {
  /** Which way the content moves. */
  direction: ScrollDirection;
  /** Speed in pixels per second. */
  speed: number;
  /** Stop moving while the pointer is over the scroller. */
  pauseOnHover: boolean;
  /** Stop moving for reasons owned by the parent (panel open, loading). */
  paused?: boolean;
  /** Height of the viewport in vertical mode, in pixels. */
  height: number;
  /** Width of each tile, in pixels (horizontal) or minimum column width (vertical). */
  itemWidth: number;
  pauseLabel: string;
  playLabel: string;
}

interface IAutoScrollerState {
  overflowing: boolean;
  userPaused: boolean;
  hovered: boolean;
}

/**
 * Scrolls its children continuously, horizontally or vertically.
 *
 * The children are rendered twice, one copy after the other, so that when the
 * first copy has scrolled fully out of view the position can jump back by one
 * copy's length without any visible change. The second copy is only rendered
 * when the content is larger than the viewport.
 */
export default class AutoScroller extends React.Component<IAutoScrollerProps, IAutoScrollerState> {
  private _viewport: HTMLDivElement = null;
  private _firstSet: HTMLDivElement = null;
  private _frame: number = 0;
  private _lastTime: number = 0;
  private _position: number = 0;
  private _lastWritten: number = -1;
  private _period: number = 0;
  private _reducedMotionQuery: MediaQueryList = null;

  constructor(props: IAutoScrollerProps) {
    super(props);

    const reducedMotion = typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.state = {
      overflowing: false,
      // People who ask their OS for reduced motion start paused; they can press play.
      userPaused: reducedMotion,
      hovered: false
    };

    this._tick = this._tick.bind(this);
    this._measure = this._measure.bind(this);
    this._togglePaused = this._togglePaused.bind(this);
    this._onReducedMotionChange = this._onReducedMotionChange.bind(this);
  }

  public componentDidMount(): void {
    window.addEventListener('resize', this._measure);
    if (this._viewport) {
      // Image 'load' events do not bubble, but they can be caught in the capture phase.
      this._viewport.addEventListener('load', this._measure, true);
    }
    if (window.matchMedia) {
      this._reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (this._reducedMotionQuery.addListener) {
        this._reducedMotionQuery.addListener(this._onReducedMotionChange);
      }
    }
    this._measure();
    this._frame = window.requestAnimationFrame(this._tick);
  }

  public componentDidUpdate(prevProps: IAutoScrollerProps): void {
    if (prevProps.direction !== this.props.direction) {
      this._position = 0;
      this._lastWritten = -1;
      if (this._viewport) {
        this._viewport.scrollLeft = 0;
        this._viewport.scrollTop = 0;
      }
    }
    this._measure();
  }

  public componentWillUnmount(): void {
    window.cancelAnimationFrame(this._frame);
    window.removeEventListener('resize', this._measure);
    if (this._viewport) {
      this._viewport.removeEventListener('load', this._measure, true);
    }
    if (this._reducedMotionQuery && this._reducedMotionQuery.removeListener) {
      this._reducedMotionQuery.removeListener(this._onReducedMotionChange);
    }
  }

  public render(): React.ReactElement<IAutoScrollerProps> {
    const { direction, height, itemWidth, children, pauseLabel, playLabel } = this.props;
    const { overflowing, userPaused } = this.state;
    const vertical = direction === 'vertical';

    const viewportStyle: React.CSSProperties = vertical ? { height: `${height}px` } : {};
    const setStyle: React.CSSProperties = vertical
      ? { gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth}px, 1fr))` }
      : {};
    const itemStyle: React.CSSProperties = vertical ? {} : { width: `${itemWidth}px` };

    const renderSet = (copy: number) => (
      <div
        key={copy}
        className={styles.set}
        style={setStyle}
        ref={copy === 0 ? (el) => { this._firstSet = el; } : undefined}
        aria-hidden={copy === 0 ? undefined : true}
      >
        {React.Children.map(children, (child, i) => (
          <div className={styles.item} style={itemStyle} key={i}>{child}</div>
        ))}
      </div>
    );

    return (
      <div className={css(styles.autoScroller, vertical ? styles.vertical : styles.horizontal)}>
        {overflowing &&
          <div className={styles.controls}>
            <IconButton
              iconProps={{ iconName: userPaused ? 'Play' : 'Pause' }}
              title={userPaused ? playLabel : pauseLabel}
              ariaLabel={userPaused ? playLabel : pauseLabel}
              onClick={this._togglePaused}
            />
          </div>
        }
        <div
          className={css(styles.viewport, overflowing && styles.faded)}
          style={viewportStyle}
          ref={(el) => { this._viewport = el; }}
          onMouseEnter={() => this.setState({ hovered: true })}
          onMouseLeave={() => this.setState({ hovered: false })}
        >
          <div className={styles.track}>
            {renderSet(0)}
            {overflowing && renderSet(1)}
          </div>
        </div>
      </div>
    );
  }

  private _isMoving(): boolean {
    return this.state.overflowing
      && !this.state.userPaused
      && !this.props.paused
      && !(this.props.pauseOnHover && this.state.hovered);
  }

  private _tick(time: number): void {
    const el = this._viewport;
    const vertical = this.props.direction === 'vertical';

    if (el && this._period > 0) {
      const current = vertical ? el.scrollTop : el.scrollLeft;

      // Someone scrolled by hand (wheel, touch, keyboard): continue from there.
      if (this._lastWritten < 0 || Math.abs(current - this._lastWritten) > 2) {
        this._position = current;
      }

      if (this._isMoving() && this._lastTime) {
        // Cap the step so a background tab coming back does not leap ahead.
        const seconds = Math.min(time - this._lastTime, 100) / 1000;
        this._position += Math.max(1, this.props.speed) * seconds;
      }

      // Keep the position inside the first copy; the second copy makes the jump invisible.
      if (this.state.overflowing) {
        while (this._position >= this._period) { this._position -= this._period; }
        while (this._position < 0) { this._position += this._period; }
      }

      if (Math.abs(this._position - current) >= 0.5) {
        if (vertical) { el.scrollTop = this._position; } else { el.scrollLeft = this._position; }
      }
      this._lastWritten = vertical ? el.scrollTop : el.scrollLeft;
    }

    this._lastTime = time;
    this._frame = window.requestAnimationFrame(this._tick);
  }

  private _measure(): void {
    if (!this._viewport || !this._firstSet) {
      return;
    }
    const vertical = this.props.direction === 'vertical';
    const period = vertical ? this._firstSet.offsetHeight : this._firstSet.offsetWidth;
    const visible = vertical ? this._viewport.clientHeight : this._viewport.clientWidth;
    this._period = period;

    const overflowing = period > visible + 1;
    if (overflowing !== this.state.overflowing) {
      if (!overflowing) {
        this._position = 0;
        this._viewport.scrollLeft = 0;
        this._viewport.scrollTop = 0;
      }
      this.setState({ overflowing });
    }
  }

  private _togglePaused(): void {
    this.setState({ userPaused: !this.state.userPaused });
  }

  private _onReducedMotionChange(e: MediaQueryListEvent): void {
    if (e.matches) {
      this.setState({ userPaused: true });
    }
  }
}
