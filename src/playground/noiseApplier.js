import { IMAGE_STOPS, NOISE } from './constants';

export function getNoiseAmplitude(sliderValue, metrics = {}) {
  const dist = IMAGE_STOPS.reduce(
    (min, stop) => Math.min(min, Math.abs(sliderValue - stop)),
    100,
  );
  const linear = 1 - Math.min(dist / NOISE.maxSliderDistance, 1);
  const t = linear ** NOISE.peakExponent;

  let amp =
    NOISE.minAmplitude + (NOISE.maxAmplitude - NOISE.minAmplitude) * t;

  const spacing = metrics.spacing ?? NOISE.referenceSpacing;
  const canvasScale = metrics.canvasScale ?? 1;
  amp *= (spacing / NOISE.referenceSpacing) * Math.max(0.55, canvasScale);

  return amp;
}

/**
 * Apply time-varying noise offsets to dot positions.
 */
export function applyNoiseToDots(p5, baseDots, sliderValue, time, metrics = {}) {
  const amp = getNoiseAmplitude(sliderValue, metrics);

  return baseDots.map((dot) => {
    const nx = p5.noise(
      dot.seedX * NOISE.spatialScale,
      dot.seedY * NOISE.spatialScale,
      time * NOISE.timeScale,
    );
    const ny = p5.noise(
      dot.seedX * NOISE.spatialScale + 50,
      dot.seedY * NOISE.spatialScale + 50,
      time * NOISE.timeScale + 100,
    );

    return {
      ...dot,
      x: dot.x + (nx - 0.5) * amp * 2,
      y: dot.y + (ny - 0.5) * amp * 2,
    };
  });
}
