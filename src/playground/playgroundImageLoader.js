import { assetUrl } from '../utils/assetUrl';
import { IMAGE_KEYS, IMAGE_PATHS } from './constants';

const LOAD_TIMEOUT_MS = 20000;

/** Blobs fetched once per page load */
let blobCache = null;
let blobLoadPromise = null;

function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timed out fetching ${url}`)), ms);
    }),
  ]);
}

async function loadAllBlobs() {
  if (blobCache) return blobCache;
  if (blobLoadPromise) return blobLoadPromise;

  blobLoadPromise = (async () => {
    const blobs = {};
    await Promise.all(
      IMAGE_KEYS.map(async (key) => {
        const url = assetUrl(IMAGE_PATHS[key]);
        const response = await fetchWithTimeout(url, LOAD_TIMEOUT_MS);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }
        blobs[key] = await response.blob();
      }),
    );
    blobCache = blobs;
    return blobs;
  })();

  try {
    return await blobLoadPromise;
  } catch (e) {
    blobLoadPromise = null;
    blobCache = null;
    throw e;
  }
}

function p5LoadBlob(p5, blob) {
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    p5.loadImage(
      objectUrl,
      (img) => {
        URL.revokeObjectURL(objectUrl);
        if (img && img.width > 0 && img.height > 0) {
          resolve(img);
          return;
        }
        reject(new Error('p5.loadImage returned an invalid image'));
      },
      (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err ?? new Error('p5.loadImage failed'));
      },
    );
  });
}

/** Fetch blobs once, then build p5.Image objects for the active sketch. */
export async function loadPlaygroundImages(p5) {
  const blobs = await loadAllBlobs();
  const images = {};

  for (const key of IMAGE_KEYS) {
    images[key] = await p5LoadBlob(p5, blobs[key]);
  }

  return images;
}
