import {
  IMAGE_FIT_REFERENCE_KEY,
  IMAGE_KEYS,
  IMAGE_STOPS,
  PLAYGROUND_BG,
  PROCESS_SIZE,
} from './constants';

export function getBlendPair(sliderValue) {
  const v = Math.max(0, Math.min(100, sliderValue));

  if (v <= IMAGE_STOPS[0]) {
    return { keyA: IMAGE_KEYS[0], keyB: IMAGE_KEYS[0], t: 0 };
  }
  if (v <= IMAGE_STOPS[1]) {
    return {
      keyA: IMAGE_KEYS[0],
      keyB: IMAGE_KEYS[1],
      t: (v - IMAGE_STOPS[0]) / (IMAGE_STOPS[1] - IMAGE_STOPS[0]),
    };
  }
  if (v <= IMAGE_STOPS[2]) {
    return {
      keyA: IMAGE_KEYS[1],
      keyB: IMAGE_KEYS[2],
      t: (v - IMAGE_STOPS[1]) / (IMAGE_STOPS[2] - IMAGE_STOPS[1]),
    };
  }
  return { keyA: IMAGE_KEYS[2], keyB: IMAGE_KEYS[2], t: 0 };
}

/**
 * Fit rect from the reference (original) image — shared by all variants so
 * proportions stay aligned when blending and sampling.
 */
export function computeSharedFitRect(images, bufferSize) {
  const ref =
    images[IMAGE_FIT_REFERENCE_KEY] || images.mesh || images.lowPoly;
  const imgW = ref?.width || 1;
  const imgH = ref?.height || 1;
  const scale = Math.min(bufferSize / imgW, bufferSize / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const offsetX = (bufferSize - drawW) * 0.5;
  const offsetY = (bufferSize - drawH) * 0.5;

  return {
    offsetX,
    offsetY,
    drawW,
    drawH,
    contentU0: offsetX / bufferSize,
    contentV0: offsetY / bufferSize,
    contentU1: (offsetX + drawW) / bufferSize,
    contentV1: (offsetY + drawH) / bufferSize,
  };
}

function drawImageIntoSharedFit(g, sourceImage, fit) {
  const imgW = sourceImage.width || 1;
  const imgH = sourceImage.height || 1;
  const scale = Math.min(fit.drawW / imgW, fit.drawH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = fit.offsetX + (fit.drawW - w) * 0.5;
  const y = fit.offsetY + (fit.drawH - h) * 0.5;
  g.image(sourceImage, x, y, w, h);
}

function resizeImageToBuffer(p5, sourceImage, size, fit) {
  const g = p5.createGraphics(size, size);
  g.pixelDensity(1);
  g.noSmooth();
  g.background(PLAYGROUND_BG.r, PLAYGROUND_BG.g, PLAYGROUND_BG.b);
  drawImageIntoSharedFit(g, sourceImage, fit);
  g.loadPixels();
  return g;
}

function lerpPixels(pixelsA, pixelsB, t, len) {
  const out = new Uint8ClampedArray(len);
  const blend = Math.max(0, Math.min(1, t));
  for (let i = 0; i < len; i += 4) {
    out[i] = pixelsA[i] + (pixelsB[i] - pixelsA[i]) * blend;
    out[i + 1] = pixelsA[i + 1] + (pixelsB[i + 1] - pixelsA[i + 1]) * blend;
    out[i + 2] = pixelsA[i + 2] + (pixelsB[i + 2] - pixelsA[i + 2]) * blend;
    out[i + 3] = pixelsA[i + 3] + (pixelsB[i + 3] - pixelsA[i + 3]) * blend;
  }
  return out;
}

const bufferCache = new WeakMap();
let sharedFitCache = new WeakMap();

export function clearProcessedPixelCache(p5) {
  bufferCache.delete(p5);
  sharedFitCache.delete(p5);
}

function getSharedFit(p5, images) {
  let fit = sharedFitCache.get(p5);
  if (!fit) {
    fit = computeSharedFitRect(images, PROCESS_SIZE);
    sharedFitCache.set(p5, fit);
  }
  return fit;
}

function getProcessedPixels(p5, images, key) {
  let cache = bufferCache.get(p5);
  if (!cache) {
    cache = {};
    bufferCache.set(p5, cache);
  }
  if (!cache[key]) {
    const fit = getSharedFit(p5, images);
    const g = resizeImageToBuffer(p5, images[key], PROCESS_SIZE, fit);
    cache[key] = new Uint8ClampedArray(g.pixels);
    g.remove();
  }
  return cache[key];
}

export function getBlendedPixelData(p5, images, sliderValue) {
  const { keyA, keyB, t } = getBlendPair(sliderValue);
  const fit = getSharedFit(p5, images);
  const pixelsA = getProcessedPixels(p5, images, keyA);
  const pixelsB = getProcessedPixels(p5, images, keyB);
  const len = pixelsA.length;
  const pixels =
    keyA === keyB ? pixelsA : lerpPixels(pixelsA, pixelsB, t, len);

  return {
    width: PROCESS_SIZE,
    height: PROCESS_SIZE,
    pixels,
    contentRect: {
      u0: fit.contentU0,
      v0: fit.contentV0,
      u1: fit.contentU1,
      v1: fit.contentV1,
    },
  };
}
