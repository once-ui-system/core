/**
 * Gold example: home
 * Target: a greeting header, the hero panel the app is about (here a
 * loyalty card that fills with stamps), a sheet that opens from it, two
 * stat tiles, a list of next actions, and a skeleton while the data loads.
 */

import {
  Avatar,
  Button,
  Card,
  Column,
  Dialog,
  Heading,
  Icon,
  IconButton,
  type IconName,
  ProgressBar,
  Row,
  Skeleton,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/native";
import { useState } from "react";
import { ScrollView } from "react-native";

const STAMPS_PER_REWARD = 10;

const REWARDS: { id: string; title: string; detail: string; icon: IconName }[] = [
  { id: "pastry", title: "Free pastry", detail: "With any coffee, until Sunday", icon: "gift" },
  { id: "friend", title: "Bring a friend", detail: "You both get a stamp", icon: "person" },
];

function StampCard({ stamps, onShowCode }: { stamps: number; onShowCode: () => void }) {
  const left = STAMPS_PER_REWARD - stamps;
  return (
    <Column
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="20"
      gap="16"
      shadow="s"
    >
      <Row horizontal="between" vertical="center">
        <Text textVariant="label-strong-m">Loyalty card</Text>
        <Tag tone="brand" size="s" label={`${stamps}/${STAMPS_PER_REWARD}`} />
      </Row>
      <Row gap="8" wrap>
        {Array.from({ length: STAMPS_PER_REWARD }, (_, slot) => slot).map((slot) => (
          <Column
            key={`stamp-${slot}`}
            width="40"
            height="40"
            radius="full"
            center
            background={slot < stamps ? "brand-strong" : "neutral-alpha-weak"}
          >
            {slot < stamps && <Icon name="check" size="s" onSolid="brand-strong" />}
          </Column>
        ))}
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-medium">
        {left > 0 ? `${left} more and the next coffee is on us.` : "Your next coffee is free."}
      </Text>
      <Button label="Show my code" prefixIcon="screen" fillWidth onPress={onShowCode} />
    </Column>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Column
      flex={1}
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="16"
      gap="4"
    >
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs">{value}</Text>
    </Column>
  );
}

function HomeSkeleton() {
  return (
    <Column paddingX="20" paddingY="24" gap="24">
      <Row gap="12" vertical="center">
        <Skeleton shape="circle" size="l" />
        <Column flex={1} gap="8">
          <Skeleton shape="line" width="50%" />
          <Skeleton shape="line" width="30%" size="s" />
        </Column>
      </Row>
      <Skeleton shape="block" height={240} />
      <Row gap="12">
        <Skeleton shape="block" height={80} width="50%" />
        <Skeleton shape="block" height={80} width="50%" />
      </Row>
    </Column>
  );
}

export function HomeScreen({ loading = false }: { loading?: boolean }) {
  const { addToast } = useToast();
  const [stamps, setStamps] = useState(7);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <Column fill background="page" safeArea={["top"]}>
      {loading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Column paddingX="20" paddingY="24" gap="24">
            <Row gap="12" vertical="center">
              <Avatar value="AK" size="l" />
              <Column flex={1} gap="2">
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Good morning
                </Text>
                <Heading textVariant="heading-strong-l">Anna</Heading>
              </Column>
              <IconButton icon="bell" variant="tertiary" aria-label="Notifications" />
            </Row>

            <StampCard stamps={stamps} onShowCode={() => setCodeOpen(true)} />

            <Row gap="12">
              <StatTile label="Visits this month" value="12" />
              <StatTile label="Rewards earned" value="3" />
            </Row>

            <Column gap="12">
              <Heading textVariant="heading-strong-m">For you</Heading>
              {REWARDS.map((reward) => (
                <Card
                  key={reward.id}
                  direction="row"
                  padding="16"
                  gap="12"
                  vertical="center"
                  onPress={() => addToast({ tone: "success", message: `${reward.title} saved` })}
                >
                  <Column width="40" height="40" radius="m" center background="brand-alpha-weak">
                    <Icon name={reward.icon} onBackground="brand-strong" />
                  </Column>
                  <Column flex={1} gap="2">
                    <Text textVariant="label-strong-m">{reward.title}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {reward.detail}
                    </Text>
                  </Column>
                  <Icon name="chevronRight" onBackground="neutral-weak" />
                </Card>
              ))}
            </Column>

            <Column gap="8">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Gold status
              </Text>
              <ProgressBar value={64} showLabel={false} />
            </Column>
          </Column>
        </ScrollView>
      )}

      <Dialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        title="Your code"
        description="Show this to the barista to collect a stamp."
        footer={
          <Row gap="12" fillWidth>
            <Button
              variant="secondary"
              label="Close"
              fillWidth
              onPress={() => setCodeOpen(false)}
            />
            <Button
              label="Add stamp"
              fillWidth
              onPress={() => {
                setStamps((count) => Math.min(count + 1, STAMPS_PER_REWARD));
                setCodeOpen(false);
              }}
            />
          </Row>
        }
      >
        <Column center paddingY="24">
          <Column width="160" height="160" radius="l" center background="neutral-alpha-weak">
            <Text textVariant="display-strong-xs">4821</Text>
          </Column>
        </Column>
      </Dialog>
    </Column>
  );
}
