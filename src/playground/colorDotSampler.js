import { DRAG_CIRCLE_RESERVE } from './constants';

function getBowlRegion(canvasW, canvasH, layout) {
  return {
    x: canvasW * layout.xRatio,
    y: canvasH * layout.yRatio,
    w: canvasW * layout.widthRatio,
    h: canvasH * layout.heightRatio,
  };
}

function isInDragReserve(canvasX, canvasY, canvasW, canvasH) {
  const rx = canvasW * DRAG_CIRCLE_RESERVE.xRatio;
  const ry = canvasH * DRAG_CIRCLE_RESERVE.yRatio;
  const rw = canvasW * DRAG_CIRCLE_RESERVE.widthRatio;
  const rh = canvasH * DRAG_CIRCLE_RESERVE.heightRatio;
  return canvasX >= rx && canvasX <= rx + rw && canvasY >= ry && canvasY <= ry + rh;
}

function samplePixel(pixelData, u, v) {
  const rect = pixelData.contentRect;
  const su = rect ? rect.u0 + u * (rect.u1 - rect.u0) : u;
  const sv = rect ? rect.v0 + v * (rect.v1 - rect.v0) : v;

  const px = Math.min(
    pixelData.width - 1,
    Math.max(0, Math.floor(su * pixelData.width)),
  );
  const py = Math.min(
    pixelData.height - 1,
    Math.max(0, Math.floor(sv * pixelData.height)),
  );
  const idx = (py * pixelData.width + px) * 4;

  return {
    r: pixelData.pixels[idx],
    g: pixelData.pixels[idx + 1],
    b: pixelData.pixels[idx + 2],
    a: pixelData.pixels[idx + 3],
  };
}

function isVisiblePixel(r, g, b, a) {
  if (a < 6) return false;
  if (r + g + b < 12) return false;
  return true;
}

/**
 * Sample color dots from blended pixel data into canvas coordinates.
 */
export function sampleColorDots(pixelData, canvasW, canvasH, options = {}) {
  const { spacing, layout } = options;
  if (!spacing || !layout || !pixelData?.pixels) return [];

  const region = getBowlRegion(canvasW, canvasH, layout);
  const cols = Math.max(1, Math.floor(region.w / spacing));
  const rows = Math.max(1, Math.floor(region.h / spacing));

  const offsetX = (region.w - cols * spacing) * 0.5;
  const offsetY = (region.h - rows * spacing) * 0.5;

  const dots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const u = (col + 0.5) / cols;
      const v = (row + 0.5) / rows;
      const { r, g, b, a } = samplePixel(pixelData, u, v);

      if (!isVisiblePixel(r, g, b, a)) continue;

      const x = region.x + offsetX + (col + 0.5) * spacing;
      const y = region.y + offsetY + (row + 0.5) * spacing;

      if (isInDragReserve(x, y, canvasW, canvasH)) continue;

      dots.push({
        x,
        y,
        r,
        g,
        b,
        seedX: col,
        seedY: row,
      });
    }
  }

  return dots;
}
