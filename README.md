# Pillows Personal Page

A responsive personal portfolio built with React and Vite, deployable to GitHub Pages. The layout follows wireframes in `References/`; content is driven by JSON; styling is centralized in `src/theme.js`.

## Tech stack

- React 18 + Vite
- Canvas 2D custom game loop (no runtime game dependency)
- Plain CSS with variables from `theme.js`

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints. Example: `http://localhost:5173/`.

## Project structure

```
├── public/assets/       # Static images, icons, playground assets (served by Vite)
├── References/          # Layout wireframes (not used at runtime)
├── src/
│   ├── theme.js         # Design tokens → CSS variables
│   ├── data/
│   │   ├── site.json    # Bilingual UI copy (not project bodies)
│   │   ├── accounts.json
│   │   ├── demos.json
│   │   └── projects.json
│   ├── game/             # Physics, rendering, and fixed-timestep game loop
│   ├── pages/            # Hash-routed Home, Intro, Accounts, Demos, Works
│   ├── components/
│   └── styles/global.css
└── vite.config.js       # base path for GitHub Pages
```

## Editing content

### Site copy (`src/data/site.json`)

Update `en` and `zh` sections: mission/about text, navigation labels, HUD labels, and filter labels.

Account links live in `src/data/accounts.json`; online demos live in
`src/data/demos.json`. The home page uses hash routes (`#/intro`, `#/accounts`,
`#/demos`, and `#/works`) so links remain compatible with GitHub Pages.

### Projects (`src/data/projects.json`)

Each project supports:

| Field | Description |
|-------|-------------|
| `id` | Unique string |
| `images` | Array of paths under `/assets/...` (click card image to cycle if multiple) |
| `year` | Number; list sorts newest first |
| `types` | Tags used by filters (e.g. `publication`, `first-author`, `artwork`, `competition`) |
| `contentEn` / `contentZh` | Project description |
| `references` | `{ text, link }[]` |

Add images directly under `public/assets/` (e.g. `public/assets/projects/my-work.jpg`).

### Theme (`src/theme.js`)

Change colors, typography `clamp()` sizes, spacing, and component dimensions. `applyThemeToDocument()` in `main.jsx` maps tokens to CSS variables consumed in `global.css` and components.

## Deploy to GitHub Pages

1. Push to `main`; GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys `dist/` to Pages.
2. In repo **Settings → Pages**, set source to **GitHub Actions** and custom domain `pillowlowchen.com` (see `public/CNAME`).
3. Point DNS A records for the apex domain to GitHub Pages; optional `www` CNAME to `YOUR_USERNAME.github.io`.

Manual deploy:

```bash
npm run build
# Upload dist/ or use gh-pages branch workflow
```

## Future work

- Add the 2×2 monster sprite atlas to `public/assets/playground/` and enable
  the reserved renderer hook in `src/game/render.js`.
- Add real online demo records to `src/data/demos.json`.
