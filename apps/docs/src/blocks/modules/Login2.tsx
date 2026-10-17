import {
  Background,
  Button,
  Column,
  Heading,
  HoloFx,
  Input,
  Line,
  Logo,
  ParticleFx,
  Row,
  SmartLink,
} from "@once-ui-system/core";

export const Login2 = () => {
  return (
    <Row fill padding="8">
      <Row fill radius="xl" overflow="hidden">
        <ParticleFx
          position="absolute"
          top="0"
          left="0"
          fill
          interactive
          speed={13.33}
          size="1"
          density={200}
          intensity={40}
          pointerEvents="none"
        />
        <HoloFx
          fill
          top="0"
          left="0"
          position="absolute"
          texture={{
            opacity: 0,
          }}
        >
          <Background
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 0,
              y: "125%",
              colorStart: "accent-solid-strong",
              colorEnd: "static-transparent",
            }}
          />
          <Background
            gradient={{
              display: true,
              x: "125%",
              y: "100%",
              width: "150%",
              height: "150%",
              colorStart: "brand-background-strong",
              colorEnd: "static-transparent",
            }}
          />
        </HoloFx>
        <Column fill center padding="16">
          <Column center gap="16" padding="40" maxWidth="32rem" radius="xl" background="surface">
            <Logo
              href="/"
              size="l"
              icon={{ light: "/trademarks/icon-light.svg", dark: "/trademarks/icon-dark.svg" }}
            />
            <Heading marginTop="24" textVariant="display-strong-xs" align="center">
              Welcome to Once UI
            </Heading>
            <Row onBackground="neutral-medium" marginBottom="24" gap="4" align="center">
              Log in or
              <SmartLink href="#">sign up</SmartLink>
            </Row>
            <Column fillWidth gap="8">
              <Button
                label="Continue with Google"
                fillWidth
                variant="secondary"
                weight="default"
                prefixIcon="google"
                size="l"
              />
              <Button
                label="Continue with GitHub"
                fillWidth
                variant="secondary"
                weight="default"
                prefixIcon="github"
                size="l"
              />
            </Column>
            <Row fillWidth paddingY="24">
              <Row onBackground="neutral-weak" fillWidth gap="24" vertical="center">
                <Line />/<Line />
              </Row>
            </Row>
            <Column gap="-1" fillWidth>
              <Input id="email" placeholder="Email" corners="top" />
              <Input id="password" placeholder="Password" corners="bottom" type="password" />
            </Column>
            <Button type="button" id="login-2" label="Log in" arrowIcon fillWidth href="#" />
          </Column>
        </Column>
      </Row>
    </Row>
  );
};
