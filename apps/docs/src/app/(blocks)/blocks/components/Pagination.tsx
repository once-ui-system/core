"use client";

import { Button, Flex } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { blocks } from "@/resources/blocks";
import type { Blocks } from "@/types";

interface PaginationProps {
  pagination: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ pagination }) => {
  const pathname = usePathname();
  const [prevLink, setPrevLink] = useState<{ href: string; label: string } | null>(null);
  const [nextLink, setNextLink] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    // Convert sidebar object to a flat array of { href, label }
    const data: Blocks = blocks;
    const allPages: { href: string; label: string }[] = Object.values(data)
      .flatMap((section) =>
        Array.isArray(section.items) ? section.items : Object.values(section.items),
      )
      .map(({ href, label }) => ({ href, label }));

    const currentPageIndex = allPages.findIndex((page) => page.href === pathname);
    setPrevLink(null);
    setNextLink(null);

    if (currentPageIndex > 0) {
      const prevPage = allPages[currentPageIndex - 1];
      setPrevLink({ href: prevPage.href, label: prevPage.label });
    } else {
      setPrevLink(null);
    }

    if (currentPageIndex < allPages.length - 1) {
      const nextPage = allPages[currentPageIndex + 1];
      setNextLink({ href: nextPage.href, label: nextPage.label });
    } else {
      setNextLink(null);
    }
  }, [pathname]);

  if (!pagination || (!prevLink && !nextLink)) return null;

  return (
    <Flex fillWidth horizontal="between" data-border="rounded" paddingX="s">
      {prevLink ? (
        <Button
          href={prevLink.href}
          variant="tertiary"
          weight="default"
          prefixIcon="arrowLeft"
          size="s"
        >
          {prevLink.label}
        </Button>
      ) : (
        <div />
      )}
      {nextLink ? (
        <Button
          href={nextLink.href}
          variant="tertiary"
          weight="default"
          suffixIcon="arrowRight"
          size="s"
        >
          {nextLink.label}
        </Button>
      ) : (
        <div />
      )}
    </Flex>
  );
};

export { Pagination };
