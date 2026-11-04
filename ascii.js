/* =====================================================================
   ASCII ENGINE: the hero field and the "develop" effect on images.
   You should not need to edit this file to change content.
   Colours come from theme.css; the hero word comes from content.js.
   ===================================================================== */

(function () {
  "use strict";

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("still");
  const RAMP = " .,:-=+*#%@";          // light to dark
  const NOISE = "!<>-_\\/[]{}=+*^?#%&$";  // used while things scramble

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (s) => s[(Math.random() * s.length) | 0];

  // Size of one monospace cell at a given font size.
  function cellSize(fontPx) {
    const c = document.createElement("canvas").getContext("2d");
    c.font = `500 ${fontPx}px ${css("--font-mono")}`;
    return { w: c.measureText("M").width, h: Math.round(fontPx * 1.18) };
  }

  function setupCanvas(canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* ------------------------------------------------------------------
     HERO FIELD
     A drifting field of characters. The hero word assembles out of the
     noise on load, reacts to the pointer, and breaks apart on scroll.
     ------------------------------------------------------------------ */
  function heroField(canvas, word) {
    const host = canvas.parentElement;
    let ctx, cols, rows, cell, mask, seed, settleAt, W, H;
    let pointer = { x: -999, y: -999, live: 0 };
    let scrollP = 0;
    let running = false, visible = true, raf = 0, last = 0;
    const start = performance.now();

    function build() {
      W = host.clientWidth;
      H = host.clientHeight;
      if (!W || !H) return;
      const fontPx = W < 600 ? 8 : W < 1100 ? 11 : 13;
      cell = cellSize(fontPx);
      ctx = setupCanvas(canvas, W, H);
      ctx.font = `500 ${fontPx}px ${css("--font-mono")}`;
      ctx.textBaseline = "top";
      cols = Math.ceil(W / cell.w);
      rows = Math.ceil(H / cell.h);

      // Render the word into a tiny offscreen canvas, one pixel per cell.
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d");
      const phone = W < 700;
      const band = phone ? { top: 0.1, h: 0.3 } : { top: 0.12, h: 0.42 };
      let size = rows * band.h * (cell.h / cell.w); // cells are taller than wide
      o.font = `700 ${size}px ${css("--font-display")}`;
      const fit = (cols * 0.92) / o.measureText(word).width;
      if (fit < 1) size *= fit;
      o.font = `700 ${size}px ${css("--font-display")}`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.save();
      o.translate(cols / 2, rows * (band.top + band.h / 2));
      o.scale(1, cell.w / cell.h); // squash so letters look right in tall cells
      o.fillText(word, 0, 0);
      o.restore();
      const px = o.getImageData(0, 0, cols, rows).data;

      mask = new Float32Array(cols * rows);
      seed = new Float32Array(cols * rows);
      settleAt = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        mask[i] = px[i * 4 + 3] / 255;
        seed[i] = Math.random();
        const x = i % cols;
        settleAt[i] = 250 + (x / cols) * 700 + Math.random() * 600;
      }
      draw(reduceMotion ? 1e6 : performance.now() - start);
    }

    function draw(t) {
      if (!mask) return;
      const ink = css("--ink"), ink3 = css("--ink-3"), accent = css("--accent");
      ctx.clearRect(0, 0, W, H);
      const time = t / 1000;
      const px = pointer.x / cell.w, py = pointer.y / cell.h;
      const lens = (W < 700 ? 7 : 11) * pointer.live;
      const buckets = { faint: [], ink: [], accent: [] };

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const m = mask[i];
          const s = seed[i];
          // Slow interference pattern for the background texture.
          const n =
            (Math.sin(x * 0.07 + time * 0.5) +
              Math.sin(y * 0.11 - time * 0.35) +
              Math.sin((x + y * 1.6) * 0.035 + time * 0.25)) / 3;
          const dx = x - px, dy = (y - py) * (cell.h / cell.w);
          const d = Math.sqrt(dx * dx + dy * dy);
          const inLens = lens > 0 && d < lens;

          // Scroll breaks the word apart from the edges inward.
          const broken = scrollP * 1.4 > s + 0.1;

          if (m > 0.35 && !broken) {
            const settled = t > settleAt[i];
            let ch, b;
            if (!settled) { ch = rand(NOISE); b = "faint"; }
            else if (inLens) { ch = rand(NOISE); b = "accent"; }
            else {
              const k = clamp(Math.floor((0.55 + m * 0.45) * (RAMP.length - 1)), 0, RAMP.length - 1);
              ch = s < 0.02 && !reduceMotion ? rand(NOISE) : RAMP[k];
              b = "ink";
            }
            buckets[b].push(ch, x, y);
          } else {
            const v = n * 0.5 + 0.5;
            const thr = W < 700 ? 0.7 : 0.62;
            if (inLens && d < lens * 0.8) {
              const k = clamp(Math.floor((1 - d / lens) * (RAMP.length - 1)), 1, RAMP.length - 1);
              buckets.accent.push(RAMP[k], x, y);
            } else if (v > thr) {
              const k = clamp(Math.floor(((v - thr) / (1 - thr)) * 5) + 1, 1, 5);
              buckets.faint.push(RAMP[k], x, y);
            }
          }
        }
      }
      const paint = (list, color) => {
        ctx.fillStyle = color;
        for (let j = 0; j < list.length; j += 3) ctx.fillText(list[j], list[j + 1] * cell.w, list[j + 2] * cell.h);
      };
      paint(buckets.faint, ink3);
      paint(buckets.ink, ink);
      paint(buckets.accent, accent);
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // about 30 frames a second is plenty for text
      last = now;
      pointer.live += ((pointer.on ? 1 : 0) - pointer.live) * 0.15;
      draw(now - start);
    }
    function play() { if (!running && visible && !reduceMotion) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : pointer.x);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : pointer.y);
      pointer.x = clientX - r.left;
      pointer.y = clientY - r.top;
      pointer.on = true;
    };
    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerdown", onPointer, { passive: true });
    host.addEventListener("pointerleave", () => { pointer.on = false; });
    host.addEventListener("pointerup", () => { pointer.on = false; });
    host.addEventListener("pointercancel", () => { pointer.on = false; });

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : stop(); }).observe(host);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    window.addEventListener("scroll", () => {
      scrollP = clamp(window.scrollY / (host.clientHeight * 0.9), 0, 1);
      if (reduceMotion) draw(1e6);
    }, { passive: true });

    build();
    play();
  }

  /* ------------------------------------------------------------------
     DEVELOP
     An image starts as ASCII of itself and resolves into the real
     picture, cell by cell, as it scrolls toward the middle of the
     screen. Hovering a developed image turns the area under the
     pointer back into characters.
     ------------------------------------------------------------------ */
  function develop(figure) {
    const img = figure.querySelector("img");
    const canvas = document.createElement("canvas");
    canvas.className = "develop__layer";
    canvas.setAttribute("aria-hidden", "true");
    figure.appendChild(canvas);
    figure.classList.add("develop");

    let ctx, cols, rows, cell, lum, order, W, H, fontPx;
    let progress = reduceMotion ? 1 : 0, pointer = null, ready = false, dirty = true;

    function sample() {
      W = figure.clientWidth;
      H = figure.clientHeight;
      if (!W || !H) return;
      fontPx = W < 500 ? 7 : 9;
      cell = cellSize(fontPx);
      ctx = setupCanvas(canvas, W, H);
      ctx.font = `500 ${fontPx}px ${css("--font-mono")}`;
      ctx.textBaseline = "top";
      cols = Math.ceil(W / cell.w);
      rows = Math.ceil(H / cell.h);
      lum = new Float32Array(cols * rows);
      try {
        const off = document.createElement("canvas");
        off.width = cols; off.height = rows;
        const o = off.getContext("2d");
        o.drawImage(img, 0, 0, cols, rows);
        const d = o.getImageData(0, 0, cols, rows).data;
        for (let i = 0; i < cols * rows; i++) lum[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255;
      } catch (err) {
        // Opened from the file system: the browser will not let us read pixels.
        // Fall back to a soft pattern; the effect still works.
        for (let i = 0; i < cols * rows; i++) lum[i] = 0.35 + 0.3 * Math.sin(i * 0.37);
      }
      // Reveal order: mostly top-left to bottom-right, with grain.
      order = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const x = i % cols, y = (i / cols) | 0;
        order[i] = (x / cols) * 0.45 + (y / rows) * 0.35 + Math.random() * 0.2;
      }
      ready = true;
      dirty = true;
    }

    function render() {
      if (!ready || !dirty) return;
      dirty = false;
      const bg = css("--bg"), ink = css("--ink"), ink3 = css("--ink-3"), accent = css("--accent");
      ctx.clearRect(0, 0, W, H);
      const lens = W < 500 ? 5 : 8;
      const pc = pointer ? pointer.x / cell.w : -99, pr = pointer ? pointer.y / cell.h : -99;
      const p = progress * 1.15 - 0.05;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const dx = x - pc, dy = (y - pr) * (cell.h / cell.w);
          const d = Math.sqrt(dx * dx + dy * dy);
          const hovered = d < lens;
          if (order[i] < p && !hovered) continue; // developed: let the photo show
          ctx.fillStyle = bg;
          ctx.fillRect(x * cell.w, y * cell.h, cell.w + 0.5, cell.h + 0.5);
          const L = lum[i];
          const k = clamp(Math.round(L * (RAMP.length - 1)), 0, RAMP.length - 1);
          const edge = order[i] - p < 0.06;
          ctx.fillStyle = hovered || edge ? accent : L > 0.5 ? ink : ink3;
          ctx.fillText(hovered && Math.random() < 0.3 ? rand(NOISE) : RAMP[Math.max(k, 1)], x * cell.w, y * cell.h);
        }
      }
    }

    function update() {
      if (reduceMotion) return;
      const r = figure.getBoundingClientRect();
      const vh = window.innerHeight;
      const next = clamp((vh * 0.95 - r.top) / (vh * 0.65), 0, 1);
      if (Math.abs(next - progress) > 0.002) { progress = next; dirty = true; }
    }

    const onFigPointer = (e) => {
      if (progress < 0.98) return;
      const r = figure.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      dirty = true;
      requestAnimationFrame(render);
    };
    figure.addEventListener("pointermove", onFigPointer, { passive: true });
    figure.addEventListener("pointerdown", onFigPointer, { passive: true });
    figure.addEventListener("pointerleave", () => { pointer = null; dirty = true; requestAnimationFrame(render); });
    figure.addEventListener("pointerup", () => { pointer = null; dirty = true; requestAnimationFrame(render); });

    const go = () => { sample(); update(); render(); };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener("load", go, { once: true });
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(go, 150); });

    return { update, render };
  }

  /* ------------------------------------------------------------------
     SCRAMBLE
     Text decodes from noise into its real value. Used on headings.
     ------------------------------------------------------------------ */
  function scramble(el, duration = 900) {
    const final = el.textContent;
    if (reduceMotion) return;
    el.setAttribute("aria-label", final);
    const t0 = performance.now();
    function frame(now) {
      const p = clamp((now - t0) / duration, 0, 1);
      let out = "";
      for (let i = 0; i < final.length; i++) {
        const c = final[i];
        out += c === " " || i / final.length < p * 1.2 - 0.2 ? c : rand(NOISE);
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else { el.textContent = final; el.removeAttribute("aria-label"); }
    }
    requestAnimationFrame(frame);
  }

  window.ASCII = { heroField, develop, scramble, cellSize, reduceMotion, NOISE, RAMP };
})();
