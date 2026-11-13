// CSS variable shortcuts for colours that sx palette keys cannot express (borders, shadows, mixes).
export const V = {
  primary: "var(--mui-palette-primary-main)",
  error: "var(--mui-palette-error-main)",
  warning: "var(--mui-palette-warning-main)",
  success: "var(--mui-palette-success-main)",
  divider: "var(--mui-palette-divider)",
  paper: "var(--mui-palette-background-paper)",
  page: "var(--mui-palette-background-default)",
  white: "var(--mui-palette-common-white)",
  stage: "var(--mui-palette-grey-800)",
  bar: "var(--mui-palette-secondary-main)",
  barText: "var(--mui-palette-secondary-contrastText)",
  text: "var(--mui-palette-text-primary)",
  text2: "var(--mui-palette-text-secondary)",
};

export function mix(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
