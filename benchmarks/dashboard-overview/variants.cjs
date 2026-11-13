// CSS rewrites for A/B runs without a rebuild (VARIANT=<name> node run.cjs <label>).
module.exports = {
  // No skeleton animation at all: the floor for loading-state style recalc.
  noskel: (c) => c + "\n[class*='skeleton'],[class*='_group']{animation:none!important}",
  // Every breakpoint utility removed: what the stylesheet's size costs in recalc.
  nomedia: (c) => {
    if (!c.includes(".margin-0{")) return c;
    let out = "", i = 0;
    for (;;) {
      const j = c.indexOf("@media", i);
      if (j < 0) return out + c.slice(i);
      out += c.slice(i, j);
      let k = c.indexOf("{", j) + 1, d = 1;
      while (d && k < c.length) { if (c[k] === "{") d++; else if (c[k] === "}") d--; k++; }
      i = k;
    }
  },
};
