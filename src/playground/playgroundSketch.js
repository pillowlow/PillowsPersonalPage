import {
  computeDotMetrics,
  DESKTOP_MIN_WIDTH,
  IMAGE_KEYS,
  MOBILE_CANVAS_ASPECT,
  PLAYGROUND_BG,
} from './constants';
import {
  clearProcessedPixelCache,
  getBlendedPixelData,
} from './imageBlendArray';
import { sampleColorDots } from './colorDotSampler';
import { loadPlaygroundImages } from './playgroundImageLoader';
import { applyNoiseToDots } from './noiseApplier';

function imagesReady(images) {
  return (
    images &&
    IMAGE_KEYS.every((key) => images[key] && images[key].width > 0)
  );
}

function isDesktopViewport() {
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
}

function getCanvasSize(containerEl) {
  const rect = containerEl.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));

  if (!isDesktopViewport()) {
    const height = Math.max(
      1,
      Math.floor((width * MOBILE_CANVAS_ASPECT.height) / MOBILE_CANVAS_ASPECT.width),
    );
    return { width, height, isDesktop: false };
  }

  const height = Math.max(1, Math.floor(rect.height));
  const size = Math.max(1, Math.min(width, height));
  return { width: size, height: size, isDesktop: true };
}

function waitForLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

export function createPlaygroundSketch({
  containerRef,
  getSliderValue,
  onLoadStateChange,
}) {
  return (p5) => {
    let images = null;
    let baseDots = [];
    let cacheKey = '';
    let dotMetrics = null;
    let isDesktop = isDesktopViewport();
    let isReady = false;
    let resizeObserver = null;
    let bootstrapPromise = null;

    const setLoadState = (state) => {
      onLoadStateChange?.(state);
    };

    const makeCacheKey = (slider, w, h, desktop) =>
      `${slider}|${w}|${h}|${desktop ? 'd' : 'm'}`;

    const applyCanvasSize = () => {
      const el = containerRef.current;
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      if (rect.width < 2) return false;

      isDesktop = isDesktopViewport();
      const { width, height } = getCanvasSize(el);
      if (width !== p5.width || height !== p5.height) {
        p5.resizeCanvas(width, height);
      }
      return p5.width > 8 && p5.height > 8;
    };

    const rebuildDots = (force = false) => {
      if (!imagesReady(images)) return false;

      const slider = getSliderValue();
      const w = p5.width;
      const h = p5.height;
      if (w <= 0 || h <= 0) return false;

      const key = makeCacheKey(slider, w, h, isDesktop);
      if (!force && key === cacheKey && baseDots.length > 0) return true;

      dotMetrics = computeDotMetrics(w, h, isDesktop);
      const pixelData = getBlendedPixelData(p5, images, slider);
      const dots = sampleColorDots(pixelData, w, h, {
        spacing: dotMetrics.spacing,
        layout: dotMetrics.layout,
      });

      if (dots.length === 0) return false;

      baseDots = dots;
      cacheKey = key;
      return true;
    };

    const tryRebuildDots = async (attempts = 8) => {
      for (let i = 0; i < attempts; i += 1) {
        applyCanvasSize();
        if (rebuildDots(true)) return true;
        await waitForLayout();
      }
      return false;
    };

    const resizeToContainer = () => {
      if (!isReady) return;
      applyCanvasSize();
      cacheKey = '';
      rebuildDots(true);
    };

    const scheduleResize = () => {
      requestAnimationFrame(resizeToContainer);
    };

    const bootstrap = () => {
      if (bootstrapPromise) return bootstrapPromise;

      bootstrapPromise = (async () => {
        setLoadState('loading');
        isReady = false;
        baseDots = [];
        cacheKey = '';

        try {
          images = await loadPlaygroundImages(p5);
          clearProcessedPixelCache(p5);
        } catch (e) {
          console.error('[Playground] Image load failed', e);
          setLoadState('error');
          bootstrapPromise = null;
          return;
        }

        await waitForLayout();
        applyCanvasSize();

        const dotsOk = await tryRebuildDots();
        if (!dotsOk) {
          console.error('[Playground] Sampling produced no dots');
          setLoadState('error');
          bootstrapPromise = null;
          return;
        }

        isReady = true;
        setLoadState('ready');
      })();

      return bootstrapPromise;
    };

    p5.setup = () => {
      resizeObserver?.disconnect();

      const el = containerRef.current;
      const { width, height } = el
        ? getCanvasSize(el)
        : { width: 400, height: 267 };

      p5.createCanvas(width, height);
      p5.pixelDensity(1);
      p5.noSmooth();

      if (el && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(el);
      }

      setLoadState('loading');
      bootstrap();
    };

    p5.draw = () => {
      p5.background(PLAYGROUND_BG.r, PLAYGROUND_BG.g, PLAYGROUND_BG.b);

      if (!isReady || baseDots.length === 0 || !dotMetrics) return;

      rebuildDots(false);

      const metrics = dotMetrics;
      const noisyDots = applyNoiseToDots(
        p5,
        baseDots,
        getSliderValue(),
        p5.millis(),
        metrics,
      );

      p5.noStroke();
      for (const dot of noisyDots) {
        p5.fill(dot.r, dot.g, dot.b);
        p5.rect(dot.x, dot.y, metrics.dotSize, metrics.dotSize);
      }
    };

    p5.windowResized = scheduleResize;
  };
}
