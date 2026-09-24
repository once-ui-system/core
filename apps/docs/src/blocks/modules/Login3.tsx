"use client";

import {
  Button,
  Column,
  Heading,
  Input,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Background4 } from "./Background4";

const Login3 = () => {
  const [showEmailLogin, setShowLoginForm] = useState(false);

  return (
    <Column fill>
      <Row s={{ hide: true }} fillWidth height="64" borderBottom="neutral-medium">
        <Row minWidth="64" borderRight="neutral-medium" />
        <Row fillWidth />
        <Row minWidth="64" borderLeft="neutral-medium" />
      </Row>
      <Row fill>
        <Row minWidth="64" s={{ hide: true }} borderRight="neutral-medium" />
        <Row fillWidth horizontal="center" overflow="hidden">
          <Row fill position="absolute" top="0" left="0" style={{ transform: "scale(1.5)" }}>
            <Background4 />
          </Row>
          <Column center gap="32" padding="l" maxWidth={32}>
            <Column horizontal="center" fillWidth gap="4">
              <Heading variant="heading-strong-xl" marginTop="24">
                Welcome to Once UI
              </Heading>
              <Text onBackground="neutral-medium" variant="body-default-s">
                Access your account
              </Text>
            </Column>
            {!showEmailLogin ? (
              <>
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
                    onClick={() => setShowLoginForm(true)}
                  />
                </Column>
                <Row
                  onBackground="neutral-medium"
                  gap="4"
                  marginBottom="24"
                  textVariant="body-default-s"
                >
                  Don't have an account?
                  <SmartLink href="#">Sign up!</SmartLink>
                </Row>
              </>
            ) : (
              <Column fillWidth gap="24" horizontal="center">
                <Column gap="-1" fillWidth>
                  <Input corners="top" id="email" label="Email" size="s" />
                  <PasswordInput corners="bottom" id="password" label="Password" size="s" />
                  <Row
                    fillWidth
                    horizontal="end"
                    textVariant="label-default-s"
                    paddingRight="12"
                    paddingTop="12"
                  >
                    <SmartLink href="#">Forgot password</SmartLink>
                  </Row>
                </Column>
                <Button id="login" label="Log in" arrowIcon fillWidth />
                <Button
                  data-border="rounded"
                  prefixIcon="arrowLeft"
                  variant="tertiary"
                  weight="default"
                  size="s"
                  onClick={() => setShowLoginForm(false)}
                >
                  Back to login
                </Button>
              </Column>
            )}
          </Column>
        </Row>
        <Row minWidth="64" s={{ hide: true }} borderLeft="neutral-medium" />
      </Row>
      <Row s={{ hide: true }} fillWidth height="64" borderTop="neutral-medium">
        <Row minWidth="64" borderRight="neutral-medium" />
        <Row fillWidth />
        <Row minWidth="64" borderLeft="neutral-medium" />
      </Row>
    </Column>
  );
};

export { Login3 };
