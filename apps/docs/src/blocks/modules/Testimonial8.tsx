"use client";

import {
  Scroller,
  Avatar,
  AvatarGroup,
  Button,
  Column,
  Dialog,
  Heading,
  Line,
  Logo,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

interface Member {
  name: string;
  avatar: string;
  role: string;
}

const members: Member[] = [
  { name: "Alex Rivera", avatar: "/images/avatars/01.png", role: "Product Designer" },
  { name: "Samantha Lee", avatar: "/images/avatars/02.png", role: "Creative Coder" },
  { name: "Kate Chen", avatar: "/images/avatars/03.png", role: "Indie Maker" },
  { name: "Mika Novak", avatar: "/images/avatars/04.png", role: "Freelance Developer" },
  { name: "Mark Ellis", avatar: "/images/avatars/05.png", role: "Agency Owner" },
  { name: "Lily Park", avatar: "/images/avatars/06.png", role: "Freelance Designer" },
  { name: "John Diaz", avatar: "/images/avatars/07.png", role: "Freelance Designer" },
  { name: "Kathrina Voss", avatar: "/images/avatars/08.png", role: "Creative Director" },
];

// Placeholder logos: swap in real ones.
const logos = Array.from({ length: 3 }, () => "/trademarks/wordmark-light.svg");

export const Testimonial8 = (flex: React.ComponentProps<typeof Column>) => {
  const [open, setOpen] = useState(false);
  const previewCount = 5;
  const preview = members.slice(0, previewCount);
  const remaining = members.length - preview.length;

  return (
    <Column fillWidth horizontal="center" gap="32" {...flex}>
      <Column horizontal="center" align="center" gap="16" maxWidth="32rem">
        <Tag size="s" tone="brand" themeBorder="rounded">
          Social proof
        </Tag>
        <Heading as="h2" textVariant="display-strong-s" align="center">
          Loved by 2,400+ builders shipping real products
        </Heading>
      </Column>

      <Row center gap="12" wrap>
        <AvatarGroup avatars={preview.map((member) => ({ src: member.avatar }))} />
        {remaining > 0 && (
          <>
            <Button
              data-scaling="90"
              variant="tertiary"
              weight="default"
              rounded
              size="s"
              onClick={() => setOpen(true)}
            >
              +{remaining} more
            </Button>
            <Dialog
              open={open}
              onClose={() => setOpen(false)}
              title={`${members.length} builders shipping with Once UI`}
              maxHeight="40rem"
              footer={
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Close
                </Button>
              }
            >
              <Column fillWidth gap="8">
                {members.map((member) => (
                  <Row key={member.name} gap="12" vertical="center" paddingY="4">
                    <Avatar size="xs" src={member.avatar} />
                    <Column>
                      <Text textVariant="body-default-s">{member.name}</Text>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {member.role}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Column>
            </Dialog>
          </>
        )}
      </Row>

      <Column fillWidth gap="24" horizontal="center">
        <Line maxWidth="4rem" background="neutral-alpha-medium" />
        <Scroller auto={{ speed: "slow" }} fillWidth gap="40">
          {logos.map((logo, index) => (
            <Logo key={index} wordmark={logo} />
          ))}
        </Scroller>
      </Column>
    </Column>
  );
};
