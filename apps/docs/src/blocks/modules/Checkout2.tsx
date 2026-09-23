"use client";

import { Button, Column, Icon, Input, Line, Media, Row, Select, Text } from "@once-ui-system/core";
import { useState } from "react";

const steps = [
  { label: "Shipping", icon: "truck" as const },
  { label: "Payment", icon: "card" as const },
  { label: "Review", icon: "check" as const },
] as const;

const cartItems = [
  {
    name: "Once Fleece Jacket",
    variant: "Charcoal · M",
    image: "/images/fashion/jacket-01.jpg",
    price: 148,
    qty: 1,
  },
  {
    name: "Studio Cap",
    variant: "Sand · One size",
    image: "/images/demos/ecommerce_02.jpg",
    price: 38,
    qty: 1,
  },
];

export const Checkout2 = () => {
  const [step, setStep] = useState(0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = step >= 1 ? 12 : 0;
  const total = subtotal + shipping;

  return (
    <Column fillWidth horizontal="center" paddingX="l" paddingY="xl">
      <Row maxWidth="l" fillWidth gap="xl" m={{ direction: "column-reverse" }}>
        <Column fillWidth flex={3} gap="32">
          <Row fillWidth gap="8" vertical="center">
            {steps.map((item, index) => (
              <Row key={item.label} fillWidth gap="8" vertical="center">
                <Row
                  minWidth={8}
                  minHeight={8}
                  radius="full"
                  center
                  border={index <= step ? "brand-alpha-strong" : "neutral-alpha-weak"}
                  background={index <= step ? "brand-alpha-weak" : "surface"}
                  cursor={index < step ? "interactive" : undefined}
                  onClick={() => index < step && setStep(index)}
                >
                  <Icon
                    name={index < step ? "check" : item.icon}
                    size="xs"
                    onBackground={index <= step ? "brand-medium" : "neutral-weak"}
                  />
                </Row>
                <Column gap="2" hide={index === steps.length - 1 ? false : undefined}>
                  <Text
                    variant="label-default-s"
                    onBackground={index <= step ? "neutral-strong" : "neutral-weak"}
                  >
                    {item.label}
                  </Text>
                </Column>
                {index < steps.length - 1 && (
                  <Line
                    flex={1}
                    background={index < step ? "brand-alpha-medium" : "neutral-alpha-weak"}
                  />
                )}
              </Row>
            ))}
          </Row>

          {step === 0 && (
            <Column fillWidth gap="16">
              <Text variant="heading-strong-s">Shipping address</Text>
              <Row fillWidth gap="8" m={{ direction: "column" }}>
                <Input autoComplete="off" id="first-name" placeholder="First name" />
                <Input autoComplete="off" id="last-name" placeholder="Last name" />
              </Row>
              <Input autoComplete="off" id="address" placeholder="Street address" />
              <Row fillWidth gap="8" m={{ direction: "column" }}>
                <Input autoComplete="off" id="city" placeholder="City" />
                <Input autoComplete="off" id="zip" placeholder="Postal code" />
              </Row>
              <Select
                id="country-shipping"
                placeholder="Country"
                options={[
                  { label: "United States", value: "us" },
                  { label: "Canada", value: "ca" },
                  { label: "United Kingdom", value: "uk" },
                  { label: "Germany", value: "de" },
                ]}
                value="United States"
                onSelect={() => {}}
              />
              <Button fillWidth size="m" onClick={() => setStep(1)}>
                Continue to payment
              </Button>
            </Column>
          )}

          {step === 1 && (
            <Column fillWidth gap="16">
              <Text variant="heading-strong-s">Payment method</Text>
              <Input autoComplete="off" id="email-checkout" placeholder="Email" />
              <Column fillWidth gap="-1">
                <Input
                  corners="top"
                  autoComplete="off"
                  id="card-number"
                  placeholder="1234 1234 1234 1234"
                  suffix={
                    <Row gap="4">
                      <Icon name="visa" />
                      <Icon name="mastercard" />
                    </Row>
                  }
                />
                <Row fillWidth gap="-1">
                  <Input
                    corners="bottom-left"
                    autoComplete="off"
                    id="expiry"
                    placeholder="MM / YY"
                  />
                  <Input corners="bottom-right" autoComplete="off" id="cvc" placeholder="CVC" />
                </Row>
              </Column>
              <Row fillWidth gap="8">
                <Button fillWidth variant="secondary" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button fillWidth onClick={() => setStep(2)}>
                  Review order
                </Button>
              </Row>
            </Column>
          )}

          {step === 2 && (
            <Column fillWidth gap="16">
              <Text variant="heading-strong-s">Review your order</Text>
              <Column fillWidth gap="12" padding="16" radius="l" border background="surface">
                {cartItems.map((item) => (
                  <Row key={item.name} fillWidth gap="12" vertical="center">
                    <Media
                      src={item.image}
                      alt={item.name}
                      aspectRatio="1/1"
                      minWidth={5}
                      maxWidth={5}
                      radius="m"
                      border
                      sizes="80px"
                    />
                    <Column fillWidth gap="2">
                      <Text variant="label-default-s">{item.name}</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {item.variant}
                      </Text>
                    </Column>
                    <Text variant="body-default-s">${item.price.toFixed(2)}</Text>
                  </Row>
                ))}
              </Column>
              <Row fillWidth gap="8">
                <Button fillWidth variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button fillWidth prefixIcon="lock">
                  Place order · ${total.toFixed(2)}
                </Button>
              </Row>
            </Column>
          )}
        </Column>

        <Column
          fillWidth
          flex={2}
          padding="l"
          gap="16"
          radius="l"
          border
          background="overlay"
          position="sticky"
          top="64"
          fitHeight
        >
          <Text variant="heading-strong-s">Order summary</Text>
          <Column fillWidth gap="12">
            {cartItems.map((item) => (
              <Row key={item.name} fillWidth gap="12" vertical="center">
                <Row position="relative" minWidth={5} minHeight={5}>
                  <Media
                    src={item.image}
                    alt={item.name}
                    aspectRatio="1/1"
                    stretch
                    radius="m"
                    border
                    sizes="80px"
                  />
                  <Row
                    position="absolute"
                    right="0"
                    top="0"
                    height="24"
                    width="24"
                    radius="full"
                    center
                    background="neutral-weak"
                    onBackground="neutral-strong"
                    textVariant="body-default-xs"
                  >
                    {item.qty}
                  </Row>
                </Row>
                <Column fillWidth gap="2">
                  <Text variant="label-default-s">{item.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {item.variant}
                  </Text>
                </Column>
                <Text variant="body-default-s">${(item.price * item.qty).toFixed(2)}</Text>
              </Row>
            ))}
          </Column>
          <Line />
          <Column fillWidth gap="8">
            <Row
              fillWidth
              horizontal="between"
              textVariant="body-default-s"
              onBackground="neutral-weak"
            >
              <Text>Subtotal</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </Row>
            <Row
              fillWidth
              horizontal="between"
              textVariant="body-default-s"
              onBackground="neutral-weak"
            >
              <Text>Shipping</Text>
              <Text>{shipping ? `$${shipping.toFixed(2)}` : "Calculated next"}</Text>
            </Row>
            <Row fillWidth horizontal="between" textVariant="body-strong-s" paddingTop="8">
              <Text>Total</Text>
              <Text>${total.toFixed(2)}</Text>
            </Row>
          </Column>
        </Column>
      </Row>
    </Column>
  );
};
