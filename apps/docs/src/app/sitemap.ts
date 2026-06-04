import { getPages } from "@/app/utils/utils";
import { baseURL } from "@/resources";

export default async function sitemap() {
  const contentPages = getPages(["src", "content"]).map((post) => ({
    url: `${baseURL}/${post.slug}`,
    lastModified: post.metadata.updatedAt || new Date().toISOString(),
  }));

  const staticPages = [
    { url: baseURL, lastModified: new Date().toISOString() },
    { url: `${baseURL}/changelog`, lastModified: new Date().toISOString() },
    { url: `${baseURL}/roadmap`, lastModified: new Date().toISOString() },
  ];

  return [...staticPages, ...contentPages];
}
