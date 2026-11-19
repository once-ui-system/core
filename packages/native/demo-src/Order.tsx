import { useState } from "react";
import { ScrollView } from "react-native";
import {
  Button,
  Card,
  Column,
  Dialog,
  Heading,
  ProgressBar,
  RadioGroup,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  useTheme,
  useToast,
} from "../src";

/** An order screen: the pickers, chips, progress and the redeem sheet. */
export function Order({ sheet = false }: { sheet?: boolean }) {
  const theme = useTheme();
  const { addToast } = useToast();
  const [venue, setVenue] = useState<string | string[]>("kazinczy");
  const [size, setSize] = useState("m");
  const [milk, setMilk] = useState("oat");
  const [extras, setExtras] = useState(["Extra shot", "Cinnamon"]);
  const [redeem, setRedeem] = useState(sheet);

  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="20">
        <Tag
          variant="announce"
          label="New: pastries count as stamps"
          prefixIcon="sparkle"
          arrow
          onPress={() => {}}
        />
        <Heading textVariant="heading-strong-l">Your order</Heading>

        <Select
          label="Pick up at"
          value={venue}
          onValueChange={setVenue}
          options={[
            { value: "kazinczy", label: "Kazinczy utca 14", description: "Open until 18:00" },
            { value: "andrassy", label: "Andrássy út 2", description: "Open until 20:00" },
            {
              value: "corvin",
              label: "Corvin sétány 1",
              description: "Closed today",
              disabled: true,
            },
          ]}
        />

        <Column gap="8">
          <Text textVariant="label-default-m">Size</Text>
          <SegmentedControl
            value={size}
            onValueChange={setSize}
            buttons={[
              { value: "s", label: "Small" },
              { value: "m", label: "Medium" },
              { value: "l", label: "Large" },
            ]}
          />
        </Column>

        <RadioGroup
          label="Milk"
          value={milk}
          onValueChange={setMilk}
          options={[
            { value: "whole", label: "Whole milk" },
            { value: "oat", label: "Oat", description: "+200 Ft" },
            { value: "none", label: "No milk" },
          ]}
        />

        <Column gap="8">
          <Text textVariant="label-default-m">Extras</Text>
          <Row gap="8" wrap>
            {extras.map((e) => (
              <Tag
                key={e}
                selected
                label={e}
                prefixIcon="plus"
                onRemove={() => setExtras((list) => list.filter((x) => x !== e))}
              />
            ))}
            <Tag
              label="Vanilla"
              selected={false}
              onPress={() => setExtras((l) => [...l, "Vanilla"])}
            />
          </Row>
        </Column>

        <Card padding="20" gap="12">
          <Row horizontal="between" vertical="center">
            <Text textVariant="label-strong-m">Next reward</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              7 of 10 stamps
            </Text>
          </Row>
          <ProgressBar value={70} />
        </Card>

        <Row gap="8">
          <Button
            label="Place order"
            onPress={() => addToast({ tone: "success", message: "Order placed. See you soon!" })}
          />
          <Button variant="secondary" label="Redeem" onPress={() => setRedeem(true)} />
        </Row>
      </Column>

      <Dialog
        open={redeem}
        onClose={() => setRedeem(false)}
        title="Redeem a free pastry"
        description="Show this at the counter. It works once."
        footer={
          <>
            <Button variant="secondary" label="Later" onPress={() => setRedeem(false)} />
            <Button label="Redeem now" onPress={() => setRedeem(false)} />
          </>
        }
      >
        <Column gap="12" center paddingY="16" radius="l" background="neutral-alpha-weak">
          <Heading textVariant="display-strong-s">MC-4821</Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Valid until 31 October
          </Text>
        </Column>
      </Dialog>
    </ScrollView>
  );
}
