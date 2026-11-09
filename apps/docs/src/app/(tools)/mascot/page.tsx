import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL } from "@/resources";
import { MascotDesigner } from "./client";

const title = "Mascot designer";
const description =
  "Design your own Once UI Mascot: body, eyes, face and accessories, then copy it as JSON or JSX, or download it as an SVG or PNG.";
const path = "/mascot";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = Meta.generate({
    baseURL,
    title: `${title} – Once UI`,
    description,
    path,
    image: `/api/og/generate?title=${encodeURIComponent(title)}`,
  });
  return { ...metadata, alternates: { canonical: metadata.openGraph.url } };
}

/**
 * MascotPanel as a tool: design a Mascot and take it away. The design is
 * remembered in the browser, so coming back picks up where you left off.
 */
export default function MascotPage() {
  return (
    <Column fillWidth paddingX="24" paddingY="40" gap="32" s={{ paddingX: "16" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={title}
        description={description}
        path={path}
      />
      <Column gap="12" maxWidth="40rem">
        <Heading as="h1" variant="display-strong-xs">
          {title}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Design a mascot for your app, then copy it as JSON or JSX from the menu on the preview,
          or download it as an SVG or PNG. Built with MascotPanel from Once UI Blocks.
        </Text>
      </Column>
      <MascotDesigner />
    </Column>
  );
}
