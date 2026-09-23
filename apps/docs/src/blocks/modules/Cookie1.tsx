"use client";

import {
  Accordion,
  Button,
  Column,
  Dialog,
  Line,
  Row,
  SmartLink,
  Switch,
  Text,
} from "@once-ui-system/core";
import type React from "react";
import { useState } from "react";

export const Cookie1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);

  return (
    <>
      <Column
        padding="20"
        maxWidth={28}
        background="surface"
        border="neutral-medium"
        radius="l"
        gap="8"
        {...flex}
      >
        <Text variant="body-default-s" marginBottom="12">
          This site uses tracking technologies. You may opt in or opt out of the use of these
          technologies.
        </Text>
        <Row fillWidth horizontal="between" gap="24">
          <Row gap="8">
            <Button size="s" variant="secondary">
              Deny
            </Button>
            <Button size="s" variant="secondary">
              Accept all
            </Button>
          </Row>
          <Button size="s" onClick={() => setIsOpen(true)}>
            Customize
          </Button>
        </Row>
      </Column>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Cookie settings"
        description="This site uses tracking technologies. You may opt in or opt out of the use of these technologies."
        footer={
          <Row fillWidth horizontal="between">
            <Row gap="8">
              <Button variant="secondary">Deny</Button>
              <Button variant="secondary">Accept all</Button>
            </Row>
            <Button onClick={() => setIsOpen(false)}>Save</Button>
          </Row>
        }
      >
        <Column fillWidth gap="16">
          <Column fillWidth radius="m" border="neutral-medium">
            <Accordion
              title={
                <button type="button" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={marketing}
                    onToggle={() => setMarketing(!marketing)}
                    label="Marketing"
                  />
                </button>
              }
            >
              <Text onBackground="neutral-medium" variant="body-default-s">
                Marketing cookies and services are used to deliver personalized advertisements,
                promotions, and offers. These technologies enable targeted advertising and marketing
                campaigns by collecting information about users' interests, preferences, and online
                activities.
              </Text>
            </Accordion>
            <Line />
            <Accordion
              title={
                <button type="button" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={analytics}
                    onToggle={() => setAnalytics(!analytics)}
                    label="Analytics"
                  />
                </button>
              }
            >
              <Text onBackground="neutral-medium" variant="body-default-s">
                Analytics cookies and services are used for collecting statistical information about
                how visitors interact with a website. These technologies provide insights into
                website usage, visitor behavior, and site performance to understand and improve the
                site and enhance user experience.
              </Text>
            </Accordion>
            <Line />
            <Accordion
              title={
                <button type="button" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={functional}
                    onToggle={() => setFunctional(!functional)}
                    label="Functional"
                  />
                </button>
              }
            >
              <Text onBackground="neutral-medium" variant="body-default-s">
                Functional cookies and services are used to offer enhanced and personalized
                functionalities. These technologies provide additional features and improved user
                experiences, such as remembering your language preferences, font sizes, region
                selections, and customized layouts. Opting out of these cookies may render certain
                services or functionality of the website unavailable.
              </Text>
            </Accordion>
            <Line />
            <Accordion
              title={
                <button type="button" onClick={(e) => e.stopPropagation()}>
                  <Switch checked onToggle={() => {}} label="Essential" />
                </button>
              }
            >
              <Text onBackground="neutral-medium" variant="body-default-s">
                Essential cookies and services are used to enable core website features, such as
                ensuring the security of the website.
              </Text>
            </Accordion>
          </Column>
          <Text onBackground="neutral-weak" variant="body-default-s">
            Read how we handle your data in our <SmartLink href="#">Privacy Policy</SmartLink>
          </Text>
        </Column>
      </Dialog>
    </>
  );
};
