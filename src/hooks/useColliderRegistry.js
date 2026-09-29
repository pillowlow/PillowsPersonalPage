import { useCallback, useEffect, useMemo, useRef } from 'react';
import { gameLog } from '../game/gameLog';
import { getPaletteKey } from '../theme';

function toLocalRect(rect, baseRect) {
  return {
    x: rect.left - baseRect.left,
    y: rect.top - baseRect.top,
    w: rect.width,
    h: rect.height,
  };
}

function normalizeCssColor(color) {
  if (!color) return null;
  const value = color.trim().toLowerCase();
  if (value.startsWith('#')) return value;
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  const channel = (channelValue) => Number(channelValue).toString(16).padStart(2, '0');
  return `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`;
}

export default function useColliderRegistry() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const characterElementsRef = useRef(new Map());
  const buttonElementsRef = useRef(new Map());
  const colorsRef = useRef(new Map());
  const snapshotRef = useRef({ version: 0, buttons: [] });
  const measureFrameRef = useRef(null);
  const measureSignatureRef = useRef('');

  const measure = useCallback(() => {
    measureFrameRef.current = null;

    const baseElement = canvasRef.current ?? rootRef.current;
    const baseRect = baseElement?.getBoundingClientRect();
    const root = rootRef.current ?? baseElement?.parentElement;
    if (!baseRect || !root) return;

    const grouped = new Map();
    root.querySelectorAll('[data-collider-key]').forEach((node) => {
      const key = node.getAttribute('data-collider-key');
      if (!key) return;
      const colorKey = getPaletteKey(normalizeCssColor(node.style.color));
      if (!colorKey) return;

      const id = key.slice(0, key.lastIndexOf(':')) || 'text';
      const buttonElement = node.closest('a') ?? node.parentElement;
      const rect = node.getBoundingClientRect();
      const local = toLocalRect(rect, baseRect);
      const pad = 3;
      const char = {
        key,
        colorKey,
        index: Number(key.slice(key.lastIndexOf(':') + 1)),
        x: local.x - pad,
        y: local.y - pad,
        w: local.w + pad * 2,
        h: local.h + pad * 2,
      };
      if (char.w <= 0 || char.h <= 0) return;

      const group = grouped.get(id) ?? { element: buttonElement, chars: [] };
      group.chars.push(char);
      grouped.set(id, group);
    });

    const buttons = [...grouped.entries()].map(([id, group]) => {
      const buttonRect = group.element?.getBoundingClientRect();
      return {
        id,
        rect: buttonRect ? toLocalRect(buttonRect, baseRect) : { x: 0, y: 0, w: 0, h: 0 },
        chars: group.chars,
      };
    });

    snapshotRef.current = {
      version: snapshotRef.current.version + 1,
      buttons,
    };
    const colored = buttons.reduce((sum, button) => sum + button.chars.length, 0);
    if (typeof window !== 'undefined') window.__gameLetters = colored;
    const signature = buttons.map((button) => `${button.id}:${button.chars.length}`).join('|');
    if (signature !== measureSignatureRef.current) {
      measureSignatureRef.current = signature;
      gameLog('measured colliders', {
        version: snapshotRef.current.version,
        canvas: `${Math.round(baseRect.width)}x${Math.round(baseRect.height)}`,
        colored,
        buttons: buttons.map((button) => ({
          id: button.id,
          colored: button.chars.length,
          sample: button.chars.slice(0, 2).map((char) => (
            `${char.colorKey}@${Math.round(char.x)},${Math.round(char.y)} ${Math.round(char.w)}x${Math.round(char.h)}`
          )),
        })),
      });
    }
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
    scheduleMeasure();
  }, [scheduleMeasure]);

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
      remeasure: measure,
    }),
    [getCharColor, getColliders, measure, register, registerButton, setCanvasElement, setColor, unregister],
  );
}
