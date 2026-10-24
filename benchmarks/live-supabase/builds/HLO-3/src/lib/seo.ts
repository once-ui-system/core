import type { Metadata } from "next";
import { brand, seo } from "../resources/once-ui.config";

// Page metadata from the config defaults. Pass the path the page lives at.
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  extra: { type?: "website" | "article"; publishedTime?: string } = {},
): Metadata {
  const url = new URL(path, brand.url).toString();
  const type = extra.type ?? seo.type;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: seo.siteName,
      locale: seo.locale,
      type,
      ...(extra.publishedTime ? { publishedTime: extra.publishedTime } : {}),
    },
  };
}
