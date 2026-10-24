import { headers } from "next/headers";
import { LOCALE_HEADER, defaultLocale, locales, matchLocale } from "./index";

/**
 * The locale this request renders in. One language: the default, read without
 * touching the request, so pages stay static. Several: the one the i18n
 * slice's proxy took from the URL (`/hu/store`), which makes rendering
 * per-request.
 */
export async function getLocale(): Promise<string> {
  if (locales.length < 2) return defaultLocale;
  return matchLocale((await headers()).get(LOCALE_HEADER)) ?? defaultLocale;
}
