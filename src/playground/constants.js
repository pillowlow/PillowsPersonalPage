import { theme } from '../theme';

function hexToRgb(hex) {
  const n = hex.replace('#', '');
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

export const PLAYGROUND_BG = hexToRgb(theme.colors.bg);

export const IMAGE_STOPS = [25, 50, 75];

export const IMAGE_KEYS = ['mesh', 'lowPoly', 'ori'];

export const IMAGE_PATHS = {
  mesh: '/assets/playground/fruit_bowl_mesh.png',
  lowPoly: '/assets/playground/fruit_bowl_low_poly.png',
  ori: '/assets/playground/fruit_bowl_ori.png',
};

/** Reference image used to define shared fit proportions for all bowl PNGs */
export const IMAGE_FIT_REFERENCE_KEY = 'ori';

export const DESKTOP_MIN_WIDTH = 768;

export const MOBILE_CANVAS_ASPECT = { width: 3, height: 2 };

export const DESKTOP_CANVAS_ASPECT = { width: 1, height: 1 };

export const PROCESS_SIZE = 280;

export const DOT_FILL_RATIO = 0.5;

export const DOT_CELL_SIZE = {
  mobile: 10,
  desktop: 7,
};

/** Typical canvas size used to calibrate density + noise scaling */
export const REF_CANVAS_SIZE = {
  mobile: 390,
  desktop: 520,
};

export function getBowlLayout(isDesktop) {
  return isDesktop ? BOWL_LAYOUT : BOWL_LAYOUT_MOBILE;
}

/**
 * Spacing + dot size from live canvas; smaller canvases get smaller cells/dots/gaps.
 */
export function computeDotMetrics(canvasW, canvasH, isDesktop) {
  const layout = getBowlLayout(isDesktop);
  const regionW = canvasW * layout.widthRatio;
  const regionH = canvasH * layout.heightRatio;

  if (regionW <= 0 || regionH <= 0) {
    return { spacing: 2, dotSize: 1, layout, canvasScale: 1 };
  }

  const ref = isDesktop ? REF_CANVAS_SIZE.desktop : REF_CANVAS_SIZE.mobile;
  const canvasScale = Math.min(1, Math.min(canvasW, canvasH) / ref);

  const baseCell = isDesktop ? DOT_CELL_SIZE.desktop : DOT_CELL_SIZE.mobile;
  const cellSize = baseCell * Math.max(0.45, canvasScale);

  const cols = Math.max(12, Math.round(regionW / cellSize));
  const rows = Math.max(12, Math.round(regionH / cellSize));
  const spacingX = regionW / cols;
  const spacingY = regionH / rows;

  const spacingMin = 0.6 + canvasScale * 0.5;
  const spacingMax = 3.5 + canvasScale * 2.5;
  const spacing = Math.max(
    spacingMin,
    Math.min(spacingMax, Math.min(spacingX, spacingY)),
  );

  return {
    spacing,
    dotSize: spacing * DOT_FILL_RATIO,
    layout,
    canvasScale,
    regionW,
    regionH,
  };
}

/** Soft cap — sampler no longer aborts mid-grid when exceeded */
export const MAX_DOTS = 50000;

function centeredBowlLayout(widthRatio, heightRatio) {
  return {
    xRatio: (1 - widthRatio) / 2,
    yRatio: (1 - heightRatio) / 2,
    widthRatio,
    heightRatio,
  };
}

export const BOWL_LAYOUT = centeredBowlLayout(0.66, 0.76);

export const BOWL_LAYOUT_MOBILE = centeredBowlLayout(0.78, 0.84);

/** Upper-right only — must not overlap the bowl dot field */
export const DRAG_CIRCLE_RESERVE = {
  xRatio: 0.72,
  yRatio: 0,
  widthRatio: 0.26,
  heightRatio: 0.32,
};

export const NOISE = {
  minAmplitude: 0.1,
  maxAmplitude: 14,
  maxSliderDistance: 22,
  peakExponent: 3,
  timeScale: 0.008,
  spatialScale: 0.12,
  /** Noise amplitude scales with dot spacing at this reference */
  referenceSpacing: 5,
};
