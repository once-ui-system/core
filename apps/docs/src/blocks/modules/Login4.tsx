"use client";

import {
  Button,
  Checkbox,
  Column,
  Fade,
  Heading,
  IconButton,
  Input,
  Line,
  Logo,
  Media,
  RevealFx,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export const Login4 = () => {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <Row padding="24" fill center>
      <Row
        maxWidth="l"
        background="surface"
        radius="l-4"
        shadow="xl"
        padding="4"
        overflow="hidden"
        border
        horizontal="center"
      >
        <Row flex="1" m={{ hide: true }}>
          <Media src="/images/global/auth-cover-01.jpg" radius="l" sizes="640px" border />
          <Row fill position="absolute" top="0" left="0">
            <Column gap="32" vertical="between" padding="32" fill>
              <Row
                paddingY="8"
                paddingLeft="8"
                paddingRight="12"
                fitWidth
                radius="m"
                vertical="center"
                gap="16"
                cursor="interactive"
              >
                <Row background="page" radius="m">
                  <IconButton icon="chevronLeft" variant="secondary" tooltip="Back" />
                </Row>
                <Text textVariant="label-default-s" onSolid="neutral-strong">
                  Back
                </Text>
              </Row>
              <Fade
                fillWidth
                height="28rem"
                to="top"
                position="absolute"
                bottom="0"
                left="0"
                bottomRadius="l"
              />
              <Column gap="20" padding="8" fillWidth>
                <RevealFx delay={600} horizontal="start">
                  <Logo
                    size="s"
                    wordmark={{
                      light: "/trademarks/wordmark-light.svg",
                      dark: "/trademarks/wordmark-dark.svg",
                    }}
                  />
                </RevealFx>
                <RevealFx horizontal="start">
                  <Heading
                    textVariant="display-default-xs"
                    marginLeft="4"
                    onBackground="neutral-strong"
                  >
                    Explore new dimensions. Code with curiosity.
                  </Heading>
                </RevealFx>
              </Column>
            </Column>
          </Row>
        </Row>

        <Row flex="1" maxWidth="xs">
          <Column gap="12" paddingX="xl" paddingY="40" center fill>
            <Logo
              icon={{ light: "/trademarks/icon-light.svg", dark: "/trademarks/icon-dark.svg" }}
              size="l"
            />
            <Heading textVariant="display-default-xs" align="center" marginTop="20">
              {isSignup ? "Create your account" : "Sign in to Once UI"}
            </Heading>
            <Row textVariant="body-default-s" onBackground="neutral-medium">
              {isSignup ? (
                <>
                  <Text marginRight="4">Already have an account?</Text>
                  <SmartLink href="#" onClick={() => setIsSignup(false)}>
                    Sign in
                  </SmartLink>
                </>
              ) : (
                <>
                  <Text marginRight="4">New here?</Text>
                  <SmartLink href="#" onClick={() => setIsSignup(true)}>
                    Create an account
                  </SmartLink>
                </>
              )}
            </Row>

            <Column fillWidth gap="-1">
              <Button
                label="Continue with Google"
                fillWidth
                size="l"
                corners="top"
                variant="secondary"
                weight="default"
                prefixIcon="google"
              />
              <Button
                label="Continue with GitHub"
                fillWidth
                size="l"
                corners="none"
                variant="secondary"
                weight="default"
                prefixIcon="github"
              />
              <Button
                label="Continue with Email"
                fillWidth
                size="l"
                corners="bottom"
                variant="secondary"
                weight="default"
                prefixIcon="mail"
              />
            </Column>

            <Row paddingY="24" gap="24" vertical="center" fillWidth>
              <Line background="neutral-alpha-strong" />
              <Text onBackground="neutral-weak">/</Text>
              <Line background="neutral-alpha-strong" />
            </Row>

            <Column fillWidth gap="-1">
              <Input corners="top" placeholder="Email" id="email" name="email" />
              <Input
                corners={isSignup ? "none" : "bottom"}
                placeholder="Password"
                id="password"
                name="password" type="password"
              />
              {isSignup && (
                <Input
                  corners="bottom"
                  placeholder="Confirm password"
                  id="confirm-password"
                  name="confirm-password" type="password"
                />
              )}
            </Column>

            {isSignup && (
              <Checkbox checked onCheckedChange={() => {}} label="Subscribe to Design Engineers Weekly" />
            )}

            {!isSignup && (
              <Row fillWidth horizontal="end">
                <SmartLink href="#">Forgot password?</SmartLink>
              </Row>
            )}

            <Button fillWidth size="l">
              {isSignup ? "Create account" : "Sign in"}
            </Button>

            <Text
              textVariant="label-default-s"
              onBackground="neutral-weak"
              align="center"
              wrap="balance"
            >
              By continuing, you agree to our <SmartLink href="#">Terms</SmartLink> and{" "}
              <SmartLink href="#">Privacy Policy</SmartLink>.
            </Text>
          </Column>
        </Row>
      </Row>
    </Row>
  );
};
