import type { Tone } from "../types.js";

/** The tone a Button or IconButton variant draws in when none is given. */
export const defaultButtonTone = (variant: string): Tone =>
  variant === "primary" ? "brand" : "neutral";
