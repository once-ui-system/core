import { Meta, Schema } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL, blocks } from "@/resources";
import { BlocksClient } from "./client";

type Params = {
  params: Promise<{ category: string }>;
};

/** `quickStart` → `Quick Start`. */
const formatCategoryName = (name: string) =>
  name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

const describe = (category: string) =>
  category === "quickStart"
    ? "Start your next project with fully customizable, copy-paste sections and components."
    : `Implement beautiful ${formatCategoryName(category)} UI in minutes with copy-paste code. Built with Next.js and Once UI.`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  return Meta.generate({
    baseURL,
    title: `${formatCategoryName(category)} – Once UI Blocks`,
    description: describe(category),
    path: `/blocks/${category}`,
  });
}

/**
 * Every category the catalogue links to, so the whole surface is static.
 *
 * Sections are authored either as a list or as a keyed map, which is why the
 * items are normalised before they are read.
 */
export async function generateStaticParams() {
  const categories = new Set<string>();
  for (const section of Object.values(blocks) as Array<{ items: unknown }>) {
    const items = Array.isArray(section.items)
      ? section.items
      : Object.values(section.items as Record<string, { href?: string }>);
    for (const item of items as Array<{ href?: string }>) {
      if (item.href?.startsWith("/blocks/")) {
        categories.add(item.href.slice("/blocks/".length));
      }
    }
  }
  return Array.from(categories, (category) => ({ category }));
}

export default async function BlocksPage({ params }: Params) {
  const { category } = await params;
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={`${formatCategoryName(category)} – Once UI Blocks`}
        description={describe(category)}
        path={`/blocks/${category}`}
      />
      <BlocksClient category={category} />
    </>
  );
}
