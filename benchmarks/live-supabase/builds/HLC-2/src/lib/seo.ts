import type { Metadata } from "next";
import { site } from "@/config/site";

type PageSeo = {
  title: string;
  description?: string;
  path?: string;
  openGraph?: boolean | { type?: "website" | "article"; publishedTime?: string };
};

/** Metadata for one page, with the SEO defaults from the site config. */
export function pageMetadata({ title, description, path = "/", openGraph }: PageSeo): Metadata {
  const desc = description ?? site.description;
  const url = new URL(path, site.url).toString();
  const meta: Metadata = {
    title,
    description: desc,
    alternates: { canonical: url },
  };
  if (openGraph) {
    const og = typeof openGraph === "object" ? openGraph : {};
    meta.openGraph = {
      type: og.type ?? "website",
      title,
      description: desc,
      url,
      siteName: site.name,
      locale: site.locale,
      ...(og.type === "article" && og.publishedTime ? { publishedTime: og.publishedTime } : {}),
    };
  }
  return meta;
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.titleDefault, template: site.seo.titleTemplate },
  description: site.description,
  keywords: [...site.seo.keywords],
  applicationName: site.name,
};
