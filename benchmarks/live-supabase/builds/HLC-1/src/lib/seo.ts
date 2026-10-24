import type { Metadata } from "next";
import { site } from "@/config/site";

// Per-page metadata built from the site config. Every page calls this.
export function pageMetadata({
  title,
  description,
  path = "/",
  openGraph = false,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  openGraph?: boolean;
  type?: "website" | "article";
}): Metadata {
  const pageTitle = title ?? site.seo.defaultTitle;
  const pageDescription = description ?? site.description;
  const metadata: Metadata = {
    title: title ? { absolute: `${title} | ${site.name}` } : { absolute: site.seo.defaultTitle },
    description: pageDescription,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
  };
  if (openGraph) {
    metadata.openGraph = {
      title: pageTitle,
      description: pageDescription,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type,
    };
  }
  return metadata;
}
