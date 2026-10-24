/** A local path to return to after sign-in. Anything else falls back to the app. */
export function safeNext(value: string | undefined, fallback = "/app"): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
