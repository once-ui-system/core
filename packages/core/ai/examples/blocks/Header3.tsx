import {
  Avatar,
  Background,
  Column,
  Fade,
  Icon,
  Line,
  Logo,
  NavIcon,
  Option,
  Row,
  SmartLink,
  Text,
  UserMenu,
} from "@once-ui-system/core";

export const Header3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row
      fillWidth
      horizontal="center"
      zIndex={3}
      {...flex}
    >
      <Fade
        fillWidth
        position="absolute"
        pointerEvents="none"
        top="0"
        height={12}
        pattern={{ display: true, size: "2" }}
      />
      <Row
        as="header"
        fillWidth
        paddingX="l"
        height="64"
        vertical="center"
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
        <Row fillWidth vertical="center" horizontal="end">
          <Row
            s={{hide: true}}
            fillWidth
            gap="24"
            paddingX="64"
            vertical="center"
          >
            <SmartLink href="#"><Text padding="8" onBackground="neutral-strong" variant="label-strong-s">Home</Text></SmartLink>
            <SmartLink href="#"><Text padding="8" onBackground="neutral-strong" variant="label-default-s">TV Shows</Text></SmartLink>
            <SmartLink href="#"><Text padding="8" onBackground="neutral-strong" variant="label-default-s">Movies</Text></SmartLink>
            <SmartLink href="#"><Text padding="8" onBackground="neutral-strong" variant="label-default-s">Popular</Text></SmartLink>
            <SmartLink href="#"><Text padding="8" onBackground="neutral-strong" variant="label-default-s">My List</Text></SmartLink>
          </Row>
          <Row fitWidth vertical="center" gap="8">
            <UserMenu
              placement="bottom-end"
              avatarProps={{
                src: "/images/creators/lorant.jpg",
              }}
              dropdown={
                <Column minWidth={14} background="page">
                  <Background position="absolute" fill top="0" left="0" gradient={{
                    display: true,
                    width: 200,
                    height: 100,
                    x: 50,
                    y: 0,
                    colorStart: "brand-background-medium",
                    colorEnd: "static-transparent",
                  }} />
                  <Column fillWidth padding="4" gap="2">
                    <Option
                      label="Profile 1"
                      value="profile"
                      hasPrefix={
                        <Avatar src="/images/creators/justin.jpg"/>
                      }/>
                    <Option
                      label="Profile 2"
                      value="profile"
                      hasPrefix={
                        <Avatar src="/images/creators/light.jpg"/>
                      }/>
                  </Column>
                  <Line />
                  <Column fillWidth padding="4" gap="2">
                    <Option
                      label="Account"
                      value="account"
                      hasPrefix={
                        <Icon padding="4" margin="2" size="s" name="person" onBackground="neutral-weak"/>
                      } />
                    <Option
                      label="Settings"
                      value="settings"
                      hasPrefix={
                        <Icon padding="4" margin="2" size="s" name="settings" onBackground="neutral-weak"/>
                      } />
                    <Option
                      label="Subscription"
                      value="subscription"
                      hasPrefix={
                        <Icon padding="4" margin="2" size="s" name="payment" onBackground="neutral-weak"/>
                      } />
                    <Option label="Help" value="help"
                      hasPrefix={
                        <Icon padding="4" margin="2" size="s" name="help" onBackground="neutral-weak"/>
                    } />
                  </Column>
                  <Line />
                  <Column fillWidth padding="4">
                    <Option padding="4" label="Log out" value="logout" hasPrefix={
                      <Icon padding="4" margin="2" size="s" name="logout" onBackground="neutral-weak"/>
                    } />
                  </Column>
                </Column>
              }
            />
          </Row>
        </Row>
      </Row>
    </Row>
  );
};
