"use client";

import {
  Button,
  Checkbox,
  Column,
  Fade,
  Flex,
  Heading,
  IconButton,
  Input,
  Line,
  Logo,
  Media,
  PasswordInput,
  RevealFx,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export const Login4 = () => {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <Flex padding="24" fill center>
      <Flex
        maxWidth="l"
        background="surface"
        radius="l-4"
        shadow="xl"
        padding="4"
        overflow="hidden"
        border
        horizontal="center"
      >
        <Flex flex="1" m={{ hide: true }}>
          <Media src="/images/global/auth-cover-01.jpg" radius="l" sizes="640px" border />
          <Flex fill position="absolute" top="0" left="0">
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
                <Text variant="label-default-s" onSolid="neutral-strong">
                  Back
                </Text>
              </Row>
              <Fade
                fillWidth
                height={28}
                to="top"
                position="absolute"
                bottom="0"
                left="0"
                bottomRadius="l"
              />
              <Column gap="20" padding="8" fillWidth>
                <RevealFx delay={600} horizontal="start">
                  <Logo dark size="s" wordmark="/trademarks/wordmark-dark.svg" />
                  <Logo light size="s" wordmark="/trademarks/wordmark-light.svg" />
                </RevealFx>
                <RevealFx horizontal="start">
                  <Heading
                    variant="display-default-xs"
                    wrap="balance"
                    marginLeft="4"
                    onBackground="neutral-strong"
                  >
                    Explore new dimensions. Code with curiosity.
                  </Heading>
                </RevealFx>
              </Column>
            </Column>
          </Flex>
        </Flex>

        <Flex flex="1" maxWidth="xs">
          <Column gap="12" paddingX="xl" paddingY="40" center fill>
            <Logo dark icon="/trademarks/icon-dark.svg" size="l" />
            <Logo light icon="/trademarks/icon-light.svg" size="l" />
            <Heading variant="display-default-xs" wrap="balance" align="center" marginTop="20">
              {isSignup ? "Create your account" : "Sign in to Once UI"}
            </Heading>
            <Flex textVariant="body-default-s" onBackground="neutral-medium">
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
            </Flex>

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

            <Flex paddingY="24" gap="24" vertical="center" fillWidth>
              <Line background="neutral-alpha-strong" />
              <Text onBackground="neutral-weak">/</Text>
              <Line background="neutral-alpha-strong" />
            </Flex>

            <Column fillWidth gap="-1">
              <Input corners="top" placeholder="Email" id="email" name="email" />
              <PasswordInput
                corners={isSignup ? "none" : "bottom"}
                placeholder="Password"
                id="password"
                name="password"
              />
              {isSignup && (
                <PasswordInput
                  corners="bottom"
                  placeholder="Confirm password"
                  id="confirm-password"
                  name="confirm-password"
                />
              )}
            </Column>

            {isSignup && (
              <Checkbox checked onToggle={() => {}} label="Subscribe to Design Engineers Weekly" />
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
              variant="label-default-s"
              onBackground="neutral-weak"
              align="center"
              wrap="balance"
            >
              By continuing, you agree to our <SmartLink href="#">Terms</SmartLink> and{" "}
              <SmartLink href="#">Privacy Policy</SmartLink>.
            </Text>
          </Column>
        </Flex>
      </Flex>
    </Flex>
  );
};
