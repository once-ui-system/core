"use client";

import {
  Column,
  Icon,
  IconButton,
  Line,
  Logo,
  NavIcon,
  Option,
  Row,
  SmartLink,
  Text,
  ToggleButton,
  UserMenu,
} from "@once-ui-system/core";
import { useState } from "react";

interface HeaderProps extends React.ComponentProps<typeof Row> {
  cartCount?: number;
}

export const Header4: React.FC<HeaderProps> = ({ cartCount = 0, ...flex }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <Row
      as="header"
      paddingY="8"
      paddingLeft="20"
      paddingRight="32"
      fillWidth
      vertical="center"
      horizontal="between"
      {...flex}
    >
      <Row gap="24" vertical="center">
        <NavIcon
          active={isActive}
          onClick={() => setIsActive(!isActive)}
          aria-label="Toggle navigation menu"
          aria-expanded={isActive}
          hide
          s={{ hide: false }}
        />
        <Logo
          href="#"
          icon={{ light: "/trademarks/icon-light.svg", dark: "/trademarks/icon-dark.svg" }}
        />
        <Row gap="8" s={{ hide: true }}>
          <ToggleButton label="All products" />
          <ToggleButton label="Trending" />
          <ToggleButton label="New" />
          <ToggleButton label="On sale" />
        </Row>
      </Row>
      <Row gap="24" paddingY="2" vertical="center">
        <Row>
          <IconButton
            data-border="rounded"
            variant="ghost"
            tooltip="Cart"
            tooltipPosition="bottom"
            icon="cart"
          />
          {cartCount > 0 && (
            <Row
              data-scaling="90"
              position="absolute"
              center
              textVariant="body-default-xs"
              solid="brand-strong"
              onSolid="brand-strong"
              radius="full"
              minWidth="20"
              height="20"
              border="neutral-weak"
              top={-0.125}
              right={-0.5}
            >
              {cartCount}
            </Row>
          )}
        </Row>
        <UserMenu
          placement="bottom-end"
          avatarProps={{ src: "/images/creators/lorant.jpg" }}
          dropdown={[
            <Column key="cart" padding="4" gap="2" fitWidth>
              <Option
                key="cart-option"
                label="Cart"
                value="cart"
                prefix={<Icon size="xs" onBackground="neutral-weak" name="cart" />}
              />
              <Line key="line-1" marginY="2" />
              <Option
                key="order-history-option"
                label="Order history"
                value="orders"
                prefix={<Icon size="xs" onBackground="neutral-weak" name="payment" />}
              />
              <Option
                key="returned-orders-option"
                label="Returned orders"
                value="returns"
                prefix={<Icon size="xs" onBackground="neutral-weak" name="return" />}
              />
              <Line key="line-2" marginY="2" />
              <Option
                key="settings-option"
                label="Settings"
                prefix={<Icon size="xs" onBackground="neutral-weak" name="settings" />}
                value="settings"
              />
              <Option
                key="help-option"
                label="Help"
                prefix={<Icon size="xs" onBackground="neutral-weak" name="help" />}
                value="help"
              />
              <Line key="line-3" marginY="2" />
              <Row padding="4" fillWidth horizontal="center">
                <SmartLink href="#">
                  <Text onBackground="neutral-weak" variant="body-default-xs">
                    Terms of Use
                  </Text>
                </SmartLink>
              </Row>
            </Column>,
          ]}
        />
      </Row>
      {isActive && (
        <Column top="100%" left="0" position="absolute" zIndex={2} padding="8" fillWidth>
          <Column padding="8" background="surface" border="surface" radius="l-4" gap="4">
            <ToggleButton fillWidth size="l" horizontal="start" label="All products" />
            <ToggleButton fillWidth size="l" horizontal="start" label="Trending" />
            <ToggleButton fillWidth size="l" horizontal="start" label="New" />
            <ToggleButton fillWidth size="l" horizontal="start" label="On sale" />
          </Column>
        </Column>
      )}
    </Row>
  );
};
