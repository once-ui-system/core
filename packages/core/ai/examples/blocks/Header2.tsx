import {
  Button,
  Column,
  Fade,
  Logo,
  NavIcon,
  Option,
  Row,
  SmartLink,
  ToggleButton,
  UserMenu,
} from "@once-ui-system/core";

interface HeaderProps extends React.ComponentProps<typeof Row> {
  authenticated?: boolean;
  avatar?: string;
}

export const Header2: React.FC<HeaderProps> = ({ authenticated, avatar, ...flex }) => {
  return (
    <Row paddingX="8" paddingTop="8" fillWidth position="sticky" horizontal="center" top="0" 
      zIndex={2}>
      <Fade
        fillWidth
        position="absolute"
        top="0"
        height={8}
        pattern={{ display: true, size: "2" }}
      />
      <Row
        as="header"
        border="neutral-alpha-weak"
        maxWidth="m"
        paddingX="m"
        radius="l"
        height="56"
        vertical="center"
        background="page"
        {...flex}
      >
        <Row s={{hide: true}}>
          <Logo dark wordmark="/trademarks/wordmark-dark.svg" size="s" href="/" />
          <Logo light wordmark="/trademarks/wordmark-light.svg" size="s" href="/" />
        </Row>
        <Row hide s={{hide: false}} gap="4" vertical="center" fillWidth>
          <NavIcon />
          <Logo dark icon="/trademarks/icon-dark.svg" size="s" href="/" />
          <Logo light icon="/trademarks/icon-light.svg" size="s" href="/" />
        </Row>
        {authenticated ? (
          <Row fillWidth vertical="center" horizontal="between">
            <Row fillWidth>
              <Row s={{hide: true}} fillWidth gap="4" paddingX="l" vertical="center">
                <ToggleButton selected={true} label="Dashboard" />
                <ToggleButton label="Apps" />
                <ToggleButton label="Resources" />
              </Row>
            </Row>
            <UserMenu
              placement="bottom-end"
              avatarProps={{
                value: avatar ? undefined : "L",
                src: avatar,
              }}
              dropdown={
                <Column gap="2" padding="4" width={8}>
                  <Option label="Profile" value="profile" />
                  <Option label="Settings" value="settings" />
                  <Option label="Log out" value="logout" />
                </Column>
              }
            />
          </Row>
        ) : (
          <Row fillWidth vertical="center" horizontal="end">
            <Row
              s={{hide: true}}
              textVariant="label-default-s"
              fillWidth
              gap="16"
              paddingX="l"
              vertical="center"
            >
              <SmartLink href="#">Home</SmartLink>
              <SmartLink href="#">Product</SmartLink>
              <SmartLink href="#">Solutions</SmartLink>
              <SmartLink href="#">Pricing</SmartLink>
            </Row>
            <Row fitWidth vertical="center" gap="8">
              <Button size="s" variant="secondary" label="Log in" href="#" />
              <Button size="s" label="Sign up" href="#" />
            </Row>
          </Row>
        )}
      </Row>
    </Row>
  );
};
