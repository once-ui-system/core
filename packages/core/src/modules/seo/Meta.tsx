/**
 * The metadata object `Meta.generate` returns.
 *
 * Declared structurally rather than imported from `next` so that core's
 * published types resolve without Next installed. It is assignable to Next's
 * `Metadata`, so `export const metadata: Metadata = Meta.generate(...)` and
 * `generateMetadata(): Promise<Metadata>` keep type-checking unchanged.
 */
export interface GeneratedMetadata {
  metadataBase: URL;
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    type: "website" | "article";
    publishedTime?: string;
    url: string;
    images: { url: string; alt: string }[];
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
  authors?: { name: string; url?: string }[];
  robots?: string;
  alternates?: {
    canonical: string;
    languages: Record<string, string>;
  };
}

export interface Alternate {
  href: string;
  hrefLang: string;
}

export interface MetaProps {
  title: string;
  description: string;
  baseURL: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  publishedTime?: string;
  author?: {
    name: string;
    url?: string;
  };
  canonical?: string;
  robots?: string;
  noindex?: boolean;
  nofollow?: boolean;
  alternates?: Alternate[];
}

export function generateMetadata({
  title,
  description,
  baseURL,
  path = "",
  type = "website",
  image,
  publishedTime,
  author,
  canonical,
  robots,
  noindex,
  nofollow,
  alternates,
}: MetaProps): GeneratedMetadata {
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${image.startsWith("/") ? "" : "/"}${image}`
    : `/api/og/generate?title=${encodeURIComponent(title)}`;

  const url = canonical || `${normalizedBaseURL}${normalizedPath}`;

  let robotsContent = robots;
  if (!robotsContent && (noindex || nofollow)) {
    robotsContent = `${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`;
  }

  return {
    metadataBase: new URL(
      normalizedBaseURL.startsWith("https://") ? normalizedBaseURL : `https://${normalizedBaseURL}`,
    ),
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      ...(publishedTime && type === "article" ? { publishedTime } : {}),
      url,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(author ? { authors: [{ name: author.name, url: author.url }] } : {}),
    ...(robotsContent ? { robots: robotsContent } : {}),
    ...(alternates?.length
      ? {
          alternates: {
            canonical: url,
            languages: Object.fromEntries(alternates.map((alt) => [alt.hrefLang, alt.href])),
          },
        }
      : {}),
  };
}

export const Meta = {
  generate: generateMetadata,
};

export default Meta;
