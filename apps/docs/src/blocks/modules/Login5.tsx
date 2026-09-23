"use client";

import {
  Background,
  Button,
  Column,
  Heading,
  Input,
  Logo,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

type Step = "email" | "verify";

export const Login5 = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const updateCode = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
  };

  return (
    <Column fill center padding="24" overflow="hidden">
      <Background
        position="absolute"
        fill
        dots={{ display: true, size: "2", color: "brand-background-strong" }}
        mask={{ x: 50, y: 40, radius: 40 }}
        gradient={{
          display: true,
          x: 50,
          y: 0,
          width: 80,
          height: 80,
          colorStart: "brand-background-medium",
          colorEnd: "static-transparent",
        }}
      />

      <Column
        maxWidth={36}
        fillWidth
        gap="24"
        padding="32"
        radius="xl"
        border="neutral-alpha-medium"
        background="surface"
        shadow="l"
      >
        <Column horizontal="center" gap="12">
          <Logo dark icon="/trademarks/icon-dark.svg" size="l" />
          <Logo light icon="/trademarks/icon-light.svg" size="l" />
          <Heading variant="display-strong-xs" align="center" wrap="balance" marginTop="8">
            {step === "email" ? "Sign in with a magic link" : "Check your inbox"}
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak" align="center" wrap="balance">
            {step === "email"
              ? "Enter your email and we'll send a one-time code — or use your passkey."
              : `We sent a 6-digit code to ${email || "your email"}.`}
          </Text>
        </Column>

        <Row fillWidth gap="8" horizontal="center">
          {(["email", "verify"] as Step[]).map((item, index) => (
            <Row key={item} gap="8" vertical="center">
              <Row
                center
                width="32"
                height="32"
                minWidth="32"
                minHeight="32"
                radius="full"
                background={step === item ? "brand-strong" : "neutral-alpha-weak"}
              >
                <Text
                  variant="label-default-xs"
                  onSolid={step === item ? "brand-strong" : undefined}
                  onBackground={step === item ? undefined : "neutral-weak"}
                >
                  {index + 1}
                </Text>
              </Row>
              {index === 0 && (
                <Row width="48" height="2" background="neutral-alpha-weak" radius="full" />
              )}
            </Row>
          ))}
        </Row>

        {step === "email" ? (
          <Column fillWidth gap="12">
            <Input
              id="login5-email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button fillWidth size="l" onClick={() => setStep("verify")}>
              Send magic link
            </Button>
            <Button fillWidth size="l" variant="secondary" prefixIcon="key">
              Continue with passkey
            </Button>
          </Column>
        ) : (
          <Column fillWidth gap="16">
            <Row fillWidth gap="8" horizontal="center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`login5-code-${index}`}
                  value={digit}
                  maxLength={1}
                  style={{ width: "2.75rem", textAlign: "center" }}
                  onChange={(event) => updateCode(index, event.target.value)}
                />
              ))}
            </Row>
            <Button fillWidth size="l">
              Verify and sign in
            </Button>
            <Row fillWidth horizontal="center" gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Didn't get it?
              </Text>
              <SmartLink href="#" onClick={() => setStep("email")}>
                Resend code
              </SmartLink>
            </Row>
          </Column>
        )}

        <Text variant="label-default-xs" onBackground="neutral-weak" align="center" wrap="balance">
          By continuing, you agree to our <SmartLink href="#">Terms</SmartLink> and{" "}
          <SmartLink href="#">Privacy Policy</SmartLink>.
        </Text>
      </Column>
    </Column>
  );
};
