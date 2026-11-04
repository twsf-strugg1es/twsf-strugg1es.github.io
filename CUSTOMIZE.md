# Customising this site

This is a static HTML, CSS and JavaScript site with no build step, no framework and no `npm install`. You edit a file, save it, and refresh the page.

## Which file to edit

| You want to change | Edit this file | Notes |
| --- | --- | --- |
| Any words, links, jobs, projects, skills, certificates | `content.js` | Change the values and keep the keys. |
| Colours, phosphor themes (amber, green, cyan), fonts, type sizes | `theme.css` | Site-wide variables and palette presets. |
| Layout, retro pixel shadows, responsive styles, CRT filter | `styles.css` | Sections appear in page order. |
| Interactive logic, loader boot messages, SFX synth, terminal | `main.js` | Modular structure with element builders. |
| The ASCII effects (hero canvas field, image develop, scramble) | `ascii.js` | Math & canvas rendering engine. |
| Page metadata, social preview tags, Google Fonts loaded | `index.html` | Head tags and skeleton layout slots. |
| Netlify hosting, headers, security policies | `netlify.toml` | Build and headers configuration for Netlify. |
| Automated GitHub Pages deployment | `.github/workflows/deploy.yml` | GitHub Actions workflow for zero-touch deploy on push. |
| Images and favicon | `assets/` | Favicon, social card (`og.png`), and webp project images. |

## Prompt to give an AI tool

Paste this before your request when you ask ChatGPT, Claude, Cursor or another tool to change the site:

> This is a static portfolio site with no build step. Content lives in `content.js` as `window.SITE = {...}`. Theme variables live in `theme.css`. Rules: change only the files needed for my request; in `content.js` keep every key name and the object shape, and only change values or add/remove items in arrays; keep text plain (no HTML inside strings); keep links as `https://`, `mailto:` or `#section`; do not add frameworks, build tools or npm packages; do not rename CSS classes used in `main.js`. After the change, tell me which file(s) you edited.

## Common edits

**Change your job:** in `content.js`, edit `person.role`, `person.company` and the first item in `experience.items`. Dates are `"YYYY-MM"`; use `to: null` for a current role.

**Add a project:** copy one object inside `work.projects` and change it. For `media` you can use either:
- `{ type: "images", main: {...}, strip: [...] }` for real screenshots (only the first project uses this layout), or
- `{ type: "ascii", caption: "...", art: String.raw\`...\` }` for a drawn text panel. Keep every line of the art the same width so the boxes line up.

**Add your CV:** put `cv.pdf` in `assets/`, then set `person.cvUrl: "assets/cv.pdf"`. A "Download CV" button appears in the hero, and the `cv` command starts working in the terminal.

**Toggle or adjust the Vintage Pixel Loader:** in `main.js`, customize `bootMessages` inside `initLoader()` to change the retro boot log messages or timing.

**Change or add Phosphor palettes:** in `theme.css`, add or modify `[data-theme="..."]` blocks (e.g. `amber`, `green`, `cyan`).

## Check your change

1. Run a local server from this folder: `python -m http.server 8000`, then open `http://localhost:8000`.
2. Open the browser console (F12) to verify there are no errors.
3. Test mobile view (F12 > Toggle Device Toolbar) to check phone responsiveness.

## Publish on GitHub Pages & Netlify

See `README.md` for complete step-by-step instructions for both GitHub Pages and Netlify.
