import { useCallback, useMemo, useRef, useState } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import { createPlaygroundSketch } from '../playground/playgroundSketch';

export default function PlaygroundDiv({ sliderValue = 50 }) {
  const containerRef = useRef(null);
  const sliderRef = useRef(sliderValue);
  sliderRef.current = sliderValue;

  /** After first successful load, skip the launch loader (e.g. HMR / resize). */
  const hasLaunchedRef = useRef(false);
  const [loadState, setLoadState] = useState('loading');

  const handleLoadStateChange = useCallback((state) => {
    if (state === 'ready') {
      hasLaunchedRef.current = true;
      setLoadState('ready');
      return;
    }

    if (state === 'loading' && hasLaunchedRef.current) {
      return;
    }

    if (state === 'error' && hasLaunchedRef.current) {
      console.error('[Playground] Error after initial load');
      return;
    }

    setLoadState(state);
  }, []);

  const sketch = useMemo(
    () =>
      createPlaygroundSketch({
        containerRef,
        getSliderValue: () => sliderRef.current,
        onLoadStateChange: handleLoadStateChange,
      }),
    [handleLoadStateChange],
  );

  const showLaunchLoader = loadState === 'loading' && !hasLaunchedRef.current;
  const showLaunchError = loadState === 'error' && !hasLaunchedRef.current;

  return (
    <div className="playground-div" ref={containerRef}>
      <ReactP5Wrapper sketch={sketch} />
      {showLaunchLoader && (
        <div
          className="playground-loading"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="playground-loading__spinner" aria-hidden="true" />
          <span className="playground-loading__label">Loading playground…</span>
        </div>
      )}
      {showLaunchError && (
        <div className="playground-loading playground-loading--error" role="alert">
          <span className="playground-loading__label">
            Could not load playground images.
          </span>
        </div>
      )}
    </div>
  );
}
