"use client";

import { Avatar, Button, Column, Icon, Row, SmartLink, Text } from "@once-ui-system/core";
import { CLINIC, CLINIC_NAME, user } from "@/lib/data";
import { fmt } from "@/lib/time";
import { useDesk } from "@/components/DeskProvider";
import { SearchBox } from "@/components/SearchBox";

export function AppHeader() {
  const { now, openBooking } = useDesk();
  return (
    <Column
      as="header"
      fillWidth
      background="surface"
      borderBottom
      position="sticky"
      top="0"
      zIndex={5}
      paddingX="16"
      paddingY="12"
      horizontal="center"
    >
      <Row maxWidth="l" wrap gap="16" vertical="center" horizontal="between">
        <SmartLink href="/" unstyled aria-label={`${CLINIC}, ${CLINIC_NAME}. Today's schedule`}>
          <Row gap="12" vertical="center">
            <Row background="brand-alpha-weak" radius="m" padding="8" fit center>
              <Icon name="paw" size="m" onBackground="brand-strong" />
            </Row>
            <Column gap="2">
              <Text textVariant="heading-strong-m">{CLINIC}</Text>
              <Row s={{ hide: true }}>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {CLINIC_NAME}
                </Text>
              </Row>
            </Column>
          </Row>
        </SmartLink>

        <SearchBox />

        <Row gap="16" vertical="center">
          <Button prefixIcon="plus" size="m" onClick={() => openBooking()}>
            New appointment
          </Button>
          <Row gap="8" vertical="center" s={{ hide: true }}>
            <Icon name="time" size="s" onBackground="neutral-weak" />
            <Text textVariant="label-strong-m" style={{ fontVariantNumeric: "tabular-nums" }} aria-label={`Clinic time ${fmt(now)}`}>
              {fmt(now)}
            </Text>
          </Row>
          <Row gap="8" vertical="center">
            <Avatar value="RL" size="s" />
            <Column gap="2" s={{ hide: true }}>
              <Text textVariant="label-strong-s">{user.name}</Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {user.role}
              </Text>
            </Column>
          </Row>
        </Row>
      </Row>
    </Column>
  );
}
