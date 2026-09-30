export const palette = {
  publications: '#F6B80E',
  papers: '#F6B80E',
  posters: '#E4A84A',
  demos: '#6C8CFF',
  exhibitions: '#D66BA0',
  firstAuthors: '#F15A24',
  artworks: '#C83434',
  competitions: '#B9D85A',
  workshops: '#2BB8A8',
  others: '#5B8DEF',
};

export const PALETTE_COLORS = [
  palette.publications,
  palette.firstAuthors,
  palette.artworks,
  palette.competitions,
  palette.others,
];

const paletteKeyByColor = new Map(
  Object.entries(palette).map(([key, value]) => [String(value).toLowerCase(), key]),
);

export function getPaletteKey(color) {
  if (!color) return null;
  return paletteKeyByColor.get(String(color).toLowerCase()) ?? null;
}

export const theme = {
  colors: {
    bg: '#1E1E1E',
    surface: '#333333',
    surfaceMuted: '#333333',
    textTitle: '#F4F4F4',
    textContent: '#D2D1D1',
    stroke: '#F4F4F4',
    accent: '#D2D1D1',
    buttonBg: '#333333',
    buttonText: '#F4F4F4',
  },
  fonts: {
    body: '"Inter", system-ui, -apple-system, sans-serif',
    display: '"Silkscreen", "DotGothic16", monospace',
    hud: '"VT323", "DotGothic16", monospace',
    mono: '"VT323", "IBM Plex Mono", "Cascadia Code", "Consolas", monospace',
    titleLetterSpacing: '0.14em',
    projectsTitleLetterSpacing: '0.22em',
  },
  textLevels: {
    h1: 'clamp(1.5rem, 2.5vw + 1rem, 2rem)',
    h2: 'clamp(1.125rem, 1.5vw + 0.75rem, 1.5rem)',
    body: 'clamp(0.9375rem, 0.5vw + 0.85rem, 1.0625rem)',
    caption: 'clamp(0.75rem, 0.25vw + 0.7rem, 0.875rem)',
  },
  spacing: {
    pagePadding: '0',
    sectionGap: '0',
    cardGap: 'clamp(0.75rem, 1.5vw, 1.25rem)',
    cardPadding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
    contentPadding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
    controlPadding: '0.4rem 0.75rem',
  },
  layout: {
    maxWidth: '1200px',
    desktopBreakpoint: '768px',
    strokeWidth: '1px',
    radiusDefault: '0',
    radiusPortrait: '50%',
  },
  components: {
    portfolioPortraitMinSizeMobile: '33.333vw',
    portfolioPortraitMinSizeDesktop: '33.333vh',
    projectImageAspectRatio: '3 / 2',
    iconSize: 'clamp(24px, 3vw, 29px)',
    projectsBarHeight: 'clamp(40px, 6vw, 52px)',
  },
  palette,
  sparkle: {
    count: 6,
    countMin: 3,
    countMax: 8,
    frameIntervalMin: 18,
    frameIntervalMax: 36,
    highlightColors: ['#C4C4C4', '#9A9A9A'],
    highlightColor: '#FFFFFF',
  },
  grid: {
    size: '24px',
    opacity: 0.14,
  },
  titleBloom: {
    near: '0.45rem',
    far: '1.15rem',
  },
  glow: {
    blur: '0.7rem',
    spread: '0.18rem',
    scanlineSize: '0.22rem',
    scanlineOpacity: 0.14,
    bleed: '1.2rem',
    flickerMs: 1400,
  },
  home: {
    buttonMinHeight: 'clamp(4.5rem, 10vw, 7rem)',
    stackMaxWidth: 'min(88vw, 30rem)',
    stackGap: 'clamp(0.7rem, 2vw, 1.25rem)',
    letterGap: 'clamp(0.12rem, 0.5vw, 0.35rem)',
    buttonSparkle: {
      highlightColors: PALETTE_COLORS,
      whiteRatio: 0.35,
      minWhite: 1,
      frameIntervalMin: 45,
      frameIntervalMax: 90,
    },
    portraitBuzzMs: 420,
  },
  game: {
    pixelScale: 3,
    fixedStep: 1 / 120,
    piece: {
      radius: 9,
      sidesMin: 3,
      sidesMax: 6,
      lifetimeMs: 60000,
      burstMs: 320,
    },
    physics: {
      friction: 0.995,
      restitution: 0.86,
      substeps: 4,
      maxDt: 1 / 30,
      restSpeed: 12,
    },
    launch: {
      origin: 'bottom-center',
      originOffset: 56,
      mobileBreakpoint: 640,
      mobileOriginRatio: 0.08,
      mobileOriginMax: 64,
      idlePulse: true,
      startPulseMs: 1200,
      speedMin: 520,
      speedMax: 1200,
      cooldownMs: 2000,
    },
    holes: [
      { color: 'publications', edge: 'top', t: 0.16 },
      { color: 'firstAuthors', edge: 'top', t: 0.72 },
      { color: 'artworks', edge: 'left', t: 0.42 },
      { color: 'competitions', edge: 'right', t: 0.32 },
      { color: 'others', edge: 'right', t: 0.78 },
    ],
    scoring: {
      match: 10,
      comboStep: 1,
      wrongHole: -10,
    },
    play: {
      restitution: 0.9,
      holeRadiusMultiplier: 1.6,
      aimBounces: 1,
      timeScale: 1,
      magnetStrength: 0.01,
    },
    gate: {
      visual: {
        thickness: 2.5,
        innerScale: 0.62,
      },
      relocation: {
        enabled: true,
        edges: ['top', 'left', 'right'],
        minT: 0.12,
        maxT: 0.88,
        minTGap: 0.2,
        minDistanceRatio: 0.16,
        attempts: 32,
      },
    },
    monster: {
      enabled: false,
      atlasUrl: '/assets/playground/monster_atlas.png',
      cols: 2,
      rows: 2,
    },
  },
};

export function applyThemeToDocument(t = theme) {
  const root = document.documentElement;
  const { colors, fonts, textLevels, spacing, layout, components } = t;

  root.style.setProperty('--color-bg', colors.bg);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-muted', colors.surfaceMuted);
  root.style.setProperty('--color-text-title', colors.textTitle);
  root.style.setProperty('--color-text-content', colors.textContent);
  root.style.setProperty('--color-stroke', colors.stroke);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-button-bg', colors.buttonBg);
  root.style.setProperty('--color-button-text', colors.buttonText);

  root.style.setProperty('--font-body', fonts.body);
  root.style.setProperty('--font-display', fonts.display);
  root.style.setProperty('--font-hud', fonts.hud);
  root.style.setProperty('--font-mono', fonts.mono);
  root.style.setProperty('--title-letter-spacing', fonts.titleLetterSpacing);
  root.style.setProperty('--projects-title-letter-spacing', fonts.projectsTitleLetterSpacing);
  root.style.setProperty('--text-h1', textLevels.h1);
  root.style.setProperty('--text-h2', textLevels.h2);
  root.style.setProperty('--text-body', textLevels.body);
  root.style.setProperty('--text-caption', textLevels.caption);

  root.style.setProperty('--page-padding', spacing.pagePadding);
  root.style.setProperty('--section-gap', spacing.sectionGap);
  root.style.setProperty('--card-gap', spacing.cardGap);
  root.style.setProperty('--card-padding', spacing.cardPadding);
  root.style.setProperty('--content-padding', spacing.contentPadding);
  root.style.setProperty('--control-padding', spacing.controlPadding);

  root.style.setProperty('--max-width', layout.maxWidth);
  root.style.setProperty('--breakpoint-desktop', layout.desktopBreakpoint);
  root.style.setProperty('--stroke-width', layout.strokeWidth);
  root.style.setProperty('--radius-default', layout.radiusDefault);
  root.style.setProperty('--radius-portrait', layout.radiusPortrait);

  root.style.setProperty('--portfolio-portrait-min-size-mobile', components.portfolioPortraitMinSizeMobile);
  root.style.setProperty('--portfolio-portrait-min-size-desktop', components.portfolioPortraitMinSizeDesktop);

  Object.entries(t.palette ?? {}).forEach(([key, hex]) => {
    root.style.setProperty(`--tag-color-${key}`, hex);
  });

  root.style.setProperty('--sparkle-count', String(t.sparkle?.count ?? 12));
  root.style.setProperty('--sparkle-frame-interval-min', String(t.sparkle?.frameIntervalMin ?? 2));
  root.style.setProperty('--sparkle-frame-interval-max', String(t.sparkle?.frameIntervalMax ?? 7));
  root.style.setProperty('--color-sparkle-highlight', t.sparkle?.highlightColor ?? '#FFFFFF');

  const grid = t.grid ?? {};
  root.style.setProperty('--grid-size', grid.size ?? '24px');
  root.style.setProperty('--grid-opacity', String(grid.opacity ?? 0.14));

  const titleBloom = t.titleBloom ?? {};
  root.style.setProperty('--title-bloom-near', titleBloom.near ?? '0.45rem');
  root.style.setProperty('--title-bloom-far', titleBloom.far ?? '1.15rem');

  root.style.setProperty('--project-image-aspect-ratio', components.projectImageAspectRatio);
  root.style.setProperty('--icon-size', components.iconSize);
  root.style.setProperty('--projects-bar-height', components.projectsBarHeight);

  const glow = t.glow ?? {};
  root.style.setProperty('--glow-blur', glow.blur ?? '0.7rem');
  root.style.setProperty('--glow-spread', glow.spread ?? '0.18rem');
  root.style.setProperty('--glow-scanline-size', glow.scanlineSize ?? '0.22rem');
  root.style.setProperty('--glow-scanline-opacity', String(glow.scanlineOpacity ?? 0.14));
  root.style.setProperty('--glow-bleed', glow.bleed ?? '1.2rem');
  root.style.setProperty('--glow-flicker-ms', `${glow.flickerMs ?? 1400}ms`);

  const home = t.home ?? {};
  root.style.setProperty('--home-button-min-height', home.buttonMinHeight ?? '4.5rem');
  root.style.setProperty('--home-stack-max-width', home.stackMaxWidth ?? 'min(88vw, 30rem)');
  root.style.setProperty('--home-stack-gap', home.stackGap ?? '1rem');
  root.style.setProperty('--home-letter-gap', home.letterGap ?? '0.2rem');
  root.style.setProperty('--home-portrait-buzz-ms', `${home.portraitBuzzMs ?? 420}ms`);

  const game = t.game ?? {};
  root.style.setProperty('--game-pixel-scale', String(game.pixelScale ?? 3));
  root.style.setProperty('--game-piece-radius', `${game.piece?.radius ?? 9}px`);
}
