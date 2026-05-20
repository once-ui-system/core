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
    cache = await import("recharts");
  }
  return cache;
}
