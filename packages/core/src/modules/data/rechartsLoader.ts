let cache: any;

export async function getRechartsComponents(): Promise<any> {
  if (!cache) {
    // webpackIgnore prevents bundlers from statically tracing this optional dependency
    cache = await import(/* webpackIgnore: true */ "recharts" as any);
  }
  return cache;
}
