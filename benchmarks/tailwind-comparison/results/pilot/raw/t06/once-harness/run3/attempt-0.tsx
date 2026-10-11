"use client";

import {
  Button,
  Column,
  Dialog,
  Heading,
  Input,
  OTPInput,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { type FormEvent, useState } from "react";

const DEMO_EMAIL = "maya.lindqvist@northwind.example";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_CODE = "482913";

export default function Page() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const openLogin = () => {
    setPassword("");
    setPasswordError(false);
    setOtpError(false);
    setLoginOpen(true);
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== DEMO_PASSWORD) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    setOtpError(false);
    setOtpOpen(true);
  };

  const verifyCode = (code: string) => {
    if (code === DEMO_CODE) {
      setOtpError(false);
      setOtpOpen(false);
      setLoginOpen(false);
      setSignedIn(true);
    } else {
      setOtpError(true);
    }
  };

  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh">
      <Column
        maxWidth="s"
        fillWidth
        background="surface"
        border
        radius="xl"
        padding="32"
        gap="24"
        s={{ padding: "24" }}
      >
        <Column gap="8">
          <Text variant="label-default-s" onBackground="brand-medium">
            Northwind Console
          </Text>
          <Heading as="h1" variant="display-strong-xs">
            {signedIn ? "You are signed in" : "Welcome back"}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {signedIn
              ? `Signed in as ${email}. Your session expires in 12 hours.`
              : "Sign in to review deployments, invoices and team access for your workspace."}
          </Text>
        </Column>

        {signedIn ? (
          <Row gap="12" wrap>
            <Button variant="secondary" onClick={() => setSignedIn(false)}>
              Sign out
            </Button>
          </Row>
        ) : (
          <Column gap="12">
            <Button fillWidth arrowIcon onClick={openLogin}>
              Sign in
            </Button>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              New to Northwind? <SmartLink href="/signup">Create an account</SmartLink>
            </Text>
          </Column>
        )}
      </Column>

      <Dialog
        base
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title="Sign in"
        description="Enter your email and password to continue."
      >
        <form onSubmit={submitPassword} noValidate>
          <Column gap="16" paddingTop="8">
            <Input
              id="login-email"
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              id="login-password"
              label="Password"
              autoComplete="current-password"
              value={password}
              error={passwordError}
              errorMessage={passwordError ? "That password is incorrect. Try again." : undefined}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
            />
            <Row fillWidth horizontal="end">
              <SmartLink href="/forgot">Forgot password?</SmartLink>
            </Row>
            <Button type="submit" fillWidth arrowIcon disabled={!email || !password}>
              Continue
            </Button>
            <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
              Demo password: {DEMO_PASSWORD}
            </Text>
          </Column>
        </form>
      </Dialog>

      <Dialog
        stack
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        title="Two-step verification"
        description={`Enter the 6-digit code from your authenticator app for ${email}.`}
      >
        <Column gap="16" paddingTop="8">
          <OTPInput
            length={6}
            autoFocus
            error={otpError}
            errorMessage={otpError ? "That code is not valid. Check your app and try again." : undefined}
            onComplete={verifyCode}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Demo code: {DEMO_CODE}
          </Text>
          <Button variant="secondary" fillWidth onClick={() => setOtpOpen(false)}>
            Back to password
          </Button>
        </Column>
      </Dialog>
    </Column>
  );
}
