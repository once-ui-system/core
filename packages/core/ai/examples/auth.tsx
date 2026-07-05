"use client";

/**
 * Gold example: auth
 * Target: split sign-up — media hero left, form right, social auth buttons
 */
import {
  Button,
  Column,
  Grid,
  Heading,
  Input,
  Line,
  Media,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

export function AuthExample() {
  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh">
      <Grid
        fillWidth
        maxWidth="l"
        columns="2"
        radius="xl"
        border="neutral-alpha-weak"
        overflow="hidden"
        background="surface"
        s={{ columns: 1 }}
      >
        <Column minHeight={40} s={{ hide: true }}>
          <Media
            fill
            fillHeight
            aspectRatio="4 / 5"
            src="/images/cover.jpg"
            alt=""
            radius="none"
          />
          <Column
            position="absolute"
            bottom="0"
            left="0"
            fillWidth
            padding="32"
            gap="8"
            background="overlay"
          >
            <Heading as="h2" variant="display-strong-xs" onBackground="neutral-strong">
              Explore new dimensions. Code with curiosity.
            </Heading>
          </Column>
        </Column>

        <Column padding="48" gap="32" center>
          <Column fillWidth gap="8" horizontal="center">
            <Heading as="h1" variant="display-strong-xs" align="center">
              Create your account
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Already have an account?{" "}
              <SmartLink href="/login">Sign in</SmartLink>
            </Text>
          </Column>

          <Column fillWidth gap="12">
            <Button fillWidth>
              Continue with GitHub
            </Button>
            <Button fillWidth variant="secondary">
              Continue with Google
            </Button>
          </Column>

          <Row fillWidth vertical="center" gap="16">
            <Line fill />
            <Text variant="label-default-s" onBackground="neutral-weak">
              or
            </Text>
            <Line fill />
          </Row>

          <Column fillWidth gap="16">
            <Input id="email" label="Email" placeholder="you@company.com" />
            <PasswordInput id="password" label="Password" placeholder="••••••••" />
            <Row fillWidth horizontal="end">
              <SmartLink href="/forgot">Forgot password?</SmartLink>
            </Row>
            <Button fillWidth arrowIcon>
              Sign up
            </Button>
          </Column>

          <Row gap="16" wrap horizontal="center">
            <SmartLink href="/privacy">Privacy policy</SmartLink>
            <SmartLink href="/terms">Terms of use</SmartLink>
          </Row>
        </Column>
      </Grid>
    </Column>
  );
}
