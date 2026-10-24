import { Meta } from "@once-ui-system/core";
import { baseURL } from "@/resources";

type MetaEntry = {
  title: string;
  description: string;
  path: string;
  canonical: string;
  image: string;
  robots?: string;
  alternates?: { href: string; hrefLang: string }[];
};

/** Page metadata from an SEO entry in src/resources/seo.js, with the configured base URL. */
export function pageMetadata(entry: MetaEntry, overrides: Record<string, unknown> = {}) {
  return Meta.generate({
    baseURL,
    title: entry.title,
    description: entry.description,
    path: entry.path,
    canonical: entry.canonical,
    image: entry.image,
    robots: entry.robots,
    alternates: entry.alternates,
    ...overrides,
  });
}
