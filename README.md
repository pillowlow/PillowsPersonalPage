# Pillows Personal Page

A responsive personal portfolio built with React and Vite, deployable to GitHub Pages. The layout follows wireframes in `References/`; content is driven by JSON; styling is centralized in `src/theme.js`.

## Tech stack

- React 18 + Vite
- p5.js via `@p5-wrapper/react` (playground placeholder sketch)
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
│   │   └── projects.json
│   ├── components/
│   └── styles/global.css
└── vite.config.js       # base path for GitHub Pages
```

## Editing content

### Site copy (`src/data/site.json`)

Update `en` and `zh` sections: mission/about text, button labels, filter labels, email (`mailto:`), and Instagram URL.

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

- Implement interactive p5 playground (drag circle, visuals)
- Wire the digital/perceptual slider to sketch parameters
