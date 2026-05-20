let cache: any;

export async function getRechartsComponents(): Promise<any> {
  if (!cache) {
    // Both magic comments are needed to keep this as a runtime
    // resolution against the optional peer dep:
    //   - webpackIgnore: prevents webpack from statically tracing
    //     and bundling recharts even though we treat it as optional.
    //   - turbopackIgnore: Next.js 16 defaults to Turbopack, which
    //     ignores webpack-specific directives. Without this the
    //     import gets resolved at build time and chart components
    //     fail silently on Turbopack consumers.
    cache = await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ "recharts" as any
    );
  }
  return cache;
}
