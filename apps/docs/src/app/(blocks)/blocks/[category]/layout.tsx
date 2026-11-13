import { Row } from "@once-ui-system/core";
import { Panel } from "@/product";
import { BlockDocsLinksProvider } from "../components/BlockDocsLinks";
import { getComponentDocsLinks } from "../components/docsLinks.server";
import { SideBar } from "../components/SideBar";

/**
 * The blocks surface carries its own rail: the block catalogue, which is a
 * different tree from the component docs the site's own sidebar renders — that
 * sidebar stands down on these routes (see `product/Sidebar.tsx`) rather than
 * showing a nav for somewhere the reader is not. Moving between the blocks of
 * one category happens in the page itself, through its filmstrip.
 */
export default function BlocksLayout({ children }: { children: React.ReactNode }) {
  return (
    <Row as="section" fillWidth>
      <Row
        fillHeight
        maxWidth="17rem"
        paddingY="8"
        paddingX="2"
        position="sticky"
        style={{ height: "calc(100vh - var(--static-space-56))" }}
        top="56"
        m={{ hide: true }}
      >
        <SideBar />
      </Row>
      <Panel>
        <BlockDocsLinksProvider links={getComponentDocsLinks()}>{children}</BlockDocsLinksProvider>
      </Panel>
    </Row>
  );
}
