import { Meta, Schema } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";
import { getPosts } from "@/utils/utils";
import { BlogClient } from "./client";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.blog.title,
    description: landing.blog.description,
    baseURL: baseURL,
    image: landing.blog.image,
    path: landing.blog.path,
  });
}

export default async function Blog() {
  const allPosts = await getPosts(["src", "content", "blog"]);
  const totalPosts = allPosts.length;
  
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.blog.title}
        description={landing.blog.description}
        path={landing.blog.path}
      />
      <BlogClient totalPosts={totalPosts} posts={allPosts} />
    </>
  );
}
