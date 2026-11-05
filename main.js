/* =====================================================================
   MAIN: turns content.js into the page and wires up interactions,
   vintage pixel loading screen, retro SFX, and mobile responsiveness.
   ===================================================================== */

(function () {
  "use strict";

  const S = window.SITE;
  const A = window.ASCII;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ============================ RETRO SFX ============================ */
  // 8-bit synthesized retro audio via Web Audio API (zero audio files needed)
  const RetroAudio = {
    ctx: null,
    enabled: localStorage.getItem("twsf_sfx") === "true",
    init() {
      if (!this.ctx && typeof AudioContext !== "undefined") {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    },
    toggle() {
      this.init();
      this.enabled = !this.enabled;
      localStorage.setItem("twsf_sfx", this.enabled);
      if (this.enabled) this.playSuccess();
      updateSfxButtons();
      return this.enabled;
    },
    playTone(freq, type = "square", dur = 0.04, gain = 0.04) {
      if (!this.enabled || A.reduceMotion) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        g.gain.setValueAtTime(gain, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
      } catch (e) {}
    },
    playBlip() { this.playTone(820, "square", 0.035, 0.035); },
    playKey() { this.playTone(550 + Math.random() * 250, "square", 0.02, 0.025); },
    playSuccess() {
      if (!this.enabled || A.reduceMotion) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        setTimeout(() => this.playTone(f, "triangle", 0.09, 0.05), i * 65);
      });
    },
    playBoot() {
      if (!this.enabled || A.reduceMotion) return;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((f, i) => {
        setTimeout(() => this.playTone(f, "square", 0.12, 0.04), i * 90);
      });
    }
  };

  function updateSfxButtons() {
    const txt = RetroAudio.enabled ? "SFX: ON" : "SFX: OFF";
    const sfxBtn = $("#sfx-toggle");
    const drawerSfxBtn = $("#drawer-sfx-toggle");
    if (sfxBtn) {
      sfxBtn.setAttribute("aria-pressed", RetroAudio.enabled);
      const label = sfxBtn.querySelector(".pixel-tool-label");
      if (label) label.textContent = txt;
    }
    if (drawerSfxBtn) drawerSfxBtn.textContent = txt;
  }

  // Ensure theme is always Amber phosphor
  document.documentElement.removeAttribute("data-theme");
  localStorage.removeItem("twsf_theme");

  /* ============================ CRT SCANLINES ============================ */
  let crtEnabled = localStorage.getItem("twsf_crt") !== "false";

  function applyCrt(on) {
    crtEnabled = on;
    localStorage.setItem("twsf_crt", on);
    const overlay = $("#crt-overlay");
    const crtBtn = $("#crt-toggle");
    const drawerCrt = $("#drawer-crt-toggle");
    if (overlay) overlay.classList.toggle("disabled", !on);
    const txt = on ? "CRT: ON" : "CRT: OFF";
    if (crtBtn) {
      crtBtn.setAttribute("aria-pressed", on);
      const lbl = crtBtn.querySelector(".pixel-tool-label");
      if (lbl) lbl.textContent = txt;
    }
    if (drawerCrt) drawerCrt.textContent = txt;
  }

  function toggleCrt() {
    RetroAudio.playBlip();
    applyCrt(!crtEnabled);
  }

  /* ---------- Tiny DOM Builder (Safe: never injects raw HTML) ---------- */
  function safeUrl(u) {
    const s = String(u || "").trim();
    return /^(https?:|mailto:|tel:|#|\.{0,2}\/|assets\/)/i.test(s) ? s : "#";
  }
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const k in props || {}) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "href" || k === "src") el.setAttribute(k, safeUrl(v));
      else if (k === "style") el.style.cssText = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
    return el;
  }
  const isExternal = (href) => /^https?:/i.test(href);
  const link = (l, cls) =>
    h("a", { class: cls, href: l.href, target: isExternal(l.href) ? "_blank" : null, rel: isExternal(l.href) ? "noopener" : null }, l.label);
  const mailto = () => "mailto:" + S.person.email;
  const monthName = (ym) => {
    if (!ym) return "now";
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en", { month: "short" }) + " " + y;
  };
  const toYears = (ym) => {
    if (!ym) { const d = new Date(); return d.getFullYear() + d.getMonth() / 12; }
    const [y, m] = ym.split("-").map(Number);
    return y + (m - 1) / 12;
  };
  function monoCell(el) {
    const fs = parseFloat(getComputedStyle(el).fontSize) || 14;
    return A.cellSize(fs).w;
  }

  /* ============================ VINTAGE PIXEL LOADER ============================ */
  function initLoader(forceRun = false) {
    const loader = $("#pixel-loader");
    if (!loader) return;

    const alreadyBooted = sessionStorage.getItem("twsf_booted") === "true";
    if (alreadyBooted && !forceRun) {
      loader.remove();
      return;
    }

    loader.classList.remove("done");
    loader.style.display = "flex";

    const logEl = $("#loader-log");
    const pctEl = $("#loader-pct");
    const fillEl = $("#loader-bar-fill");
    const blocksEl = $("#loader-blocks");
    const statusEl = $("#loader-status");
    const clockEl = $("#loader-clock");
    const skipBtn = $("#loader-skip");

    const bootMessages = [
      { text: "CPU: MOS 6502 @ 1.79MHz ... OK", pct: 15 },
      { text: "RAM CHECK: 640KB BASE OK ... OK", pct: 32 },
      { text: "MOUNTING TOWSIF KERNEL (DHAKA) ... OK", pct: 54 },
      { text: "LOADING SPRINT BOARDS & PRD ... OK", pct: 75 },
      { text: "FASTAPI & MYSQL MODULES ... ONLINE", pct: 90 },
      { text: "RETRO GRAPHICS ENGINE ... READY", pct: 100 },
    ];

    let timer = null;
    let step = 0;
    let finished = false;

    // Live clock in loader header
    const updateLoaderClock = () => {
      try {
        const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: S.person.timezone, hour: "2-digit", minute: "2-digit" });
        if (clockEl) clockEl.textContent = "DHAKA " + fmt.format(new Date());
      } catch (e) {
        if (clockEl) clockEl.textContent = "DHAKA 12:00";
      }
    };
    updateLoaderClock();

    function setProgress(p, statusText) {
      if (pctEl) pctEl.textContent = String(p).padStart(2, "0") + "%";
      if (fillEl) fillEl.style.width = p + "%";
      if (statusEl && statusText) statusEl.textContent = statusText;
      if (blocksEl) {
        const total = 20;
        const filled = Math.round((p / 100) * total);
        blocksEl.textContent = "[" + "█".repeat(filled) + "░".repeat(total - filled) + "]";
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      setProgress(100, "SYSTEM BOOT COMPLETE");
      RetroAudio.playBoot();
      sessionStorage.setItem("twsf_booted", "true");
      setTimeout(() => {
        loader.classList.add("done");
        setTimeout(() => {
          loader.style.display = "none";
        }, 360);
      }, 250);
      window.removeEventListener("keydown", onKey);
    }

    function nextStep() {
      if (finished) return;
      if (step < bootMessages.length) {
        const msg = bootMessages[step];
        RetroAudio.playKey();
        if (logEl) {
          const row = h("div", { class: "pixel-loader__line" },
            h("span", { class: "pixel-loader__line-prefix" }, ">"),
            h("span", { class: "pixel-loader__line-text" }, msg.text)
          );
          logEl.append(row);
        }
        setProgress(msg.pct, msg.text.split("...")[0].trim());
        step++;
        timer = setTimeout(nextStep, A.reduceMotion ? 50 : 220 + Math.random() * 80);
      } else {
        timer = setTimeout(finish, 300);
      }
    }

    const onKey = (e) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    if (skipBtn) skipBtn.addEventListener("click", finish);
    loader.addEventListener("click", (e) => {
      if (e.target !== skipBtn) finish();
    });

    if (A.reduceMotion) {
      finish();
    } else {
      timer = setTimeout(nextStep, 150);
    }
  }

  /* ============================ NAV ============================ */
  function renderNav() {
    document.title = S.meta.title;
    const mark = $('[data-slot="mark"]');
    mark.replaceChildren(
      h("span", { style: "color: var(--accent); margin-right: 4px;" }, "❖"),
      S.person.shortName,
      h("span", { class: "caret", "aria-hidden": "true" }, "_")
    );

    // Desktop nav links
    const navUl = $('[data-slot="nav"]');
    navUl.replaceChildren(...S.nav.map((l, i) => h("li", null,
      h("a", { href: l.href },
        h("span", { style: "color: var(--accent); font-size: 0.7em; margin-right: 4px; font-family: var(--font-pixel);" }, `0${i + 1}.`),
        l.label
      )
    )));

    // CTA
    const cta = $('[data-slot="nav-cta"]');
    cta.setAttribute("href", mailto());

    // Mobile Drawer Setup
    const drawerLinks = $("#drawer-links");
    if (drawerLinks) {
      drawerLinks.replaceChildren(...S.nav.map((l, i) => h("li", null,
        h("a", { href: l.href },
          h("span", null,
            h("span", { style: "color: var(--accent); margin-right: 8px;" }, `0${i + 1}`),
            l.label.toUpperCase()
          )
        )
      )));
    }

    const navToggle = $("#nav-toggle");
    const drawer = $("#mobile-drawer");
    const drawerClose = $("#drawer-close");

    const toggleDrawer = (open) => {
      const willOpen = open ?? !drawer.classList.contains("open");
      drawer.classList.toggle("open", willOpen);
      drawer.setAttribute("aria-hidden", !willOpen);
      if (navToggle) navToggle.setAttribute("aria-expanded", willOpen);
      RetroAudio.playBlip();
    };

    if (navToggle) navToggle.addEventListener("click", () => toggleDrawer());
    if (drawerClose) drawerClose.addEventListener("click", () => toggleDrawer(false));

    // Close drawer when any mobile nav link is clicked
    if (drawerLinks) {
      drawerLinks.addEventListener("click", (e) => {
        if (e.target.closest("a")) toggleDrawer(false);
      });
    }

    // Setup Nav Retro Tool buttons
    const sfxBtn = $("#sfx-toggle");
    if (sfxBtn) sfxBtn.addEventListener("click", () => RetroAudio.toggle());
    const drawerSfx = $("#drawer-sfx-toggle");
    if (drawerSfx) drawerSfx.addEventListener("click", () => RetroAudio.toggle());

    const crtBtn = $("#crt-toggle");
    if (crtBtn) crtBtn.addEventListener("click", toggleCrt);
    const drawerCrt = $("#drawer-crt-toggle");
    if (drawerCrt) drawerCrt.addEventListener("click", toggleCrt);

    const drawerReboot = $("#drawer-reboot");
    if (drawerReboot) {
      drawerReboot.addEventListener("click", () => {
        toggleDrawer(false);
        initLoader(true);
      });
    }

    applyCrt(crtEnabled);
    updateSfxButtons();
  }

  /* ============================ HERO ============================ */
  function renderHero() {
    $('[data-slot="hero-title"]').textContent = S.person.name;
    $('[data-slot="hero-line"]').textContent = S.hero.line;
    const actions = $('[data-slot="hero-actions"]');
    actions.replaceChildren(h("span", { class: "hero__actions-in" },
      h("a", { class: "btn", href: S.hero.primary.href }, S.hero.primary.label),
      h("a", { class: "btn btn--ghost", href: S.hero.secondary.href }, S.hero.secondary.label, h("span", { "aria-hidden": "true" }, " ↓")),
      S.person.cvUrl ? h("a", { class: "btn btn--ghost", href: S.person.cvUrl }, "Download CV") : null
    ));
    const meta = $('[data-slot="hero-meta"]');
    const row = (k, v) => h("div", { class: "meta__row" }, h("dt", null, k), h("dd", null, v));
    meta.replaceChildren(
      row("role", S.person.role),
      row("at", S.person.company),
      row("based", S.person.location),
      row("status", h("span", null, h("span", { class: "dot", "aria-hidden": "true" }), S.person.status))
    );
    A.heroField($(".hero__field"), S.person.asciiWord);
  }

  /* ============================ ABOUT ============================ */
  function renderAbout() {
    const a = S.about;
    const badge = h("div", { class: "pixel-badge" },
      h("span", { class: "pixel-badge__dot" }, "●"),
      "01_ABOUT.SYS // PROFILE"
    );
    $('[data-slot="about"]').replaceChildren(
      h("div", { class: "wrap about__grid" },
        h("div", null,
          badge,
          h("h2", { id: "about-title", class: "h2", "data-reveal": "", "data-scramble": "" }, a.heading)
        ),
        h("div", { class: "about__copy" },
          h("p", { class: "statement", "data-reveal": "" }, a.statement),
          h("p", { class: "body", "data-reveal": "" }, a.body)
        )
      ),
      h("ul", { class: "wrap facts" },
        a.facts.map((f, i) =>
          h("li", { class: "fact", "data-reveal": "", style: `--d:${i * 80}ms` },
            h("span", { class: "fact__value", "data-count": f.value, "data-suffix": f.suffix || "" }, "0" + (f.suffix || "")),
            h("span", { class: "fact__label" }, f.label)
          )
        )
      )
    );
  }

  /* ========================= EXPERIENCE ========================= */
  const jobs = [];
  function renderExperience() {
    const e = S.experience;
    const list = h("ol", { class: "jobs" });
    e.items.forEach((it, i) => {
      const track = h("pre", { class: "track", "aria-hidden": "true" });
      const li = h("li", { class: "job", "data-reveal": "", style: `--d:${i * 60}ms` },
        h("div", { class: "job__head" },
          h("h3", { class: "job__org" }, it.url ? link({ label: it.org, href: it.url }) : it.org),
          h("p", { class: "job__role" }, it.role),
          h("p", { class: "job__dates" }, monthName(it.from) + " – " + monthName(it.to), it.to ? null : h("span", { class: "live" }, "[LIVE]"))
        ),
        h("div", { class: "job__body" },
          track,
          h("ul", { class: "job__points" }, it.points.map((p) => h("li", null, p)))
        )
      );
      list.append(li);
      jobs.push({ el: li, track, from: toYears(it.from), to: toYears(it.to), current: !it.to, p: 0 });
    });

    const badge = h("div", { class: "pixel-badge" },
      h("span", { class: "pixel-badge__dot" }, "●"),
      "02_CAREER_GANTT.DAT // TIMELINE"
    );

    $('[data-slot="experience"]').replaceChildren(
      h("div", { class: "wrap" },
        badge,
        h("div", { class: "experience__top" },
          h("h2", { id: "experience-title", class: "h2", "data-reveal": "", "data-scramble": "" }, e.heading)
        ),
        list
      )
    );
  }
  function drawTracks() {
    if (!jobs.length) return;
    const e = S.experience;
    const span = e.axisTo - e.axisFrom;
    const cw = monoCell(jobs[0].track);
    const n = Math.max(16, Math.floor(jobs[0].track.clientWidth / cw));

    const vh = window.innerHeight;
    jobs.forEach((j) => {
      const r = j.el.getBoundingClientRect();
      const p = A.reduceMotion ? 1 : clamp((vh * 0.9 - r.top) / (vh * 0.45), 0, 1);
      const a = Math.round(((j.from - e.axisFrom) / span) * n);
      const b = Math.max(a + 1, Math.round(((Math.min(j.to, e.axisTo) - e.axisFrom) / span) * n));
      const filled = a + Math.round((b - a) * p);
      const before = "·".repeat(a);
      const bar = "█".repeat(filled - a);
      const rest = "░".repeat(b - filled);
      const after = "·".repeat(Math.max(0, n - b - (j.current ? 1 : 0)));
      j.track.replaceChildren(
        h("span", { class: "t-dim" }, before),
        h("span", { class: "t-bar" }, bar),
        h("span", { class: "t-rest" }, rest),
        j.current ? h("span", { class: p >= 1 ? "t-now" : "t-dim" }, p >= 1 ? "▶" : " ") : "",
        h("span", { class: "t-dim" }, after)
      );
    });
  }

  /* ============================ WORK ============================ */
  const developers = [];
  const artPanels = [];
  function renderWork() {
    const w = S.work;
    const badge = h("div", { class: "pixel-badge" },
      h("span", { class: "pixel-badge__dot" }, "●"),
      "03_SHIPPED_WORK.LOG // PORTFOLIO"
    );
    const root = h("div", { class: "wrap" },
      badge,
      h("h2", { id: "work-title", class: "h2 work__title", "data-reveal": "", "data-scramble": "" }, w.heading)
    );
    w.projects.forEach((p, idx) => {
      const text = h("div", { class: "project__text" },
        h("p", { class: "project__kind", "data-reveal": "" }, p.kind + " · " + p.year),
        h("h3", { class: "project__title", "data-reveal": "" }, p.title),
        h("p", { class: "project__summary", "data-reveal": "" }, p.summary),
        h("p", { class: "project__role", "data-reveal": "" }, p.role),
        h("p", { class: "project__stack", "data-reveal": "" }, p.stack.join("  /  ")),
        h("p", { class: "project__links", "data-reveal": "" }, p.links.map((l) => link(l, "arrow-link")))
      );
      let media;
      if (p.media.type === "image" || p.media.type === "images") {
        const fig = (im, cls) => h("figure", { class: cls },
          h("img", { src: im.src, alt: im.alt, loading: "lazy", decoding: "async", width: 1600, height: 1000 }));
        if (p.media.strip && p.media.strip.length > 0) {
          const main = fig(p.media.main, "shot shot--main");
          const strip = h("div", { class: "strip" }, p.media.strip.map((im) => fig(im, "shot")));
          media = h("div", { class: "project__media" }, main, strip);
          [main, ...strip.children].forEach((f) => developers.push(A.develop(f)));
        } else {
          const mainImg = p.media.main || p.media;
          const main = fig(mainImg, "shot shot--single");
          media = h("div", { class: "project__media" }, main);
          developers.push(A.develop(main));
        }
      } else {
        const pre = h("pre", { class: "art", "aria-hidden": "true" });
        pre.dataset.full = p.media.art;
        media = h("figure", { class: "project__media art-frame" },
          pre,
          h("figcaption", { class: "art__caption" },
            h("span", { style: "color: var(--accent); margin-right: 6px;" }, "▶"),
            p.media.caption
          )
        );
        artPanels.push({ el: media, pre, lines: p.media.art.split("\n"), shown: -1 });
      }
      const cls = "project" + (idx === 0 ? " project--feature" : idx % 2 ? " project--left" : " project--right");
      root.append(h("article", { class: cls }, media, text));
    });
    $('[data-slot="work"]').replaceChildren(root);
  }
  function drawArt() {
    const vh = window.innerHeight;
    artPanels.forEach((a) => {
      const r = a.el.getBoundingClientRect();
      const p = A.reduceMotion ? 1 : clamp((vh * 0.92 - r.top) / (vh * 0.55), 0, 1);
      const n = Math.round(p * a.lines.length);
      if (n === a.shown) return;
      a.shown = n;
      const out = a.lines.map((line, i) => {
        if (i < n) return line;
        if (i === n && p > 0) return line.replace(/[^\s]/g, (c) => (Math.random() < 0.5 ? A.NOISE[(Math.random() * A.NOISE.length) | 0] : c));
        return line.replace(/[^\s]/g, " ");
      });
      a.pre.textContent = out.join("\n");
    });
  }

  /* ============================ PROCESS ============================ */
  const board = { stage: 0, x: null, target: 0, anim: 0 };
  function renderProcess() {
    const P = S.process;
    const sec = $('[data-slot="process"]');
    sec.style.setProperty("--stages", P.stages.length);
    const badge = h("div", { class: "pixel-badge" },
      h("span", { class: "pixel-badge__dot" }, "●"),
      "04_SPRINT_PIPELINE.KANBAN // WORKFLOW"
    );
    const mobileStepper = h("div", { class: "mobile-stage-stepper", id: "mobile-stage-stepper" },
      "STAGE [01/05] // BACKLOG"
    );
    const meter = h("p", { class: "stage__meter", "aria-hidden": "true" });
    const stageTitle = h("h3", { class: "stage__title" });
    const stageText = h("p", { class: "stage__text" });
    const pre = h("pre", { class: "board", "aria-hidden": "true" });
    const boardContainer = h("div", { class: "board-container", id: "board-container", title: "Click any column to jump to that stage" }, mobileStepper, pre);
    const srList = h("ol", { class: "sr-only" }, P.stages.map((s, i) => h("li", null, P.columns[i] + ": " + s.title + ". " + s.text)));

    sec.replaceChildren(
      h("div", { class: "process__track" },
        h("div", { class: "process__stick" },
          h("div", { class: "wrap process__inner" },
            h("div", { class: "process__head" },
              badge,
              h("h2", { id: "process-title", class: "h2", "data-reveal": "", "data-scramble": "" }, P.heading),
              h("p", { class: "process__intro", "data-reveal": "" }, P.intro)
            ),
            h("div", { class: "process__grid" },
              boardContainer,
              h("div", { class: "stage", "aria-hidden": "true" }, meter, stageTitle, stageText)
            )
          )
        )
      ),
      srList
    );

    // Clicking a column on the sprint board smoothly scrolls to that stage
    boardContainer.addEventListener("click", (e) => {
      const rect = pre.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const nCols = P.columns.length;
      const colWidth = rect.width / nCols;
      const targetCol = clamp(Math.floor(clickX / Math.max(1, colWidth)), 0, nCols - 1);
      const trackRect = board.track.getBoundingClientRect();
      const trackTop = trackRect.top + window.scrollY;
      const total = trackRect.height - window.innerHeight;
      const navH = 68;
      const targetScroll = trackTop - navH + (targetCol / (nCols - 1)) * total;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    });

    Object.assign(board, { sec, pre, meter, stageTitle, stageText, boardContainer, mobileStepper, track: $(".process__track", sec) });
    setStage(0, true);
  }
  function setStage(i, instant) {
    const P = S.process;
    board.stage = i;
    board.target = i;
    board.meter.textContent = P.columns[i].toLowerCase() + "  " + "■".repeat(i + 1) + "□".repeat(P.stages.length - i - 1);
    board.stageTitle.textContent = P.stages[i].title;
    board.stageText.textContent = P.stages[i].text;
    if (board.mobileStepper) {
      board.mobileStepper.textContent = `STAGE [0${i + 1}/0${P.stages.length}] // ${P.columns[i].toUpperCase()}`;
    }
    if (!instant) {
      RetroAudio.playBlip();
      A.scramble(board.stageTitle, 400);
      board.stageText.classList.remove("swap");
      void board.stageText.offsetWidth;
      board.stageText.classList.add("swap");
    }
    board.x = i;
    drawBoard();
  }
  function drawBoard() {
    const P = S.process;
    const pre = board.pre;
    const cw = monoCell(pre);
    const nCols = P.columns.length;
    const gap = 1;

    // Responsive column width: ensure minimum readable width even on phones
    const availableW = Math.max(30, Math.floor(pre.clientWidth / cw));
    const minColW = window.innerWidth < 768 ? 14 : 10;
    const colW = Math.max(minColW, Math.floor((availableW - gap * (nCols - 1)) / nCols));
    const W = colW * nCols + gap * (nCols - 1);

    const lineH = parseFloat(getComputedStyle(pre).lineHeight) || 16;
    const isMobile = window.innerWidth < 768;
    const H = clamp(Math.floor((window.innerHeight * (isMobile ? 0.28 : 0.46)) / lineH), 12, 26);
    const grid = Array.from({ length: H }, () => Array(W).fill(" "));
    const tone = Array.from({ length: H }, () => Array(W).fill(0));

    const put = (x, y, s, t) => {
      for (let k = 0; k < s.length; k++) {
        const xx = x + k;
        if (y >= 0 && y < H && xx >= 0 && xx < W) { grid[y][xx] = s[k]; tone[y][xx] = t; }
      }
    };
    const box = (x, y, w, hgt, t) => {
      put(x, y, "┌" + "─".repeat(w - 2) + "┐", t);
      for (let r = 1; r < hgt - 1; r++) { put(x, y + r, "│", t); put(x + w - 1, y + r, "│", t); }
      put(x, y + hgt - 1, "└" + "─".repeat(w - 2) + "┘", t);
    };
    const fit = (s, n) => (s.length > n ? s.slice(0, Math.max(0, n - 1)) + "…" : s);
    const wrap = (s, n) => {
      const words = s.split(" "), out = [];
      let line = "";
      words.forEach((w) => {
        if ((line + " " + w).trim().length > n) { if (line) out.push(line); line = w; } else line = (line + " " + w).trim();
      });
      if (line) out.push(line);
      return out.map((l) => fit(l, n));
    };
    const colX = (c) => c * (colW + gap);
    const ticketTop = 3;
    const inner = colW - 4;
    const tLines = inner >= 10 ? [P.ticket.id, ...wrap(P.ticket.title, inner).slice(0, 2), P.ticket.owner] : [P.ticket.id];
    const tH = tLines.length + 3;

    P.columns.forEach((name, c) => {
      const x = colX(c);
      const active = c === board.target;
      box(x, 0, colW, H, active ? 1 : 0);
      put(x + 2, 0, " " + fit(name, colW - 6) + " ", active ? 2 : 1);
      put(x + colW - 4, 0, " " + ((P.otherTickets[c] || []).length + (c === board.target ? 1 : 0)) + " ", 0);
      (P.otherTickets[c] || []).forEach((t, k) => {
        const y = ticketTop + tH + 1 + k * 4;
        if (y + 3 > H - 1) return;
        box(x + 1, y, colW - 2, 3, 0);
        put(x + 2, y + 1, fit(inner >= 10 ? t : t.split(" ")[0], colW - 4), 0);
      });
    });

    const tx = Math.round(colX(0) + (colX(1) - colX(0)) * board.x) + 1;
    box(tx, ticketTop, colW - 2, tH, 2);
    tLines.forEach((l, k) => put(tx + 1, ticketTop + 1 + k, " " + fit(l, colW - 5), k === 0 ? 2 : 1));
    const prog = Math.round(board.x);
    const bar = "■".repeat(prog + 1) + "□".repeat(nCols - prog - 1);
    put(tx + 2, ticketTop + tH - 2, fit(bar, colW - 5), 2);

    const frag = document.createDocumentFragment();
    const cls = ["b-dim", "b-ink", "b-acc"];
    for (let y = 0; y < H; y++) {
      let run = "", t = tone[y][0];
      for (let x = 0; x < W; x++) {
        if (tone[y][x] !== t) { frag.append(h("span", { class: cls[t] }, run)); run = ""; t = tone[y][x]; }
        run += grid[y][x];
      }
      frag.append(h("span", { class: cls[t] }, run + (y < H - 1 ? "\n" : "")));
    }
    pre.replaceChildren(frag);

    // Auto-scroll board horizontally on phones so active stage stays in center
    if (board.boardContainer && window.innerWidth < 768) {
      const activeColCenter = tx * cw + (colW * cw) / 2;
      const targetScroll = Math.max(0, activeColCenter - board.boardContainer.clientWidth / 2);
      board.boardContainer.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }
  function updateProcess() {
    const P = S.process;
    if (!board.track) return;
    const r = board.track.getBoundingClientRect();
    const navH = 68;
    const total = r.height - window.innerHeight;
    const p = clamp((-r.top + navH) / Math.max(1, total), 0, 1);

    const nStages = P.stages.length;
    const targetX = p * (nStages - 1);
    const activeStage = clamp(Math.round(targetX), 0, nStages - 1);

    if (activeStage !== board.stage) {
      board.stage = activeStage;
      board.target = activeStage;
      board.meter.textContent = P.columns[activeStage].toLowerCase() + "  " + "■".repeat(activeStage + 1) + "□".repeat(nStages - activeStage - 1);
      board.stageTitle.textContent = P.stages[activeStage].title;
      board.stageText.textContent = P.stages[activeStage].text;
      if (board.mobileStepper) {
        board.mobileStepper.textContent = `STAGE [0${activeStage + 1}/0${nStages}] // ${P.columns[activeStage].toUpperCase()}`;
      }
      RetroAudio.playBlip();
      A.scramble(board.stageTitle, 400);
      board.stageText.classList.remove("swap");
      void board.stageText.offsetWidth;
      board.stageText.classList.add("swap");
    }

    if (board.x !== targetX) {
      board.x = targetX;
      drawBoard();
    }
  }

  /* ============================ TOOLKIT ============================ */
  const sql = { started: false };
  function renderToolkit() {
    const T = S.toolkit;
    const badge = h("div", { class: "pixel-badge" },
      h("span", { class: "pixel-badge__dot" }, "●"),
      "05_TOOLKIT_SCHEMA.SQL // STACK"
    );
    const pre = h("pre", { class: "sql", "aria-hidden": "true" });
    const table = h("table", { class: "sr-only" },
      h("caption", null, "Skills and tools"),
      h("thead", null, h("tr", null, h("th", { scope: "col" }, "Skill"), h("th", { scope: "col" }, "Area"), h("th", { scope: "col" }, "Used for"))),
      h("tbody", null, T.rows.map((r) => h("tr", null, h("td", null, r.skill), h("td", null, r.area), h("td", null, r.used_for))))
    );
    const certs = h("div", { class: "certs", "data-reveal": "" },
      h("h3", { class: "certs__title" }, T.certificationsHeading),
      h("ul", null, T.certifications.map((c) =>
        h("li", { class: "cert" },
          h("p", { class: "cert__name" }, c.name),
          h("p", { class: "cert__meta" }, c.issuer + " · " + c.year)
        )
      ))
    );
    $('[data-slot="toolkit"]').replaceChildren(
      h("div", { class: "wrap" },
        badge,
        h("h2", { id: "toolkit-title", class: "h2", "data-reveal": "", "data-scramble": "" }, T.heading),
        h("div", { class: "toolkit__grid" }, h("div", { class: "sql-frame", "data-reveal": "" }, pre, table), certs)
      )
    );
    sql.pre = pre;
  }
  function sqlLines() {
    const T = S.toolkit;
    const cols = ["skill", "area", "used_for"];
    const wd = cols.map((c) => Math.max(c.length, ...T.rows.map((r) => String(r[c]).length)));
    const total = wd.reduce((a, b) => a + b + 3, 1);
    const avail = Math.floor(sql.pre.clientWidth / monoCell(sql.pre));
    const lines = [];
    if (total <= avail) {
      const sep = "+" + wd.map((w) => "-".repeat(w + 2)).join("+") + "+";
      const row = (vals) => "| " + vals.map((v, i) => String(v).padEnd(wd[i])).join(" | ") + " |";
      lines.push(sep, row(cols), sep, ...T.rows.map((r) => row(cols.map((c) => r[c]))), sep);
    } else {
      const kw = Math.max(...cols.map((c) => c.length));
      T.rows.forEach((r, i) => {
        lines.push("*".repeat(Math.max(3, Math.min(avail, 24) - 8)) + " " + (i + 1) + ". row");
        cols.forEach((c) => lines.push(c.padStart(kw) + ": " + r[c]));
      });
    }
    lines.push(T.rows.length + " rows in set (0.00 sec)");
    return lines;
  }
  function runSql() {
    if (sql.started) return;
    sql.started = true;
    const T = S.toolkit;
    const prompt = "mysql> ";
    const lines = sqlLines();
    const promptEl = h("span", { class: "sql__prompt" }, prompt);
    const typed = h("span", { class: "sql__query" });
    const caret = h("span", { class: "caret" }, "▌");
    const body = h("span", { class: "sql__body" });
    sql.pre.replaceChildren(promptEl, typed, caret, "\n", body);
    if (A.reduceMotion) { typed.textContent = T.query; caret.remove(); body.textContent = "\n" + lines.join("\n"); return; }
    let i = 0;
    const type = () => {
      typed.textContent = T.query.slice(0, ++i);
      RetroAudio.playKey();
      if (i < T.query.length) setTimeout(type, 26 + Math.random() * 35);
      else { caret.remove(); setTimeout(printRows, 240); }
    };
    let k = 0;
    const printRows = () => {
      body.textContent = "\n" + lines.slice(0, ++k).join("\n");
      RetroAudio.playKey();
      if (k < lines.length) setTimeout(printRows, 40);
    };
    type();
  }

  /* ============================ CONTACT & TERMINAL ============================ */
  function renderContact() {
    const C = S.contact;
    const badge = h("div", { class: "pixel-badge" },
      h("span", { class: "pixel-badge__dot" }, "●"),
      "06_TERMINAL_NODE.SH // CONNECT"
    );
    const out = h("div", { class: "term__out", role: "log", "aria-live": "polite" });
    const input = h("input", {
      id: "term-in",
      class: "term__in",
      type: "text",
      autocomplete: "off",
      spellcheck: "false",
      autocapitalize: "off",
      placeholder: "type help, whoami, skills..."
    });
    const promptText = S.person.shortName + "@dhaka:~$";

    const commands = {
      help: () => [
        "Commands: whoami, work, experience, skills, contact" + (S.person.cvUrl ? ", cv" : "") + ", date, sfx, crt, reboot, clear"
      ],
      whoami: () => [S.person.name + ". " + S.person.role + " at " + S.person.company + ", " + S.person.location + "."],
      work: () => S.work.projects.map((p) => "· " + p.title + " (" + p.kind + ", " + p.year + ")"),
      experience: () => S.experience.items.map((e) => "· " + e.role + ", " + e.org + "  " + monthName(e.from) + " – " + monthName(e.to)),
      skills: () => [S.toolkit.rows.map((r) => r.skill).join(", ")],
      contact: () => [
        h("span", null, "email  ", h("a", { href: mailto() }, S.person.email)),
        ...C.links.map((l) => h("span", null, l.label.toLowerCase().padEnd(7), link({ label: l.href.replace(/^https?:\/\/(www\.)?/, ""), href: l.href })))
      ],
      cv: () => (S.person.cvUrl ? [h("a", { href: S.person.cvUrl }, "Open CV")] : ["No CV link currently set in content.js."]),
      date: () => [new Date().toLocaleString("en-GB", { timeZone: S.person.timezone, dateStyle: "full", timeStyle: "short" }) + " in Dhaka"],
      sfx: () => {
        const on = RetroAudio.toggle();
        return ["Audio effects toggled " + (on ? "ON" : "OFF")];
      },
      crt: () => {
        toggleCrt();
        return ["CRT scanlines " + (crtEnabled ? "ENABLED" : "DISABLED")];
      },
      reboot: () => {
        setTimeout(() => initLoader(true), 300);
        return ["Restarting TOWSIF-OS ROM BIOS..."];
      },
      sudo: () => ["Permission denied: user is not in the sudoers file. Direct email works though: " + S.person.email],
      clear: () => { out.replaceChildren(); return []; },
    };

    function run(raw) {
      const parts = raw.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts[1] ? parts[1].toLowerCase() : "";
      if (!cmd) return;
      RetroAudio.playBlip();
      out.append(h("p", { class: "term__echo" }, h("span", { class: "term__ps" }, promptText + " "), raw));
      const fn = commands[cmd];
      const res = fn ? fn(arg) : ["command not found: " + cmd + ". Type 'help' for available commands."];
      res.forEach((r) => out.append(h("p", { class: "term__line" }, r)));
      out.scrollTop = out.scrollHeight;
    }

    const form = h("form", { class: "term__form", onsubmit: (e) => { e.preventDefault(); run(input.value); input.value = ""; } },
      h("label", { for: "term-in", class: "term__ps" }, promptText), input);

    const chips = h("div", { class: "term__chips", role: "group", "aria-label": "Quick commands" },
      ["whoami", "work", "skills", "contact", "reboot"].map((c) =>
        h("button", { type: "button", class: "chip", onclick: () => { RetroAudio.playBlip(); run(c); } }, c)
      )
    );

    const copyBtn = h("button", { type: "button", class: "btn btn--ghost copy" }, "Copy email");
    copyBtn.addEventListener("click", async () => {
      RetroAudio.playBlip();
      try {
        await navigator.clipboard.writeText(S.person.email);
        copyBtn.textContent = "Copied ✓";
        RetroAudio.playSuccess();
      } catch (e) {
        copyBtn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => (copyBtn.textContent = "Copy email"), 1800);
    });

    const termBar = h("div", { class: "term__bar", "aria-hidden": "true" },
      h("span", null, `── [${S.person.shortName}@dhaka:~] ── zsh ── 80×24`),
      h("div", { class: "term__bar-dots" }, h("span", null), h("span", null), h("span", null))
    );

    $('[data-slot="contact"]').replaceChildren(
      h("div", { class: "wrap contact__grid" },
        h("div", { class: "contact__copy" },
          badge,
          h("h2", { id: "contact-title", class: "h2", "data-reveal": "", "data-scramble": "" }, C.heading),
          h("p", { class: "contact__line", "data-reveal": "" }, C.line),
          h("p", { class: "contact__email", "data-reveal": "" }, h("a", { href: mailto() }, S.person.email)),
          h("div", { class: "contact__actions", "data-reveal": "" },
            h("a", { class: "btn", href: mailto() }, "Email me"),
            copyBtn,
            C.links.map((l) => link(l, "btn btn--ghost"))
          )
        ),
        h("div", { class: "term", "data-reveal": "" },
          termBar,
          out, form, chips
        )
      )
    );
    run("whoami");
  }

  /* ============================ FOOTER ============================ */
  function typeFooterName(el, text) {
    const caret = h("span", { class: "footer__caret" }, "_");
    if (A.reduceMotion) {
      el.replaceChildren(text, caret);
      return;
    }
    el.replaceChildren("", caret);
    let i = 0;
    const step = () => {
      i++;
      el.textContent = text.slice(0, i);
      el.append(caret);
      RetroAudio.playKey();
      if (i < text.length) {
        setTimeout(step, 120 + Math.random() * 60);
      }
    };
    setTimeout(step, 180);
  }

  function renderFooter() {
    const year = new Date().getFullYear();
    const rebootBtn = h("button", {
      type: "button",
      class: "pixel-tool-btn",
      onclick: () => initLoader(true),
      title: "Replay Vintage Loading Sequence"
    }, "[REBOOT BIOS]");

    const nameP = h("p", { class: "footer__name", "data-reveal": "", "aria-hidden": "true" },
      S.person.shortName,
      h("span", { class: "footer__caret" }, "_")
    );

    $('[data-slot="footer"]').replaceChildren(
      h("div", { class: "wrap" },
        nameP,
        h("div", { class: "footer__row" },
          h("p", null, "© " + year + " " + S.person.name),
          h("div", { class: "footer__tools" },
            rebootBtn,
            h("a", { href: "#top", class: "arrow-link" }, "Back to top")
          )
        )
      )
    );
  }

  /* ============================ SHARED & TIMERS ============================ */
  function clocks() {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: S.person.timezone, hour: "2-digit", minute: "2-digit" });
    const tick = () => $$("[data-clock]").forEach((c) => (c.textContent = fmt.format(new Date()) + " GMT+6"));
    tick();
    setInterval(tick, 20000);
  }

  function countUp(el) {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || "";
    if (A.reduceMotion) { el.textContent = end + suffix; return; }
    const t0 = performance.now(), dur = 1200;
    const step = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = (p < 1 && Math.random() < 0.25 ? A.NOISE[(Math.random() * 6) | 0] : v) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = end + suffix;
    };
    requestAnimationFrame(step);
  }

  function reveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add("in");
        if (el.hasAttribute("data-scramble")) A.scramble(el);
        if (el.classList.contains("footer__name")) typeFooterName(el, S.person.shortName);
        el.querySelectorAll("[data-count]").forEach(countUp);
        if (el.classList.contains("sql-frame")) runSql();
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    const pending = [...document.querySelectorAll("[data-reveal]")];
    pending.forEach((el) => io.observe(el));
    return () => {
      for (const el of pending) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().bottom < 0) {
          el.classList.add("in");
          if (el.classList.contains("footer__name")) typeFooterName(el, S.person.shortName);
          el.querySelectorAll("[data-count]").forEach(countUp);
          if (el.classList.contains("sql-frame")) runSql();
          io.unobserve(el);
        }
      }
    };
  }

  function progressBar() {
    const el = $('[data-slot="progress"]');
    const nav = $("#nav");
    return () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = clamp(window.scrollY / Math.max(1, max), 0, 1);
      const n = 12, f = Math.round(p * n);
      if (el) el.textContent = "[" + "█".repeat(f) + "░".repeat(n - f) + "] " + String(Math.round(p * 100)).padStart(3, " ") + "%";
      if (nav) nav.classList.toggle("nav--solid", window.scrollY > 40);
    };
  }

  function onScrollFrame(fns) {
    let queued = false;
    const run = () => { queued = false; fns.forEach((f) => f()); };
    const q = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
    window.addEventListener("scroll", q, { passive: true });
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (sql.started) { sql.started = false; runSql(); }
        drawBoard();
        run();
      }, 160);
    });
    run();
  }

  /* Global Click Sound Delegator */
  document.addEventListener("click", (e) => {
    if (e.target.closest("button, .btn, .chip, .arrow-link, .nav__links a, .nav__mark")) {
      RetroAudio.playBlip();
    }
  }, { passive: true });

  /* ============================ BOOT ============================ */
  function boot() {
    renderNav();
    renderHero();
    renderAbout();
    renderExperience();
    renderWork();
    renderProcess();
    renderToolkit();
    renderContact();
    renderFooter();
    clocks();
    initLoader(false);

    const catchUp = reveals();
    onScrollFrame([
      catchUp,
      progressBar(),
      drawTracks,
      drawArt,
      updateProcess,
      () => developers.forEach((d) => { d.update(); d.render(); }),
    ]);
  }

  // Load fonts then boot
  if (document.fonts && document.fonts.load) {
    const wait = Promise.all([
      document.fonts.load('500 16px "JetBrains Mono"', "█─"),
      document.fonts.load('700 16px "Geist"'),
      document.fonts.load('400 14px "Silkscreen"'),
    ]);
    const timeout = new Promise((r) => setTimeout(r, 2000));
    Promise.race([wait, timeout]).catch(() => {}).then(boot);
  } else {
    boot();
  }
})();
