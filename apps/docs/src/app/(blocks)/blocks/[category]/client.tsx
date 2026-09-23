"use client";

import { Flex, Text } from "@once-ui-system/core";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const categoryPages: Record<string, ComponentType<object>> = {
  quickStart: dynamic(() => import("@/app/(blocks)/blocks/components/demo/QuickStart"), {
    ssr: false,
  }),

  contact: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Contact"), { ssr: false }),
  careers: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Careers"), { ssr: false }),
  authentication: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Authentication"), {
    ssr: false,
  }),
  pricing: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Pricing"), { ssr: false }),
  settings: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Settings"), { ssr: false }),
  blog: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Blog"), { ssr: false }),
  social: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Social"), { ssr: false }),
  about: dynamic(() => import("@/app/(blocks)/blocks/components/demo/About"), { ssr: false }),
  dashboard: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Dashboard"), { ssr: false }),
  productivity: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Productivity"), {
    ssr: false,
  }),
  streaming: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Streaming"), { ssr: false }),
  waitlist: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Waitlist"), { ssr: false }),
  ecommerce: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Ecommerce"), { ssr: false }),

  features: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Features"), { ssr: false }),
  bento: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Bento"), { ssr: false }),
  faq: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Faq"), { ssr: false }),
  newsletter: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Newsletter"), {
    ssr: false,
  }),
  plans: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Plans"), { ssr: false }),
  hero: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Hero"), { ssr: false }),
  sidebar: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Sidebar"), { ssr: false }),
  header: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Header"), { ssr: false }),
  footer: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Footer"), { ssr: false }),
  cookie: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Cookie"), { ssr: false }),
  testimonial: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Testimonial"), {
    ssr: false,
  }),
  widgets: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Widgets"), { ssr: false }),

  background: dynamic(() => import("@/app/(blocks)/blocks/components/demo/Background"), {
    ssr: false,
  }),
};

interface BlocksClientProps {
  category: string;
}

export function BlocksClient({ category }: BlocksClientProps) {
  const Component = categoryPages[category as keyof typeof categoryPages];

  return (
    <Flex fill minHeight={20} center>
      {Component ? (
        <Component />
      ) : (
        <Text align="center">No blocks found for {category}</Text>
      )}
    </Flex>
  );
}
