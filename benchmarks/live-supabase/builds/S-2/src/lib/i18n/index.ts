import { i18n } from "@/resources/once-ui.config";

/**
 * The app's languages, from `i18n` in src/resources/once-ui.config.js. Pure,
 * so client and server code both import it; the request's locale comes from
 * `getLocale()` in ./server on the server and `useLocale()` in the client.
 */
export const locales: readonly string[] = i18n.locales;
export const defaultLocale: string = locales[0] ?? "en";

/** The request header the i18n slice's proxy carries the URL's locale in. */
export const LOCALE_HEADER = "x-locale";
/** The cookie that remembers the visitor's language between visits. */
export const LOCALE_COOKIE = "locale";

/** `locale` if the app has it, matched case-insensitively, else null. */
export function matchLocale(locale: string | null | undefined): string | null {
  if (!locale) return null;
  const lower = locale.toLowerCase();
  return locales.find((candidate) => candidate.toLowerCase() === lower) ?? null;
}

/**
 * The path a page has in `locale`: the default language has no prefix, every
 * other one does (`/store` -> `/hu/store`). Pass a path without a prefix.
 */
export function localePath(path: string, locale: string): string {
  if (locale === defaultLocale) return path;
  return `/${locale.toLowerCase()}${path === "/" ? "" : path}`;
}

/**
 * One locale's entry from a labels file (`src/content/<surface>/labels.ts`).
 * Falls back from `de-AT` to `de`, then to the default locale, then to the
 * file's first entry, so a language with no labels yet shows the template's
 * instead of breaking.
 */
export function labelsFor<T>(labels: Record<string, T>, locale: string): T {
  const language = locale.split("-")[0] ?? locale;
  const found =
    labels[locale] ?? labels[language] ?? labels[defaultLocale] ?? Object.values(labels)[0];
  if (!found) throw new Error("labelsFor: the labels file has no entries");
  return found;
}

/** `pathname` without its locale prefix: `/hu/store` -> `/store`. */
export function stripLocale(pathname: string): string {
  const [, segment, ...rest] = pathname.split("/");
  if (!matchLocale(segment)) return pathname;
  return `/${rest.join("/")}`;
}

/**
 * What `Meta.generate` needs to describe a page in `locale`: its own path as
 * the canonical, and one alternate per language so search engines index each
 * (hreflang). With one language there are no alternates to give.
 */
export function localeMeta(path: string, locale: string, baseURL: string) {
  const base = baseURL.replace(/\/$/, "");
  return {
    path: localePath(path, locale),
    alternates:
      locales.length < 2
        ? undefined
        : [
            ...locales.map((candidate) => ({
              href: `${base}${localePath(path, candidate)}`,
              hrefLang: candidate,
            })),
            { href: `${base}${path}`, hrefLang: "x-default" },
          ],
  };
}
