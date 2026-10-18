import React from "react";
import { safeScriptJson } from "../../utils/safe-html.js";

export interface SchemaProps {
  as:
    | "website"
    | "aboutPage"
    | "article"
    | "blogPosting"
    | "creativeWork"
    | "techArticle"
    | "webPage"
    | "organization";
  title: string;
  description: string;
  baseURL: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  sameAs?: string[];
  author?: {
    name: string;
    url?: string;
    image?: string;
  };
}

const schemaTypeMap = {
  website: "WebSite",
  aboutPage: "AboutPage",
  article: "Article",
  blogPosting: "BlogPosting",
  creativeWork: "CreativeWork",
  techArticle: "TechArticle",
  webPage: "WebPage",
  organization: "Organization",
};

export function Schema({
  as,
  title,
  description,
  baseURL,
  path,
  datePublished,
  dateModified,
  image,
  sameAs = [],
  author,
}: SchemaProps) {
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // An absolute image (a CDN) is used as is; only a path is put on baseURL.
  const imageUrl = image
    ? /^https?:\/\//.test(image)
      ? image
      : `${normalizedBaseURL}${image.startsWith("/") ? image : `/${image}`}`
    : `${normalizedBaseURL}/og?title=${encodeURIComponent(title)}`;

  const url = `${normalizedBaseURL}${normalizedPath}`;

  const schemaType = schemaTypeMap[as];

  // biome-ignore lint/suspicious/noExplicitAny: <cause why not, we love any in typescript..>
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    url,
  };

  schema.sameAs = sameAs.filter(Boolean);

  if (as === "website") {
    schema.name = title;
    schema.description = description;
    schema.image = imageUrl;
  } else if (as === "organization") {
    schema.name = title;
    schema.description = description;
    schema.image = imageUrl;
  } else {
    schema.headline = title;
    schema.description = description;
    schema.image = imageUrl;

    if (datePublished) {
      schema.datePublished = datePublished;
      schema.dateModified = dateModified || datePublished;
    }
  }

  if (author) {
    schema.author = {
      "@type": "Person",
      name: author.name,
      ...(author.url && { url: author.url }),
      ...(author.image && {
        image: {
          "@type": "ImageObject",
          url: author.image,
        },
      }),
    };
  }

  return (
    <script
      id={`schema-${as}-${path}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeScriptJson(schema),
      }}
    />
  );
}

export default Schema;
