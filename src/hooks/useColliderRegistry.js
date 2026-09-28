import { useCallback, useEffect, useMemo, useRef } from 'react';

function toLocalRect(rect, baseRect) {
  return {
    x: rect.left - baseRect.left,
    y: rect.top - baseRect.top,
    w: rect.width,
    h: rect.height,
  };
}

export default function useColliderRegistry() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const characterElementsRef = useRef(new Map());
  const buttonElementsRef = useRef(new Map());
  const colorsRef = useRef(new Map());
  const snapshotRef = useRef({ version: 0, buttons: [] });
  const measureFrameRef = useRef(null);

  const measure = useCallback(() => {
    measureFrameRef.current = null;

    const baseElement = canvasRef.current ?? rootRef.current;
    const baseRect = baseElement?.getBoundingClientRect();
    if (!baseRect) return;

    const buttons = [...buttonElementsRef.current.entries()]
      .map(([id, element]) => {
        if (!element) return null;

        const buttonRect = element.getBoundingClientRect();
        const chars = [...characterElementsRef.current.entries()]
          .filter(([key]) => key.startsWith(`${id}:`))
          .map(([key, charElement]) => {
            const rect = charElement.getBoundingClientRect();
            return {
              key,
              index: Number(key.slice(key.lastIndexOf(':') + 1)),
              ...toLocalRect(rect, baseRect),
            };
          })
          .filter((char) => char.w > 0 && char.h > 0);

        return {
          id,
          rect: toLocalRect(buttonRect, baseRect),
          chars,
        };
      })
      .filter(Boolean);

    snapshotRef.current = {
      version: snapshotRef.current.version + 1,
      buttons,
    };
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (measureFrameRef.current !== null) return;
    measureFrameRef.current = requestAnimationFrame(measure);
  }, [measure]);

  const setCanvasElement = useCallback(
    (element) => {
      canvasRef.current = element;
      scheduleMeasure();
    },
    [scheduleMeasure],
  );

  const register = useCallback(
    (key, element) => {
      if (element) {
        characterElementsRef.current.set(key, element);
      } else {
        characterElementsRef.current.delete(key);
        colorsRef.current.delete(key);
      }
      scheduleMeasure();
    },
    [scheduleMeasure],
  );

  const unregister = useCallback(
    (key) => {
      characterElementsRef.current.delete(key);
      colorsRef.current.delete(key);
      scheduleMeasure();
    },
    [scheduleMeasure],
  );

  const registerButton = useCallback(
    (id, element) => {
      if (element) {
        buttonElementsRef.current.set(id, element);
      } else {
        buttonElementsRef.current.delete(id);
      }
      scheduleMeasure();
    },
    [scheduleMeasure],
  );

  const setColor = useCallback((key, color) => {
    if (color) {
      colorsRef.current.set(key, color);
    } else {
      colorsRef.current.delete(key);
    }
  }, []);

  const getColliders = useCallback(() => snapshotRef.current, []);

  const getCharColor = useCallback((key) => colorsRef.current.get(key) ?? null, []);

  useEffect(() => {
    const root = rootRef.current;
    const resizeObserver = root && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(scheduleMeasure)
      : null;

    resizeObserver?.observe(root);
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('orientationchange', scheduleMeasure);

    const fonts = document.fonts;
    fonts?.ready?.then(scheduleMeasure);
    fonts?.addEventListener?.('loadingdone', scheduleMeasure);
    scheduleMeasure();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('orientationchange', scheduleMeasure);
      fonts?.removeEventListener?.('loadingdone', scheduleMeasure);
      if (measureFrameRef.current !== null) {
        cancelAnimationFrame(measureFrameRef.current);
      }
    };
  }, [scheduleMeasure]);

  return useMemo(
    () => ({
      rootRef,
      setCanvasElement,
      register,
      unregister,
      registerButton,
      setColor,
      getColliders,
      getCharColor,
    }),
    [getCharColor, getColliders, register, registerButton, setCanvasElement, setColor, unregister],
  );
}
