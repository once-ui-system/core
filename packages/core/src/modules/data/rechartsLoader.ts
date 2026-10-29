let cache: any;

export async function getRechartsComponents(): Promise<any> {
  if (!cache) {
    // Bundler-resolved dynamic import. webpack + Turbopack both
    // code-split recharts into its own chunk that only loads when
    // BarChart / LineBarChart actually render.
    //
    // No webpackIgnore / turbopackIgnore — those leave a bare
    // module specifier in the runtime output, which browsers can't
    // resolve ("Failed to resolve module specifier 'recharts'").
    const recharts = await import("recharts");
    // Recharts measures each tick label once and caches its width. Measured
    // before the web font has loaded, a label keeps its fallback-font width
    // for good, and where it lands depends on which came first. So the
    // charts first draw after the fonts.
    if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;
    cache = recharts;
  }
  return cache;
}
