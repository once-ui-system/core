"use client";

import {
  AutoScroll,
  Badge,
  BlobFx,
  Button,
  Column,
  Dialog,
  Heading,
  Icon,
  Row,
  ShineFx,
  Text,
} from "@once-ui-system/core";
import type React from "react";
import { useEffect, useState } from "react";
import { BlockCategories } from "../BlockCategories";
import DocsLayout from "../layout";
import { NewBlocks } from "../NewBlocks";
import { About3, Dashboard1, Login2, Pricing1 } from "@/blocks/modules";

const Docs: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const scrollToBlocks = () => {
    document.getElementById("blocks")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Cleanup: ensure dialog is closed when component unmounts
  useEffect(() => {
    return () => {
      setIsDialogOpen(false);
    };
  }, []);

  return (
    <DocsLayout maxWidth="xl">
      <Column fillWidth as="section" horizontal="center">
        <Row
          fillWidth
          zIndex={1}
          border
          radius="xl"
          padding="12"
          s={{ direction: "column" }}
          overflow="hidden"
        >
          <BlobFx position="absolute" top="0" left="0" translateY="50%" />
          <Column flex={1} padding="l" gap="24" vertical="center">
            <Badge
              effect={false}
              tabIndex={0}
              paddingY="8"
              paddingLeft="8"
              paddingRight="24"
              onBackground="brand-weak"
              vertical="center"
              gap="12"
              cursor="interactive"
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsDialogOpen(true);
                }
              }}
            >
              <Icon
                padding="4"
                border="brand-alpha-medium"
                background="brand-alpha-weak"
                radius="full"
                name="sparkle"
                size="xs"
              />
              <ShineFx speed={3000} inverse baseOpacity={0.6}>
                What's new?
              </ShineFx>
            </Badge>
            <Heading variant="display-default-s" style={{ lineHeight: "1.125" }}>
              Let Once UI fight
              <br /> your <Text onBackground="brand-medium">CSS battles</Text>
            </Heading>
            <Text onBackground="neutral-weak" wrap="balance">
              Copy-paste high quality, responsive building blocks — modular, beautiful, ready to
              ship.
            </Text>
            <Row gap="12" wrap vertical="center" marginTop="8">
              <Button arrowIcon onClick={scrollToBlocks}>
                Browse blocks
              </Button>
              <Button variant="secondary" href="https://once-ui.com/pricing">
                View Pro
              </Button>
            </Row>
          </Column>
          <Column flex={2} fillWidth radius="l" border overflow="hidden" aria-hidden="true">
            <Row fillWidth height="40" paddingX="16" gap="8" vertical="center" borderBottom>
              <Row width="12" height="12" radius="full" border background="neutral-alpha-weak" />
              <Row width="12" height="12" radius="full" border background="neutral-alpha-weak" />
              <Row width="12" height="12" radius="full" border background="neutral-alpha-weak" />
            </Row>
            <Column fill overflow="hidden" aspectRatio="16 / 9" background="overlay">
              <Column
                fillWidth
                position="absolute"
                top="8"
                left="0"
                style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%" }}
              >
                <AutoScroll speed="slow">
                  <Row
                    background="page"
                    marginRight="16"
                    minWidth={72}
                    fillWidth
                    radius="l"
                    overflow="hidden"
                    border="neutral-alpha-medium"
                  >
                    <Dashboard1 />
                  </Row>
                  <Row
                    background="page"
                    marginRight="16"
                    minWidth={72}
                    fillWidth
                    radius="l"
                    padding="l"
                    overflow="hidden"
                    border="neutral-alpha-medium"
                  >
                    <Pricing1 />
                  </Row>
                  <Row
                    background="page"
                    marginRight="16"
                    minWidth={72}
                    fillWidth
                    radius="l"
                    overflow="hidden"
                    border="neutral-alpha-medium"
                  >
                    <Login2 />
                  </Row>
                  <Row
                    background="page"
                    marginRight="16"
                    minWidth={72}
                    fillWidth
                    radius="l"
                    padding="l"
                    overflow="hidden"
                    border="neutral-alpha-medium"
                  >
                    <About3 />
                  </Row>
                </AutoScroll>
              </Column>
            </Column>
          </Column>
        </Row>
        <Row
          id="blocks"
          paddingX="l"
          fillWidth
          data-scaling="90"
          marginTop="xl"
          style={{ scrollMarginTop: "80px" }}
        >
          <BlockCategories />
        </Row>
      </Column>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="What's new?"
        description="Recently added blocks and components"
      >
        <NewBlocks onNavigate={() => setIsDialogOpen(false)} />
      </Dialog>
    </DocsLayout>
  );
};

export default Docs;
