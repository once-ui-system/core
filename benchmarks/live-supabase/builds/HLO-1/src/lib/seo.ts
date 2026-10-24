import type { Metadata } from "next";
import { site } from "../resources/once-ui.config";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
};

/** Title, description, canonical and Open Graph for one page. */
export function pageMetadata({ title, description, path, type = "website", publishedTime }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: new URL(path, site.url).toString(),
      siteName: site.name,
      locale: site.locale,
      type,
      ...(publishedTime ? { publishedTime } : {}),
    },
  };
}
