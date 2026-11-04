# Ahmad Farruk Towsif — Portfolio & Sprint Pipeline

> Technical Project Coordinator at NS Media, Dhaka. Turning complex requirements into software that ships on time.

An ultra-fast, responsive portfolio built with a blend of **authentic vintage pixel aesthetic** and **interactive ASCII engine**. Zero build step, zero frameworks, 100% pure web standards.

---

## ⚡ Features

- **Vintage Pixel BIOS Boot Loader**: Authentic 8-bit ROM BIOS boot sequence with system RAM check, Dhaka time synchronization, block progress bar, and instant skip options.
- **Interactive Retro CRT Engine**:
  - CRT scanlines and subtle curvature vignette (toggleable).
  - 8-bit Web Audio SFX synthesizer (blips, clicks, and chimes generated dynamically without audio files).
  - Phosphor palette switcher (`Amber`, `Green / Apple II`, `Cyan / Cyberpunk`).
- **Interactive Monospace / ASCII Visuals**:
  - Hero field: `"TOWSIF"` assembles out of random characters on load, reacts to touch & pointer, breaks apart on scroll.
  - Image Develop: Project screenshots start as ASCII representations and resolve cell-by-cell into full-resolution photos.
  - Sprint Kanban Board: Scroll-pinned sprint board where a real ticket (`EXAM-42`) traverses from `Backlog` → `Planned` → `Building` → `Review` → `Shipped`.
  - MySQL Toolkit: Types out technical skills as an authentic SQL table with automatic fallback to vertical `\G` format on mobile.
  - In-Page Zsh Terminal: Interactive command prompt (`whoami`, `work`, `skills`, `contact`, `theme`, `sfx`, `crt`, `reboot`, `sudo`).
- **100% Mobile Responsive**:
  - Retro pixel mobile drawer navigation (`[MENU]`).
  - Fluid typography with viewport clamping.
  - Horizontal swipe & auto-centering for the sprint board on small screens.
  - Touch-friendly tap targets and zero iOS auto-zoom glitches.

---

## 🚀 Local Preview

Run Python's built-in web server from this directory:

```bash
# In W:\Personal\portfolio
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🌐 Deploy Live

### Option 1: GitHub Pages (Recommended)

This repository includes `.nojekyll` and `.github/workflows/deploy.yml` for automated GitHub Actions deployment.

1. **Create a GitHub repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name it `portfolio` (or `twsf-strugg1es.github.io` for root domain).
   - Set visibility to **Public**. Leave "Add README" unchecked.

2. **Push your code**:
   ```bash
   git add .
   git commit -m "feat: complete pixel portfolio with responsive design"
   git remote add origin https://github.com/twsf-strugg1es/portfolio.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub: **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions** (or "Deploy from a branch", branch `main`, folder `/ (root)`).
   - Your site will be live at:
     `https://twsf-strugg1es.github.io/portfolio/` (or `https://twsf-strugg1es.github.io/`).

---

### Option 2: Netlify (Instant 30-Second Deploy)

This repository includes `netlify.toml` with preconfigured cache headers and security rules.

#### Method A: Netlify Drop (No CLI, 30 seconds)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `portfolio` folder directly into the browser.
3. Your site is instantly live with a free SSL certificate!
4. (Optional) In Netlify Site Settings, rename your site to `towsif.netlify.app` or connect your custom domain.

#### Method B: Connect GitHub to Netlify (Continuous Deployment)
1. In your Netlify dashboard, click **Add new site** → **Import an existing project**.
2. Select **GitHub** and pick the `portfolio` repository.
3. Keep default settings (Build command: empty, Publish directory: `.`).
4. Click **Deploy**. Netlify will automatically redeploy whenever you push commits!

---

## 📁 File Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page markup, skeleton slots, SEO & OpenGraph tags, retro loader markup |
| `theme.css` | Color tokens (Amber, Green, Cyan phosphor), fonts, fluid type scales |
| `styles.css` | Layout, pixel styling, 8-bit shadows, responsive breakpoints, CRT overlay |
| `content.js` | All portfolio data: bio, experience, projects, sprint board, skills, links |
| `ascii.js` | ASCII canvas hero field, image develop effect, scramble text animation |
| `main.js` | Section builders, retro audio synth, vintage loader, mobile drawer, terminal |
| `netlify.toml` | Netlify headers, security policies, asset caching rules |
| `.github/workflows/deploy.yml` | GitHub Pages automated deployment workflow |
| `assets/` | Favicon (`favicon.svg`), OpenGraph card (`og.png`), project screenshots |

---

## 📝 Customizing Content

To update your work, bio, or links, open `content.js` and edit the values. See `CUSTOMIZE.md` for a complete prompt you can paste into any AI tool for subsequent updates.
