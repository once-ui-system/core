"use client";

import {
  Row,
  Column,
  Badge,
  Heading,
  Input,
  IconButton,
  AvatarGroup,
  CountFx,
  Text,
  Logo,
  RevealFx,
  Line,
} from "@once-ui-system/core";
import { Background6 } from "./Background6";
import { useEffect, useState } from "react";

export const Waitlist1 = () => {
  const [email, setEmail] = useState("");
  const [subscribers, setSubscribers] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  
  useEffect(() => {
    setSubscribers(1337);
  });

  const validateEmail = (email: any) => {
    if (!email) return null;
    
    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    
    return null;
  };

  const subscribe = () => {
    if (validateEmail(email)) {
      return;
    }
    
    setSubscribed(true);
    setSubscribers(subscribers + 1);
    setEmail("");
  };

  return (
    <Row fillWidth center padding="l" minHeight="100%"
      cursor={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M7.89235 19.7113L3.33378 3.71982C3.0984 2.89409 3.95602 2.18106 4.73584 2.55413L19.8385 9.7792C20.6416 10.1634 20.5812 11.3159 19.7425 11.6131L13.5312 13.8139C13.3056 13.8938 13.1164 14.0511 12.9978 14.2574L9.73178 19.9361C9.29078 20.7029 8.13473 20.5616 7.89235 19.7113Z" fill="#15D9EF"/>
            <path d="M2.85075 3.8544C2.49768 2.61583 3.78362 1.54674 4.95335 2.10628L20.0564 9.3314C21.2607 9.90776 21.1699 11.6359 19.9119 12.0816L13.7012 14.2825C13.5885 14.3224 13.4939 14.4012 13.4346 14.5041L10.1679 20.1829C9.50645 21.3329 7.7731 21.1214 7.40931 19.8463L2.85075 3.8544Z" stroke="#15AAEF"/>
          </g>
        </svg>
      }>
      <Background6 />
      <Column horizontal="center" gap="40" maxWidth="xs">
        <RevealFx horizontal="center">
          <Badge paddingX="24" background="brand-alpha-weak" pointerEvents="none" textVariant="label-default-s" onBackground="brand-medium">
            <Logo size="s" dark icon="/trademarks/icon-dark.svg" wordmark="/trademarks/wordmark-dark.svg"/>
            <Logo size="s" light icon="/trademarks/icon-light.svg" wordmark="/trademarks/wordmark-light.svg"/>
            <Line vert marginX="16" height="20" background="brand-alpha-medium"/>
            <Text paddingX="4">Arriving soon</Text>
          </Badge>
        </RevealFx>
        <Column horizontal="center" align="center" gap="24">
          <RevealFx horizontal="center" delay={0.4}>
            <Heading variant="display-strong-xl" onBackground="neutral-strong">
              The all-in-one course platform
            </Heading>
          </RevealFx>
          <RevealFx horizontal="center" delay={0.6}>
            <Text onBackground="neutral-medium" variant="heading-default-xl">
              Launch and sell your courses with ease. We handle enrollment, payments and analytics. You focus on creating.
            </Text>
          </RevealFx>
        </Column>
        <RevealFx horizontal="center" delay={0.8}>
          <AvatarGroup
            reverse
            size="m"
            avatars={[
              { src: "/images/creators/lorant.jpg" },
              { src: "/images/creators/justin.jpg" },
              { src: "/images/creators/light.jpg" },
              { src: "/images/creators/texz.jpg" },
              { src: "/images/creators/suhaib.jpg" },
            ]}
          />
        </RevealFx>

        <Column maxWidth={24} horizontal="center" align="center">
          {subscribed ? (
            <RevealFx key="waitlist" direction="column" horizontal="center" paddingX="64" paddingY="24" radius="l" background="brand-alpha-weak" border="brand-alpha-weak" gap="20">
              <Text variant="label-default-m" onBackground="brand-medium">
                You're on the list!
              </Text>
              <Row vertical="center" textVariant="heading-strong-l" gap="16">
                That makes it <CountFx
                  value={subscribers}
                  variant="code-default-xl"
                  speed={4000}
                  effect="smooth"
                  easing="ease-out"
                />
              </Row>
            </RevealFx>
          ) : (
            <RevealFx key="subscribed" direction="column" horizontal="center" delay={1} gap="16" data-border="rounded">
              <Input
                id="email"
                placeholder="Enter email"
                value={email}
                validate={(value) => validateEmail(value as string)}
                onChange={(e) => setEmail(e.target.value)}
                hasSuffix={
                  <IconButton size="l" style={{marginRight: "-0.5rem"}} icon="send" onClick={() => subscribe()}/>
                }
              />
              <Row vertical="center" gap="4" textVariant="label-default-s">
                <Text>Join</Text>
                <CountFx
                  value={subscribers}
                  variant="code-default-s"
                  speed={1000}
                  effect="smooth"
                  easing="ease-out"
                />
                <Text>others</Text>
              </Row>
            </RevealFx>
          )}
        </Column>
      </Column>
    </Row>
  );
};
