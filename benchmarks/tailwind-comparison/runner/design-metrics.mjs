// Free, deterministic design measurements on a rendered page (recorded, never gated).
//
// styleDiscipline(page): how many distinct values the visible elements use for
// font size, text colour, background colour, corner radius, shadow and spacing,
// and the share of spacing values on a 4 px grid. A design system at work tends
// to use a few values from a scale; one-off styling scatters them. Read on the
// desktop render of every route.
//
// brandCheck(page, brand): for the rebrand task, whether the rendered page
// carries the brief's identity: primary-button colour near the brand colour,
// serif headings, button radius, and a dark first paint.

export async function styleDiscipline(page) {
  return page.evaluate(() => {
    const seen = { fontSize: new Set(), color: new Set(), background: new Set(), radius: new Set(), shadow: new Set(), spacing: new Set() };
    const px = (v) => Number.parseFloat(v);
    let elements = 0;
    let spacingValues = 0;
    let onGrid = 0;
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
      elements++;
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (ownText) {
        seen.fontSize.add(cs.fontSize);
        seen.color.add(cs.color);
      }
      if (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") seen.background.add(cs.backgroundColor);
      if (px(cs.borderTopLeftRadius) > 0) seen.radius.add(cs.borderTopLeftRadius);
      if (cs.boxShadow !== "none") seen.shadow.add(cs.boxShadow);
      for (const k of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
        const v = px(cs[k]);
        if (!(v > 0)) continue;
        seen.spacing.add(Math.round(v * 100) / 100);
        spacingValues++;
        if (Math.abs(v / 4 - Math.round(v / 4)) < 0.01) onGrid++;
      }
    }
    const out = { elements };
    for (const [k, set] of Object.entries(seen)) out[`distinct_${k}`] = set.size;
    out.spacing_on_4px_grid = spacingValues ? Math.round((onGrid / spacingValues) * 1000) / 1000 : null;
    return out;
  });
}

const hexToRgb = (h) => {
  const n = Number.parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export async function brandCheck(page, brand) {
  const target = hexToRgb(brand.brand_color);
  return page.evaluate(
    ({ target, radius }) => {
      const rgb = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const buttons = [...document.querySelectorAll("button, a[role='button'], a[class*='button' i], a[class*='btn' i]")].filter(visible);
      // A "filled" button has a background that is neither transparent nor the page's.
      const pageBg = (() => {
        for (const el of [document.body, document.documentElement]) {
          const c = getComputedStyle(el).backgroundColor;
          if (c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c;
        }
        return "rgb(255, 255, 255)";
      })();
      const filled = buttons.filter((b) => {
        const c = getComputedStyle(b).backgroundColor;
        return c !== "rgba(0, 0, 0, 0)" && c !== "transparent" && c !== pageBg;
      });
      const brandFilled = filled.filter((b) => dist(rgb(getComputedStyle(b).backgroundColor), target) < 40);
      const radii = filled.map((b) => Number.parseFloat(getComputedStyle(b).borderTopLeftRadius));
      const radiusOk = radii.filter((r) => Math.abs(r - radius) <= 1).length;
      const h = document.querySelector("h1, h2");
      const headingFont = h ? getComputedStyle(h).fontFamily : null;
      const bodyFont = getComputedStyle(document.body).fontFamily;
      return {
        filled_buttons: filled.length,
        brand_filled_buttons: brandFilled.length,
        button_radius_matches: radiusOk,
        heading_font: headingFont,
        // The first family named decides; a sans stack that ends in "serif" doesn't count.
        heading_serif: headingFont ? /georgia|times|(^|,)\s*serif\s*(,|$)/i.test(headingFont.split(",")[0]) || /^\s*serif\s*$/i.test(headingFont) : null,
        body_font: bodyFont,
        page_background: pageBg,
        dark_first_paint: lum(rgb(pageBg)) < 0.25,
      };
    },
    { target, radius: Number.parseFloat(brand.radius) },
  );
}

// Weight and paint of one loaded page, from the browser's own timing APIs:
// JS and CSS bytes as transferred (next start serves gzip), first contentful
// paint, layout shift, and the summed long-task time past 50 ms (a TBT-like
// figure). Read on the desktop render of every route, after the settle wait.
export async function pageWeight(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const res = performance.getEntriesByType("resource");
        const bytes = (re) => res.filter((r) => re.test(r.name)).reduce((s, r) => s + (r.encodedBodySize || r.transferSize || 0), 0);
        let cls = 0;
        let blocking = 0;
        try {
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) blocking += Math.max(0, e.duration - 50);
          }).observe({ type: "longtask", buffered: true });
        } catch {}
        setTimeout(() => {
          const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
          resolve({
            js_kb: Math.round(bytes(/\.js(\?|$)/) / 102.4) / 10,
            css_kb: Math.round(bytes(/\.css(\?|$)/) / 102.4) / 10,
            fcp_ms: fcp && Math.round(fcp),
            cls: Math.round(cls * 1000) / 1000,
            long_task_ms: Math.round(blocking),
          });
        }, 100);
      }),
  );
}
