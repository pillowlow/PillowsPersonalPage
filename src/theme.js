export const palette = {
  publications: '#F6B80E',
  firstAuthors: '#F15A24',
  artworks: '#C83434',
  competitions: '#B9D85A',
  others: '#2F5F9E',
};

export const PALETTE_COLORS = Object.values(palette);

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
    mono: '"IBM Plex Mono", "Cascadia Code", "Consolas", monospace',
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
    playgroundColumnRatio: '0.42',
    strokeWidth: '1px',
    radiusDefault: '0',
    radiusPortrait: '50%',
  },
  components: {
    playgroundMinHeight: 'clamp(280px, 40vh, 420px)',
    upperSectionMinHeight: '90vh',
    portfolioPortraitMinSizeMobile: '33.333vw',
    portfolioPortraitMinSizeDesktop: '33.333vh',
    projectImageAspectRatio: '3 / 2',
    iconSize: 'clamp(24px, 3vw, 29px)',
    projectsBarHeight: 'clamp(40px, 6vw, 52px)',
  },
  palette,
  sparkle: {
    count: 12,
    countMin: 6,
    countMax: 18,
    frameIntervalMin: 10,
    frameIntervalMax: 20,
    highlightColor: '#FFFFFF',
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
  root.style.setProperty('--playground-column-ratio', layout.playgroundColumnRatio);
  root.style.setProperty('--stroke-width', layout.strokeWidth);
  root.style.setProperty('--radius-default', layout.radiusDefault);
  root.style.setProperty('--radius-portrait', layout.radiusPortrait);

  root.style.setProperty('--playground-min-height', components.playgroundMinHeight);
  root.style.setProperty('--upper-section-min-height', components.upperSectionMinHeight);
  root.style.setProperty('--portfolio-portrait-min-size-mobile', components.portfolioPortraitMinSizeMobile);
  root.style.setProperty('--portfolio-portrait-min-size-desktop', components.portfolioPortraitMinSizeDesktop);

  Object.entries(t.palette ?? {}).forEach(([key, hex]) => {
    root.style.setProperty(`--tag-color-${key}`, hex);
  });

  root.style.setProperty('--sparkle-count', String(t.sparkle?.count ?? 12));
  root.style.setProperty('--sparkle-frame-interval-min', String(t.sparkle?.frameIntervalMin ?? 2));
  root.style.setProperty('--sparkle-frame-interval-max', String(t.sparkle?.frameIntervalMax ?? 7));
  root.style.setProperty('--color-sparkle-highlight', t.sparkle?.highlightColor ?? '#FFFFFF');

  root.style.setProperty('--project-image-aspect-ratio', components.projectImageAspectRatio);
  root.style.setProperty('--icon-size', components.iconSize);
  root.style.setProperty('--projects-bar-height', components.projectsBarHeight);
}
