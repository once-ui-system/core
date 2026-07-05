import { Row, Logo, IconButton, UserMenu, Column, Icon, Option, Line, SmartLink, Text, ToggleButton } from "@once-ui-system/core"

interface HeaderProps extends React.ComponentProps<typeof Row> {
  cartCount?: number;
}

export const Header4: React.FC<HeaderProps> = ({ cartCount = 0, ...flex }) => {
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
      <Row gap="24">
        <Logo href="#" dark icon="/trademarks/icon-dark.svg" />
        <Logo href="#" light icon="/trademarks/icon-light.svg" />
        <Row gap="8">
          <ToggleButton label="All products"/>
          <ToggleButton label="Trending"/>
          <ToggleButton label="New"/>
          <ToggleButton label="On sale"/>
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
              vertical="center"
              horizontal="center"
              textVariant="body-default-xs"
              solid="brand-strong"
              onSolid="brand-strong"
              radius="full"
              minWidth="20"
              height="20"
              border="neutral-weak"
              style={{
                top: "-0.125rem",
                right: "-0.5rem",
              }}
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
                hasPrefix={
                  <Icon
                    size="xs"
                    onBackground="neutral-weak"
                    name="cart"
                  />
                }
              />
              <Line key="line-1" marginY="2" />
              <Option
                key="order-history-option"
                label="Order history"
                value="orders"
                hasPrefix={
                  <Icon size="xs" onBackground="neutral-weak" name="payment" />
                }
              />
              <Option
                key="returned-orders-option"
                label="Returned orders"
                value="returns"
                hasPrefix={
                  <Icon size="xs" onBackground="neutral-weak" name="return" />
                }
              />
              <Line key="line-2" marginY="2" />
              <Option
                key="settings-option"
                label="Settings"
                hasPrefix={
                  <Icon size="xs" onBackground="neutral-weak" name="settings" />
                }
                value="settings"
              />
              <Option
                key="help-option"
                label="Help"
                hasPrefix={<Icon size="xs" onBackground="neutral-weak" name="help" />}
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
            </Column>
          ]}
        />
      </Row>
    </Row>   
  )
}