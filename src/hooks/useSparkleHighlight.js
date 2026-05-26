import { useEffect, useMemo, useRef, useState } from 'react';
import { theme } from '../theme';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEligibleIndices(text) {
  return [...text]
    .map((char, index) => ({ char, index }))
    .filter(({ char }) => char.trim() !== '')
    .map(({ index }) => index);
}

function pickRandomIndices(indices, count) {
  const shuffled = [...indices].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function buildHighlightMap(text, count, highlightColor) {
  const eligible = getEligibleIndices(text);
  const selected = pickRandomIndices(eligible, count);
  const map = new Map();
  selected.forEach((index) => {
    map.set(index, highlightColor);
  });
  return map;
}

function pickHighlightCount(config) {
  const min = config.countMin ?? Math.max(1, Math.floor((config.count ?? 12) * 0.5));
  const max = config.countMax ?? config.count ?? 12;
  return randomInt(min, max);
}

function pickNextFrameThreshold(config) {
  const min = config.frameIntervalMin ?? 2;
  const max = config.frameIntervalMax ?? 7;
  return randomInt(min, max);
}

export function useSparkleHighlight(text, options = {}) {
  const sparkle = { ...theme.sparkle, ...options };
  const highlightColor = sparkle.highlightColor ?? '#FFFFFF';
  const [highlightMap, setHighlightMap] = useState(() => new Map());
  const framesUntilUpdateRef = useRef(0);
  const rafRef = useRef(null);

  const textKey = useMemo(() => text, [text]);

  useEffect(() => {
    const refresh = () => {
      const n = pickHighlightCount(sparkle);
      setHighlightMap(buildHighlightMap(textKey, n, highlightColor));
      framesUntilUpdateRef.current = pickNextFrameThreshold(sparkle);
    };

    refresh();

    const tick = () => {
      framesUntilUpdateRef.current -= 1;
      if (framesUntilUpdateRef.current <= 0) {
        refresh();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [textKey, highlightColor, sparkle.count, sparkle.countMin, sparkle.countMax, sparkle.frameIntervalMin, sparkle.frameIntervalMax]);

  return highlightMap;
}
