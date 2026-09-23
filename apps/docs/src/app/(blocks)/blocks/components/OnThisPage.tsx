"use client";

import { Column, HeadingNav, Row } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Once UI's HeadingNav scans the document for h2–h6 exactly once on mount and
// never re-scans. Two problems to work around here:
//  1. Block demo pages load via `dynamic(..., { ssr: false })`, so the example
//     title headings don't exist yet at the layout's first paint — a naive mount
//     would scan zero headings and render nothing.
//  2. Every block preview contains its own headings, which would pollute the nav.
// So we wait until the title headings (marked data-block-title) appear, exclude
// every other heading from the scan, then mount HeadingNav. Re-runs per pathname
// so client navigation between categories rebuilds the nav.
export const OnThisPage = () => {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-scan headings on route change (pathname is the trigger)
  useEffect(() => {
    setReady(false);
    let settled = false;

    const attempt = () => {
      if (settled) return;
      const titles = document.querySelectorAll("main [data-block-title]");
      if (!titles.length) return;
      settled = true;
      clearInterval(interval);
      // Let above-the-fold lazy previews mount, then exclude their headings so
      // HeadingNav's one-shot scan only sees the block titles.
      window.setTimeout(() => {
        document
          .querySelectorAll("main h2, main h3, main h4, main h5, main h6")
          .forEach((heading) => {
            if (!heading.hasAttribute("data-block-title")) {
              heading.setAttribute("data-exclude-nav", "");
            }
          });
        setReady(true);
      }, 350);
    };

    const interval = window.setInterval(attempt, 150);
    attempt();

    return () => {
      settled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  if (!ready) return null;

  return (
    <Column paddingX="8" horizontal="end" maxWidth={14} paddingTop="40" gap="24">
      <Row paddingLeft="2" maxWidth={12} textVariant="label-strong-m">
        Browse
      </Row>
      <HeadingNav key={pathname} maxWidth={12} header={false} />
    </Column>
  );
};
