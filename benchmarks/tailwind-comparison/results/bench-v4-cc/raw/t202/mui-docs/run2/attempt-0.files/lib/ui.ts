/** A translucent tint of a theme colour variable, e.g. tint("primary-main", 12). */
export function tint(token: string, percent: number): string {
  return `color-mix(in srgb, var(--mui-palette-${token}) ${percent}%, transparent)`;
}
