"use client";

import { SegmentedControl } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import {
  counterpartSlug,
  getPlatform,
  PLATFORMS,
  type PlatformId,
  platformOfPath,
} from "@/resources/platforms";

interface SlugTree {
  slug: string;
  children?: SlugTree[];
}

/** Every page slug in a navigation tree. Folders are not pages. */
export function flattenSlugs(items: SlugTree[]): string[] {
  return items.flatMap((item) => (item.children ? flattenSlugs(item.children) : [item.slug]));
}

/**
 * Web or React Native. Switching keeps the reader on the same topic where the
 * other platform has a page for it, and lands on that platform's home where
 * it does not.
 */
export function PlatformSwitcher({ slugs }: { slugs: string[] }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const active = platformOfPath(pathname);

  return (
    <SegmentedControl
      aria-label="Platform"
      fillWidth
      value={active.id}
      buttons={PLATFORMS.map((p) => ({
        value: p.id,
        label: p.label,
        prefixIcon: p.icon,
        size: "m",
      }))}
      onValueChange={(value) => {
        const target = getPlatform(value as PlatformId);
        if (target.id === active.id) return;
        router.push(`/${counterpartSlug(pathname, target, slugs)}`);
      }}
    />
  );
}
