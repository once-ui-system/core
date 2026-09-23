import { Row } from "@once-ui-system/core";
import { OnThisPage } from "../components/OnThisPage";
import { SideBar } from "../components/SideBar";

/**
 * The blocks surface carries its own two rails.
 *
 * The left one is the block catalogue, which is a different tree from the
 * component docs the site's own sidebar renders — that sidebar stands down on
 * these routes (see `product/Sidebar.tsx`) rather than showing a nav for
 * somewhere the reader is not.
 */
export default function BlocksLayout({ children }: { children: React.ReactNode }) {
  return (
    <Row as="section" fillWidth>
      <Row
        fillHeight
        maxWidth={17}
        paddingY="8"
        paddingX="2"
        position="sticky"
        style={{ height: "calc(100vh - var(--static-space-56))" }}
        top="56"
        m={{ hide: true }}
      >
        <SideBar />
      </Row>
      {children}
      <Row
        fillHeight
        maxWidth={17}
        paddingY="8"
        paddingX="2"
        position="sticky"
        style={{ height: "calc(100vh - var(--static-space-56))" }}
        top="56"
        l={{ hide: true }}
      >
        <OnThisPage />
      </Row>
    </Row>
  );
}
