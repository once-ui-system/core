"use client";

import {
  Avatar,
  Badge,
  Button,
  Column,
  CountFx,
  Grid,
  Icon,
  Input,
  Line,
  Row,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const leaderboard = [
  { rank: 1, name: "Priya Shah", referrals: 24, avatar: "/images/creators/zsofia.jpg" },
  { rank: 2, name: "Marco Bellini", referrals: 18, avatar: "/images/creators/evan.jpg" },
  { rank: 3, name: "Ken Osei", referrals: 12, avatar: "/images/creators/dev.jpg" },
  { rank: 4, name: "Aiko Tanaka", referrals: 9, avatar: "/images/creators/div.jpg" },
];

const streakDays = Array.from({ length: 30 }, (_, index) => index + 1);

export const Waitlist3: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const completedDays = 12;

  const validateEmail = (value: unknown) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const join = () => {
    if (!email || validateEmail(email)) return;
    setJoined(true);
  };

  return (
    <Column
      fillWidth
      maxWidth={48}
      gap="32"
      padding="40"
      radius="xl"
      border
      background="page"
      {...flex}
    >
      <Column gap="16" horizontal="center">
        <Badge
          background="brand-alpha-weak"
          onBackground="brand-medium"
          textVariant="label-default-s"
          paddingX="16"
        >
          Early access
        </Badge>
        <Column gap="12" horizontal="center" maxWidth={36}>
          <Text align="center" variant="display-strong-xs">
            Join the waitlist. Climb the leaderboard.
          </Text>
          <Text align="center" variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Invite friends to move up the queue. Top referrers get priority access when we launch.
          </Text>
        </Column>
      </Column>

      <Row fillWidth gap="24" m={{ direction: "column" }}>
        <Column fill gap="16" minWidth={20}>
          {joined ? (
            <Column
              fillWidth
              gap="12"
              padding="20"
              radius="l"
              background="brand-alpha-weak"
              border="brand-alpha-weak"
            >
              <Row horizontal="between" vertical="center">
                <Text variant="label-default-m" onBackground="brand-medium">
                  You&apos;re on the list
                </Text>
                <Row gap="4" vertical="center" textVariant="heading-strong-m">
                  #
                  <CountFx value={847} speed={1200} effect="smooth" easing="ease-out" />
                </Row>
              </Row>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Share your link to climb the leaderboard and unlock early perks.
              </Text>
            </Column>
          ) : (
            <Column fillWidth gap="12">
              <Input
                id="waitlist3-email"
                placeholder="Enter your email"
                value={email}
                validate={(value) => validateEmail(value)}
                onChange={(event) => setEmail(event.target.value)}
                suffix={
                  <Button size="s" onClick={join}>
                    Join waitlist
                  </Button>
                }
              />
              <Row
                gap="4"
                vertical="center"
                textVariant="body-default-xs"
                onBackground="neutral-weak"
              >
                <Icon name="security" size="xs" />
                No spam, unsubscribe anytime
              </Row>
            </Column>
          )}

          <Column fillWidth gap="12" padding="16" radius="l" border="neutral-alpha-weak">
            <Row horizontal="between" vertical="center">
              <Text variant="label-strong-s">Your streak</Text>
              <Text variant="label-default-s" onBackground="brand-weak">
                {completedDays}/30 days
              </Text>
            </Row>
            <Grid columns="10" gap="4" s={{ columns: 6 }}>
              {streakDays.map((day) => (
                <Row
                  key={day}
                  center
                  radius="s"
                  height="32"
                  background={day <= completedDays ? "brand-alpha-weak" : "neutral-alpha-weak"}
                  border={day <= completedDays ? "brand-alpha-medium" : "neutral-alpha-weak"}
                >
                  <Text
                    variant="body-default-xs"
                    onBackground={day <= completedDays ? "brand-medium" : "neutral-weak"}
                  >
                    {day}
                  </Text>
                </Row>
              ))}
            </Grid>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Complete a 30-day streak to unlock priority onboarding.
            </Text>
          </Column>
        </Column>

        <Column
          fill
          minWidth={18}
          gap="12"
          padding="16"
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Row horizontal="between" vertical="center">
            <Text variant="label-strong-s">Top referrers</Text>
            <Row
              gap="4"
              vertical="center"
              textVariant="label-default-s"
              onBackground="neutral-weak"
            >
              <CountFx value={2847} separator="," /> on the list
            </Row>
          </Row>
          <Line background="neutral-alpha-weak" />
          {leaderboard.map((person) => (
            <Row key={person.name} fillWidth vertical="center" gap="12" paddingY="8">
              <Text
                variant="label-strong-s"
                onBackground={person.rank <= 3 ? "brand-medium" : "neutral-weak"}
                style={{ width: "1.5rem" }}
              >
                {person.rank}
              </Text>
              <Avatar size="s" src={person.avatar} />
              <Column fillWidth gap="0">
                <Text variant="label-default-s" truncate>
                  {person.name}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {person.referrals} referrals
                </Text>
              </Column>
            </Row>
          ))}
        </Column>
      </Row>
    </Column>
  );
};
